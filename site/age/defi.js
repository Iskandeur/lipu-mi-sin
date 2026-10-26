// Le mode Défi (v4, sa demande du 26/10 : « un timer ou une série de N photos, le score le plus haut, pour jouer avec mes
// amis »). Deux formes : une série de 5, 10 ou 20 photos, ou une manche de 30, 60 ou 120 secondes. Chaque photo vaut
// 100 points moins 5 par année d'écart. Un défi a un code (`s10-abc123`) : même code, mêmes photos dans le même ordre,
// donc des scores comparables ; le lien `?defi=<code>&battre=<score>` le porte, avec le score à battre.
// Rien n'est envoyé nulle part : le score vit dans ce navigateur et dans le texte que le joueur copie lui-même.
// Le chrono ne tourne que pendant la réflexion : pas pendant le chargement d'une photo ni pendant l'écran de réponse.
(function () {
  "use strict";
  const A = window.AgeApp;
  const S = window.AgeStats;
  if (!A || !S) return;
  const { t, el, lien, ans, montrer, PORTRAITS, params } = A;
  const $ = (id) => document.getElementById(id);
  const CLE = A.DEMO ? "age-trainer:defi-demo" : "age-trainer:defi";
  const MAX_CHRONO = 80; // photos préparées pour une manche chronométrée : bien plus que ce qu'on peut jouer en 120 s

  const meilleurs = () => {
    try {
      const o = JSON.parse(A.lireLocal(CLE) || "{}");
      return o && typeof o === "object" ? o : {};
    } catch {
      return {};
    }
  };
  const graineAleatoire = () => Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  const lettre = (mode) => (mode === "serie" ? "s" : "c");

  let defi = null; // { mode, taille, graine, code, battre }
  let photos = [];
  let i = 0;
  let essais = []; // { p, reel, g, pts }
  let courant = null;
  let saisi = false;
  let revele = false;
  let enCours = false;
  let restant = 0; // secondes (chrono)
  let tic = null;
  let derniereMesure = 0;
  let echecs = 0;

  // ---------- accueil ----------
  const modeChoisi = () => (document.querySelector("input[name=d-mode]:checked") || {}).value === "c" ? "chrono" : "serie";
  function remplirTailles() {
    const m = modeChoisi();
    const liste = S.DEFIS[lettre(m)];
    const sel = $("d-taille");
    const avant = Number(sel.value);
    sel.replaceChildren(...liste.map((n) => el("option", { value: String(n) }, m === "serie" ? t("d.n.photos", { n }) : t("d.n.secondes", { n }))));
    sel.value = String(liste.includes(avant) ? avant : liste[1]);
    $("d-taille-lib").textContent = m === "serie" ? t("d.nb") : t("d.duree");
    majRegle();
  }
  function majRegle() {
    const m = modeChoisi();
    const taille = Number($("d-taille").value);
    $("d-regle").textContent = m === "serie" ? t("d.regle.serie", { n: taille, max: taille * 100 }) : t("d.regle.chrono", { n: taille });
    const best = meilleurs()[lettre(m) + taille];
    $("d-meilleur").hidden = !best;
    if (best) $("d-meilleur").textContent = t("d.meilleur", { score: best.score, n: best.n });
  }
  document.querySelectorAll("input[name=d-mode]").forEach((r) => r.addEventListener("change", remplirTailles));
  $("d-taille").addEventListener("change", majRegle);

  function ecran(nom) {
    $("d-accueil").hidden = nom !== "accueil";
    $("d-jeu").hidden = nom !== "jeu";
    $("d-fin").hidden = nom !== "fin";
  }

  function lienDefi(d, score) {
    const u = new URL(location.href);
    u.search = "";
    u.hash = "";
    u.searchParams.set("defi", d.code);
    if (score != null) u.searchParams.set("battre", String(score));
    return u.href;
  }

  // ---------- partie ----------
  function demarrer(d) {
    defi = d;
    photos = S.tirageDefi(PORTRAITS, d.graine, d.mode === "serie" ? d.taille : MAX_CHRONO);
    i = 0;
    essais = [];
    restant = d.mode === "chrono" ? d.taille : 0;
    echecs = 0;
    enCours = true;
    ecran("jeu");
    $("d-score").textContent = "";
    if (!photos.length) {
      $("d-progres").textContent = t("compteur.vide");
      return;
    }
    suivante();
  }

  const total = () => essais.reduce((s, e) => s + e.pts, 0);
  const curseur = $("d-curseur");

  function recadrer(c) {
    const ok = Array.isArray(c) && c.length === 4 && c[2] > 0 && c[3] > 0;
    const img = $("d-img");
    $("d-recadre").classList.toggle("actif", ok);
    img.style.width = ok ? `${100 / c[2]}%` : "";
    img.style.left = ok ? `${(-100 * c[0]) / c[2]}%` : "";
    img.style.top = ok ? `${(-100 * c[1]) / c[3]}%` : "";
  }

  function majBarre() {
    const m = defi.mode;
    $("d-progres").textContent = m === "serie" ? t("d.photo.n", { i: Math.min(i + 1, photos.length), n: photos.length }) : t("d.photo.k", { k: essais.length });
    $("d-score").textContent = t("d.points", { n: total() });
    $("d-temps").textContent = m === "chrono" ? `${Math.max(0, Math.ceil(restant))} s` : "";
    $("d-temps").classList.toggle("urgent", m === "chrono" && restant <= 10);
  }

  function suivante() {
    if (!enCours) return;
    if (i >= photos.length) return finir();
    courant = photos[i];
    revele = false;
    saisi = false;
    $("d-saisie").hidden = false;
    $("d-reponse").hidden = true;
    $("d-img-erreur").hidden = true;
    curseur.value = "50";
    curseur.classList.add("vierge");
    $("d-valeur").classList.add("vierge");
    $("d-valeur").textContent = "?";
    $("d-valider").disabled = true;
    tampon = "";
    arreterChrono(); // il repart au chargement de l'image
    majBarre();
    const img = $("d-img");
    img.hidden = false;
    recadrer(courant.c);
    img.src = courant.i;
    $("d-attribution").replaceChildren(
      t("attr.photo"), courant.au || t("attr.auteur"), ", ",
      lien(courant.lu, courant.l || t("attr.licence")), t("attr.via"), lien(courant.s, t("attr.source")),
    );
    // La suivante se charge pendant qu'on réfléchit à celle-ci.
    const prochaine = photos[i + 1];
    if (prochaine) new Image().src = prochaine.i;
  }

  $("d-img").addEventListener("load", () => {
    echecs = 0;
    if (enCours && !revele) lancerChrono();
  });
  $("d-img").addEventListener("error", () => {
    if (!enCours || !courant || !$("d-img").getAttribute("src")) return;
    // Une photo qui ne charge pas ne coûte rien : on la saute (le chrono n'a pas démarré). Trois de suite : le chemin est coupé.
    echecs++;
    $("d-img").hidden = true;
    $("d-img-erreur").hidden = false;
    $("d-img-erreur-texte").textContent = echecs >= 3 ? t("img.bloquee") : t("img.indispo");
    // Trois de suite : c'est le chemin, pas la photo. On s'arrête sur « Réessayer » (la photo en cours n'a rien coûté).
    $("d-reessayer").hidden = echecs < 3;
    if (echecs >= 3) return;
    i++;
    setTimeout(() => (i >= photos.length ? finir() : suivante()), 900);
  });

  $("d-reessayer").addEventListener("click", () => {
    echecs = 0;
    $("d-reessayer").hidden = true;
    if (enCours && !revele) suivante();
  });

  // ---------- chrono ----------
  function lancerChrono() {
    if (defi.mode !== "chrono" || tic) return;
    derniereMesure = performance.now();
    tic = setInterval(() => {
      const maintenant = performance.now();
      const depuis = (maintenant - derniereMesure) / 1000;
      derniereMesure = maintenant;
      // Onglet quitté (autre vue de l'appli, ou page en arrière-plan) : le temps ne s'écoule pas.
      if ($("vue-defi").hidden || document.hidden) return;
      restant -= depuis;
      if (restant <= 0) {
        restant = 0;
        majBarre();
        // Le temps est écoulé : une estimation déjà posée compte, sinon la photo en cours est perdue.
        if (!revele && saisi) validerEssai(true);
        finir();
        return;
      }
      majBarre();
    }, 200);
  }
  function arreterChrono() {
    if (tic) clearInterval(tic);
    tic = null;
  }

  // ---------- saisie ----------
  function poser(v) {
    const n = Math.max(1, Math.min(100, Math.round(v)));
    curseur.value = String(n);
    $("d-valeur").textContent = String(n);
    curseur.classList.remove("vierge");
    $("d-valeur").classList.remove("vierge");
    saisi = true;
    $("d-valider").disabled = false;
  }
  curseur.addEventListener("input", () => poser(Number(curseur.value)));
  $("d-moins").addEventListener("click", () => { if (!revele) poser(Number(curseur.value) - (saisi ? 1 : 0)); });
  $("d-plus").addEventListener("click", () => { if (!revele) poser(Number(curseur.value) + (saisi ? 1 : 0)); });

  function validerEssai(sansAffichage) {
    if (!enCours || !courant || !saisi || revele) return;
    revele = true;
    arreterChrono();
    const g = Number(curseur.value);
    const reel = S.ageReel(courant.a);
    const e = g - reel;
    const pts = S.points(e);
    essais.push({ p: courant, reel, g, pts });
    i++;
    majBarre();
    if (sansAffichage) return;
    $("d-saisie").hidden = true;
    $("d-reponse").hidden = false;
    const v = $("d-verdict");
    v.className = "verdict " + (e > 0 ? "plus" : e < 0 ? "moins" : "");
    v.textContent = e === 0 ? t("pile", { age: ans(reel) }) : `${e > 0 ? "+" : "−"}${ans(Math.abs(e))}`;
    $("d-detail").textContent = t("d.detail", { age: ans(reel), g, pts });
    const annee = (d) => (d || "").slice(0, 4);
    $("d-qui").replaceChildren(
      lien(courant.q ? `https://www.wikidata.org/wiki/${courant.q}` : null, courant.n || courant.q || "?"),
      t("qui", { naissance: annee(courant.d), photo: annee(courant.t) }),
    );
    $("d-suivante").textContent = defi.mode === "serie" && i >= photos.length ? t("d.resultat") : t("suivante");
    $("d-suivante").focus();
  }
  $("d-valider").addEventListener("click", () => validerEssai(false));
  $("d-suivante").addEventListener("click", () => suivante());

  // Clavier : chiffres = l'âge, Entrée = valider puis suivante (comme S'entraîner).
  let tampon = "";
  let tamponT = 0;
  document.addEventListener("keydown", (ev) => {
    if ($("vue-defi").hidden || $("d-jeu").hidden || !enCours || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const cible = ev.target;
    if (cible instanceof Element && cible.closest("select, input[type=text]")) return;
    if (ev.key === "Enter" && cible instanceof Element && cible.closest("button, a") && !["d-valider", "d-suivante", "d-moins", "d-plus"].includes(cible.id)) return;
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (revele) suivante();
      else validerEssai(false);
      return;
    }
    if (!revele && /^[0-9]$/.test(ev.key)) {
      const ts = Date.now();
      tampon = ts - tamponT < 900 && tampon.length < 3 ? tampon + ev.key : ev.key;
      tamponT = ts;
      if (Number(tampon) >= 1) poser(Number(tampon));
    }
  });

  // ---------- fin ----------
  function finir() {
    if (!enCours) return;
    enCours = false;
    arreterChrono();
    const score = total();
    const n = essais.length;
    const maxi = defi.mode === "serie" ? defi.taille * 100 : null;
    const mae = n ? essais.reduce((s, e) => s + Math.abs(e.g - e.reel), 0) / n : null;
    // Le meilleur de ce navigateur, par forme de défi (série de 10, 60 secondes…), pas par graine.
    const cle = lettre(defi.mode) + defi.taille;
    const tous = meilleurs();
    const record = !tous[cle] || score > tous[cle].score;
    if (record && n) {
      tous[cle] = { score, n, t: Date.now() };
      A.ecrireLocal(CLE, JSON.stringify(tous));
    }
    ecran("fin");
    $("d-fin-titre").textContent = defi.mode === "serie" ? t("d.fin.serie", { n: defi.taille }) : t("d.fin.chrono", { n: defi.taille });
    $("d-fin-score").textContent = maxi ? t("d.score.sur", { score, max: maxi }) : t("d.score.seul", { score, n });
    const lignes = [mae == null ? t("d.rien") : t("d.fin.ecart", { mae: A.un(mae) })];
    if (defi.battre != null) lignes.push(score > defi.battre ? t("d.bat", { b: defi.battre }) : score === defi.battre ? t("d.egal", { b: defi.battre }) : t("d.perdu", { b: defi.battre }));
    if (record && n && !A.DEMO) lignes.push(t("d.record"));
    $("d-fin-detail").textContent = lignes.join(" · ");
    const carres = essais.map((e) => S.carre(e.g - e.reel)).join("");
    $("d-fin-carres").textContent = carres;
    const texte = [
      defi.mode === "serie" ? t("d.txt.serie", { n: defi.taille, score, max: maxi }) : t("d.txt.chrono", { n: defi.taille, score, k: n }),
      carres,
      t("d.txt.bats", { url: lienDefi(defi, score) }),
    ].join("\n");
    $("d-partage").value = texte;
    $("d-etat").hidden = true;
    $("d-envoyer").hidden = !navigator.share;
    // Le détail des photos : ce qu'on a répondu, ce que c'était (les noms viennent du jeu de données : textContent).
    const liste = $("d-liste");
    liste.replaceChildren(...essais.map((e) => el("span", { class: "d-ligne" }, `${S.carre(e.g - e.reel)} ${e.p.n || e.p.q || "?"} : ${e.g} / ${e.reel} (${e.pts})`)));
  }

  function dire(texte) {
    $("d-etat").hidden = false;
    $("d-etat").textContent = texte;
  }
  $("d-copier").addEventListener("click", async () => {
    const texte = $("d-partage").value;
    try {
      await navigator.clipboard.writeText(texte);
      dire(t("d.copie"));
    } catch {
      $("d-partage").focus();
      $("d-partage").select();
      dire(t("d.copie.manuel"));
    }
  });
  $("d-envoyer").addEventListener("click", async () => {
    try {
      await navigator.share({ text: $("d-partage").value });
    } catch {
      /* annulé par le joueur */
    }
  });
  $("d-rejouer").addEventListener("click", () => demarrer({ ...defi, battre: defi.battre }));
  $("d-nouveau").addEventListener("click", () => {
    defi = null;
    $("d-recu").hidden = true;
    ecran("accueil");
    majRegle();
  });
  $("d-jouer").addEventListener("click", () => {
    const m = modeChoisi();
    const taille = Number($("d-taille").value);
    // Un défi reçu garde son code (mêmes photos que l'ami) tant qu'on ne change pas la forme ; sinon une graine neuve.
    const recu = defi && defi.recu && defi.mode === m && defi.taille === taille ? defi : null;
    const graine = recu ? recu.graine : graineAleatoire();
    demarrer({ mode: m, taille, graine, code: `${lettre(m)}${taille}-${graine}`, battre: recu ? recu.battre : null, recu: !!recu });
  });

  // ---------- arrivée par un lien ----------
  remplirTailles();
  ecran("accueil");
  const recu = S.lireCodeDefi(params.get("defi"));
  if (recu) {
    const b = Number(params.get("battre"));
    defi = { ...recu, battre: Number.isFinite(b) && params.get("battre") !== null && b >= 0 && b <= 100 * 120 ? b : null, recu: true };
    document.querySelector(`input[name=d-mode][value=${lettre(recu.mode)}]`).checked = true;
    remplirTailles();
    $("d-taille").value = String(recu.taille);
    majRegle();
    $("d-recu").hidden = false;
    $("d-recu").textContent = defi.battre != null ? t("d.recu.battre", { b: defi.battre }) : t("d.recu");
    montrer("defi");
  }
  // ?demo=defi : une série de 5 jouée d'avance, pour les captures de l'écran de fin.
  if (A.DEMO === "defi") {
    const d = { mode: "serie", taille: 5, graine: "demo42", code: "s5-demo42", battre: 310 };
    montrer("defi");
    demarrer(d);
    for (const delta of [0, 3, -7, 12, -2]) {
      courant = photos[i];
      revele = false;
      poser(S.ageReel(courant.a) + delta);
      validerEssai(true);
    }
    finir();
  }
})();
