// L'appli : quatre vues (S'entraîner, Défi, Apprendre, Mes stats ; le Défi vit dans src/defi.js), progression dans localStorage.
// Les champs des portraits (auteur, nom…) sont des données : toujours posés par textContent, jamais en HTML.
// v3 : bilingue FR/EN (src/i18n.js) et bouton « Âge douteux ? » (signalement envoyé à la collecte de l'aperçu).
(function () {
  "use strict";
  const S = window.AgeStats;
  const I = window.AgeI18n;
  const PORTRAITS = window.PORTRAITS || [];
  // config.js : la version publique (`node scripts/build.mjs --public`) n'a aucune collecte derrière _signalement, donc pas de bouton.
  const SIGNALEMENT = !(window.AGE_CONFIG && window.AGE_CONFIG.signalement === false);
  const params = new URLSearchParams(location.search);
  // ?demo=… (captures) : un état fabriqué, rangé sous une autre clé pour ne jamais toucher la vraie progression.
  const DEMO = params.get("demo");
  const CLE = DEMO ? "age-trainer:demo" : "age-trainer:v1";
  const CLE_FILE = "age-trainer:signalements"; // signalements pas encore reçus par la collecte

  const lireLocal = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const ecrireLocal = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* stockage plein ou interdit */
    }
  };

  // ---------- langue ----------
  // ?lang=fr|en (captures), sinon le choix gardé, sinon le navigateur (fr* → français, le reste → anglais).
  const L = I.choisirLangue(params.get("lang") || lireLocal(I.CLE), navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]);
  const t = (cle, vars) => I.traduire(L, cle, vars);
  document.documentElement.lang = L;
  document.title = t("titre");
  for (const n of document.querySelectorAll("[data-i18n]")) n.textContent = t(n.dataset.i18n);
  for (const [attr, cle] of [["alt", "i18nAlt"], ["title", "i18nTitle"], ["aria-label", "i18nAriaLabel"], ["placeholder", "i18nPlaceholder"]]) {
    for (const n of document.querySelectorAll(`[data-${attr === "aria-label" ? "i18n-aria-label" : "i18n-" + attr}]`)) n.setAttribute(attr, t(n.dataset[cle]));
  }
  const choixLangue = document.getElementById("langue");
  choixLangue.value = L;
  choixLangue.addEventListener("change", () => {
    ecrireLocal(I.CLE, choixLangue.value);
    // Un rechargement : tout le texte (fiches, courbe, menus) repart dans la nouvelle langue, la progression est gardée.
    const u = new URL(location.href);
    u.searchParams.delete("lang");
    location.replace(u.href);
  });
  const FICHES = (L === "en" ? window.FICHES_EN : window.FICHES) || window.FICHES || [];
  const NIVEAUX = S.niveaux(L);

  // Tirage : Math.random, ou une suite déterministe si ?graine=N (captures reproductibles).
  let rng = Math.random;
  if (params.has("graine")) {
    let x = Number(params.get("graine")) >>> 0 || 1;
    rng = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
  }

  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, ...enfants) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") n.className = v;
      else n.setAttribute(k, v);
    }
    for (const e of enfants) if (e != null) n.append(e);
    return n;
  };
  const lien = (url, texte) => (typeof url === "string" && url.startsWith("https://") ? el("a", { href: url, target: "_blank", rel: "noopener" }, texte) : texte);
  const ans = (n) => `${n} ${Math.abs(n) >= 2 ? t("ans") : t("an")}`;
  const un = (x) => (x == null ? "–" : L === "fr" ? x.toFixed(1).replace(".", ",") : x.toFixed(1));

  $("pied").replaceChildren(...t("pied").split(/(\{commons\}|\{wikidata\})/).map((m) =>
    m === "{commons}" ? lien("https://commons.wikimedia.org", "Wikimedia Commons") : m === "{wikidata}" ? lien("https://www.wikidata.org", "Wikidata") : m));

  // ---------- état ----------
  function charger() {
    try {
      const o = JSON.parse(lireLocal(CLE) || "{}");
      const tranche = S.TRANCHES.includes(o.tranche) ? o.tranche : "";
      return { hist: Array.isArray(o.hist) ? o.hist : [], vus: new Set(o.vus || []), exclus: new Set(o.exclus || []), doutes: new Set(o.doutes || []), niveau: [1, 2, 3].includes(o.niveau) ? o.niveau : 1, tranche };
    } catch {
      return { hist: [], vus: new Set(), exclus: new Set(), doutes: new Set(), niveau: 1, tranche: "" };
    }
  }
  function sauver() {
    ecrireLocal(CLE, JSON.stringify({ hist: etat.hist, vus: [...etat.vus], exclus: [...etat.exclus], doutes: [...etat.doutes], niveau: etat.niveau, tranche: etat.tranche }));
  }
  if (DEMO) {
    try {
      localStorage.removeItem(CLE);
    } catch {
      /* stockage interdit */
    }
  }
  if (DEMO && PORTRAITS.length) {
    // Un historique plausible : 60 essais, biais vers le milieu (jeunes vieillis, âgés rajeunis), erreur qui baisse,
    // niveau 1 jusqu'au 18e essai, 2 jusqu'au 40e, puis 3 (chaque montée remonte un peu l'erreur).
    let y = 7;
    const r = () => ((y = (Math.imul(y, 1664525) + 1013904223) >>> 0) / 4294967296);
    const hist = [];
    for (let i = 0; i < 60; i++) {
      const v = i < 18 ? 1 : i < 40 ? 2 : 3;
      const pool = PORTRAITS.filter((p) => S.niveauDe(p) <= v);
      const p = pool[Math.floor(r() * pool.length)];
      const tire = (45 - p.a) * (0.35 - i / 400);
      const bruit = (r() - 0.5) * (16 - i / 6) * (v === 1 ? 0.7 : 1);
      hist.push({ q: p.q, a: p.a, g: Math.max(1, Math.min(100, Math.round(p.a + tire + bruit))), t: Date.now() - (60 - i) * 60000, v });
    }
    ecrireLocal(CLE, JSON.stringify({ hist, vus: hist.map((h) => h.q), exclus: [], niveau: 3, tranche: "" }));
  }
  const etat = charger();
  let courant = null;
  let dernier = null; // le dernier essai validé : ce que « Âge douteux ? » signale
  let saisi = false;
  let revele = false;
  // Ce qui ne se tire plus : photos inutilisables et âges signalés douteux.
  const horsTirage = () => new Set([...etat.exclus, ...etat.doutes]);

  // ---------- onglets ----------
  const vues = { jouer: $("vue-jouer"), defi: $("vue-defi"), apprendre: $("vue-apprendre"), bilan: $("vue-bilan") };
  function montrer(nom) {
    for (const [k, v] of Object.entries(vues)) {
      v.hidden = k !== nom;
      $("tab-" + k).setAttribute("aria-selected", String(k === nom));
    }
    if (nom === "bilan") rendreBilan();
  }
  for (const k of Object.keys(vues)) $("tab-" + k).addEventListener("click", () => montrer(k));
  // Ce que le mode Défi (src/defi.js) emprunte à l'appli : la langue, les aides de rendu, le changement d'onglet.
  window.AgeApp = { L, t, el, lien, ans, un, montrer, PORTRAITS, params, DEMO, lireLocal, ecrireLocal };

  // ---------- S'entraîner ----------
  const img = $("img");
  // Le cadrage sur le visage, calculé au build (`c` = [x0, y0, largeur, hauteur] en fractions de l'image, en 4:5) :
  // l'image entière est agrandie dans une fenêtre 4:5 et décalée, rien n'est recalculé ici. Sans `c`, l'image entière.
  function recadrer(c) {
    const ok = Array.isArray(c) && c.length === 4 && c[2] > 0 && c[3] > 0;
    $("recadre").classList.toggle("actif", ok);
    img.style.width = ok ? `${100 / c[2]}%` : "";
    img.style.left = ok ? `${(-100 * c[0]) / c[2]}%` : "";
    img.style.top = ok ? `${(-100 * c[1]) / c[3]}%` : "";
  }
  const curseur = $("curseur");
  const valeur = $("valeur");

  function attribution(p) {
    const fig = $("attribution");
    fig.replaceChildren(
      t("attr.photo"), p.au || t("attr.auteur"), ", ",
      lien(p.lu, p.l || t("attr.licence")),
      t("attr.via"),
      lien(p.s, t("attr.source")),
    );
  }

  // Le menu « Travailler », dans la langue.
  const choixTranche = $("tranche");
  choixTranche.replaceChildren(
    el("option", { value: "" }, t("tranche.toutes")),
    ...S.TRANCHES.map((tr) => el("option", { value: tr }, tr === "<20" || tr === "70+" ? t("tranche." + tr) : t("tranche.x", { t: tr }))),
  );

  // Ce qu'on tire : la tranche choisie (option C), sinon les portraits du niveau courant et des niveaux en dessous.
  const garder = () => (etat.tranche ? (p) => S.trancheDe(p.a) === etat.tranche : (p) => S.niveauDe(p) <= etat.niveau);

  function rendreNiveau() {
    const zone = $("niveau");
    if (etat.tranche) {
      zone.textContent = t("niveau.tranche");
      return;
    }
    const n = NIVEAUX[etat.niveau - 1];
    const pr = S.progression(etat.hist, etat.niveau);
    let suite = "";
    if (etat.niveau < 3) suite = pr.reste > 0 ? t("niveau.reste", { k: pr.reste }) : t("niveau.mae", { mae: un(pr.mae) });
    zone.replaceChildren(el("b", {}, t("niveau.titre", { n: n.n, nom: n.nom })), ` (${n.detail})${suite}`);
  }

  let echecsDeSuite = 0;

  function nouveau() {
    const hors = horsTirage();
    const { portrait, recommence } = S.tirer(PORTRAITS, etat.vus, hors, rng, garder());
    if (recommence) etat.vus.clear();
    courant = portrait;
    revele = false;
    saisi = false;
    $("saisie").hidden = false;
    $("reponse").hidden = true;
    $("img-erreur").hidden = true;
    fermerDoute();
    // Les chiffres tapés pour le portrait précédent ne se collent pas au suivant (« 35 », Entrée, Entrée, « 4 » donnait 100).
    tampon = "";
    rendreNiveau();
    curseur.value = "50";
    curseur.classList.add("vierge");
    valeur.classList.add("vierge");
    valeur.textContent = "?";
    $("valider").disabled = true;
    const g = garder();
    const disponibles = PORTRAITS.filter((p) => g(p) && !hors.has(p.q)).length;
    $("compteur").textContent = t("compteur", { i: etat.hist.length + 1, n: disponibles });
    if (!courant) {
      $("compteur").textContent = t("compteur.vide");
      img.hidden = true;
      img.removeAttribute("src");
      $("attribution").replaceChildren();
      $("inutilisable").disabled = true;
      return;
    }
    $("inutilisable").disabled = false;
    img.hidden = false;
    recadrer(courant.c);
    img.src = courant.i;
    attribution(courant);
    rendreMini();
  }

  // Une image qui ne charge pas : on passe à la suivante. Trois de suite, ce n'est plus la photo mais le chemin (réseau
  // coupé, page qui bloque les images : le bug du 26/10, où l'aperçu refusait toute image Wikimedia et l'appli tournait
  // en rond en marquant tout le jeu « vu ») : on s'arrête et on le dit.
  img.addEventListener("load", () => {
    echecsDeSuite = 0;
  });
  img.addEventListener("error", () => {
    if (!courant || !img.getAttribute("src")) return;
    img.hidden = true;
    $("img-erreur").hidden = false;
    echecsDeSuite++;
    if (echecsDeSuite >= 3) {
      $("img-erreur-texte").textContent = t("img.bloquee");
      $("reessayer").hidden = false;
      return;
    }
    $("img-erreur-texte").textContent = t("img.indispo");
    etat.vus.add(courant.q);
    setTimeout(nouveau, 1200);
  });
  $("reessayer").addEventListener("click", () => {
    echecsDeSuite = 0;
    $("reessayer").hidden = true;
    nouveau();
  });
  choixTranche.value = etat.tranche;
  choixTranche.addEventListener("change", () => {
    etat.tranche = S.TRANCHES.includes(choixTranche.value) ? choixTranche.value : "";
    sauver();
    if (!revele) nouveau();
    else rendreNiveau();
  });

  function poser(v) {
    const n = Math.max(1, Math.min(100, Math.round(v)));
    curseur.value = String(n);
    valeur.textContent = String(n);
    curseur.classList.remove("vierge");
    valeur.classList.remove("vierge");
    saisi = true;
    $("valider").disabled = false;
  }
  curseur.addEventListener("input", () => poser(Number(curseur.value)));
  // −/+ : l'ajustement fin au doigt, qu'un curseur de 100 crans sur un téléphone ne permet pas.
  $("moins").addEventListener("click", () => { if (!revele) poser(Number(curseur.value) - (saisi ? 1 : 0)); });
  $("plus").addEventListener("click", () => { if (!revele) poser(Number(curseur.value) + (saisi ? 1 : 0)); });

  function valider() {
    if (!courant || !saisi || revele) return;
    revele = true;
    const g = Number(curseur.value);
    const reel = S.ageReel(courant.a);
    const e = g - reel;
    dernier = { p: courant, reel, g };
    const tranche = S.trancheDe(courant.a);
    const recentes = etat.hist.filter((h) => S.trancheDe(h.a) === tranche).slice(-2).map((h) => h.g - S.ageReel(h.a));
    const vers = (id, libelle) => {
      const fiche = FICHES.find((f) => f.id === id);
      const aller = el("a", { href: "#fiche-" + id, title: fiche ? fiche.titre : id }, libelle || t("conseil.relire", { titre: fiche ? fiche.titre : id }));
      aller.addEventListener("click", (ev) => {
        ev.preventDefault();
        montrer("apprendre");
        const cible = $("fiche-" + id);
        if (cible) cible.scrollIntoView({ block: "start" });
      });
      return aller;
    };
    // L'indice (où regarder la prochaine fois) ; le conseil d'avant ne s'ajoute que s'il dit autre chose (photo
    // ancienne, biais qui se répète), sinon les deux renverraient à la même fiche.
    const ind = S.indice(reel, g, L);
    const zoneIndice = $("indice");
    zoneIndice.hidden = false;
    if (!ind) zoneIndice.replaceChildren(el("p", {}, t("indice.rien")));
    // Une ligne (son choix 2B) : l'indice, puis un lien court vers la fiche ; « indice général » passe en infobulle.
    else zoneIndice.replaceChildren(el("p", { title: ind.cadre }, ind.texte + " ", vers(ind.fiche, t("indice.fiche"))));
    let c = S.conseil(reel, g, Number((courant.t || "").slice(0, 4)) || null, recentes, L);
    const repete = c && recentes.filter((x) => Math.sign(x) === Math.sign(e) && Math.abs(x) >= 5).length >= 2;
    if (c && ind && c.fiche === ind.fiche && !repete) c = null;
    const zoneConseil = $("conseil");
    zoneConseil.hidden = !c;
    if (c) zoneConseil.replaceChildren(c.texte + " ", ...(ind && c.fiche === ind.fiche ? [] : [vers(c.fiche)]));
    // v : le niveau de l'essai (0 = tranche choisie, ne compte pas pour la progression).
    etat.hist.push({ q: courant.q, a: courant.a, g, t: Date.now(), v: etat.tranche ? 0 : etat.niveau });
    etat.vus.add(courant.q);
    const zoneMontee = $("montee");
    zoneMontee.hidden = true;
    if (!etat.tranche) {
      const pr = S.progression(etat.hist, etat.niveau);
      if (pr.monte) {
        etat.niveau = pr.niveau;
        const n = NIVEAUX[pr.niveau - 1];
        zoneMontee.textContent = t("montee", { n: n.n, nom: n.nom, detail: n.detail });
        zoneMontee.hidden = false;
      }
    }
    sauver();
    rendreNiveau();
    $("saisie").hidden = true;
    $("reponse").hidden = false;
    $("doute").hidden = !SIGNALEMENT;
    $("doute").disabled = etat.doutes.has(courant.q);
    const verdict = $("verdict");
    verdict.className = "verdict " + (e > 0 ? "plus" : e < 0 ? "moins" : "");
    verdict.textContent = e === 0 ? t("pile", { age: ans(reel) }) : `${e > 0 ? "+" : "−"}${ans(Math.abs(e))}`;
    $("detail").textContent = e === 0 ? t("detail.exact", { g }) : t(e > 0 ? "detail.vieilli" : "detail.rajeuni", { age: ans(reel), g });
    const annee = (d) => (d || "").slice(0, 4);
    $("qui").replaceChildren(
      lien(courant.q ? `https://www.wikidata.org/wiki/${courant.q}` : null, courant.n || courant.q || "?"),
      t("qui", { naissance: annee(courant.d), photo: annee(courant.t) }),
    );
    rendreMini();
    $("suivante").focus();
  }
  $("valider").addEventListener("click", valider);
  $("suivante").addEventListener("click", nouveau);
  $("inutilisable").addEventListener("click", () => {
    if (!courant) return;
    etat.exclus.add(courant.q);
    sauver();
    nouveau();
  });

  // ---------- Âge douteux ? ----------
  // Le signalement part vers la collecte de l'aperçu privé (POST ./_signalement ; absente de cette version publique). Il est d'abord rangé dans une file locale : sans réseau,
  // ou en file:// où il n'y a pas de collecte, il reste là et repart au prochain chargement. Le portrait sort tout de
  // suite du tirage de ce navigateur ; pour tout le monde, au prochain build (scripts/reevaluer.mjs).
  const lireFile = () => {
    try {
      const f = JSON.parse(lireLocal(CLE_FILE) || "[]");
      return Array.isArray(f) ? f : [];
    } catch {
      return [];
    }
  };
  async function envoyer(s) {
    if (location.protocol !== "https:" && location.protocol !== "http:") return false;
    try {
      const r = await fetch("_signalement", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(s), credentials: "same-origin" });
      return r.ok;
    } catch {
      return false;
    }
  }
  async function viderFile() {
    const file = lireFile();
    if (!file.length) return true;
    const restent = [];
    for (const s of file) if (!(await envoyer(s))) restent.push(s);
    ecrireLocal(CLE_FILE, JSON.stringify(restent.slice(-200)));
    return !restent.length;
  }
  function fermerDoute() {
    $("doute-form").hidden = true;
    $("doute-etat").hidden = true;
    $("doute").hidden = !SIGNALEMENT;
  }
  $("doute").addEventListener("click", () => {
    if (!dernier) return;
    if (etat.doutes.has(dernier.p.q)) {
      $("doute-etat").textContent = t("doute.deja");
      $("doute-etat").hidden = false;
      return;
    }
    $("doute-form").hidden = false;
    $("doute").hidden = true;
    $("doute-note").value = "";
    $("doute-form").querySelector("input[name=motif]").focus();
  });
  $("doute-annuler").addEventListener("click", fermerDoute);
  // Entrée dans le champ ou sur un motif envoie le signalement, pas « Suivante ».
  $("doute-form").addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter" && ev.target instanceof Element && ev.target.matches("input")) {
      ev.preventDefault();
      signaler();
    }
  });
  $("doute-envoyer").addEventListener("click", () => signaler());
  async function signaler() {
    if (!dernier || $("doute-form").hidden) return;
    const p = dernier.p;
    const motif = ($("doute-form").querySelector("input[name=motif]:checked") || {}).value || "autre";
    const s = {
      q: p.q, n: p.n || null, age: dernier.reel, ageExact: p.a, estimation: dernier.g, naissance: p.d || null, photo: p.t || null,
      source: p.s || null, motif, note: $("doute-note").value.trim().slice(0, 200), t: new Date().toISOString(), langue: L, v: 3,
      ...(DEMO ? { demo: true } : {}),
    };
    etat.doutes.add(p.q);
    sauver();
    ecrireLocal(CLE_FILE, JSON.stringify([...lireFile(), s].slice(-200)));
    $("doute-form").hidden = true;
    $("doute").hidden = false;
    $("doute").disabled = true;
    $("doute-etat").hidden = false;
    $("doute-etat").textContent = "…";
    const ok = await viderFile();
    $("doute-etat").textContent = t(ok ? "doute.envoye" : "doute.attente");
    $("suivante").focus();
  }

  // Clavier : chiffres = l'âge (deux chiffres tapés vite = un nombre), Entrée = valider puis suivante, flèches via le curseur.
  let tampon = "";
  let tamponT = 0;
  document.addEventListener("keydown", (ev) => {
    if (vues.jouer.hidden || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    // Entrée sur un autre bouton ou un lien garde son sens (« Photo inutilisable » s'active au clavier).
    const cible = ev.target;
    // Un chiffre ou Entrée dans un menu ou un champ de texte reste à ce menu ou ce champ.
    if (cible instanceof Element && cible.closest("select, input[type=text]")) return;
    if (ev.key === "Enter" && cible instanceof Element && cible.closest("button, a") &&!["valider", "suivante", "moins", "plus"].includes(cible.id)) return;
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (revele) nouveau();
      else valider();
      return;
    }
    if (!revele && /^[0-9]$/.test(ev.key)) {
      const ts = Date.now();
      tampon = ts - tamponT < 900 && tampon.length < 3 ? tampon + ev.key : ev.key;
      tamponT = ts;
      if (Number(tampon) >= 1) poser(Number(tampon));
    }
  });

  function rendreMini() {
    const r = S.resumer(etat.hist);
    const zone = $("mini");
    if (!r.n) {
      zone.replaceChildren(el("p", { class: "vide" }, t("mini.vide")));
      return;
    }
    const chiffre = (titre, v) => el("div", {}, el("b", {}, v), titre);
    zone.replaceChildren(el("div", { class: "chiffres" },
      chiffre(t("mini.erreur"), `${un(r.mae)} ${t("ans")}`),
      chiffre(t("mini.recents"), `${un(r.recents)} ${t("ans")}`),
      chiffre(t("mini.essais"), String(r.n)),
    ));
  }

  // ---------- Mes stats ----------
  function barre(biais) {
    const b = el("div", { class: "barre" });
    if (biais == null) return b;
    const largeur = Math.min(50, (Math.abs(biais) / 15) * 50);
    const s = el("span");
    s.style.width = largeur + "%";
    s.style.left = biais >= 0 ? "50%" : 50 - largeur + "%";
    s.style.background = biais >= 0 ? "var(--vieux)" : "var(--jeune)";
    b.append(s);
    return b;
  }
  /**
   * La courbe de précision : l'écart moyen glissant sur 10 essais (un point par essai), axe des ans gradué de 5 en 5,
   * numéros d'essai en abscisse, et un trait pointillé à chaque montée de niveau. Plus bas = plus juste.
   */
  function courbe(points, montees, total, largeur) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    // Le SVG est dessiné à la largeur réelle de son bloc : les étiquettes gardent 11 px sur un téléphone.
    const W = Math.round(Math.max(280, Math.min(1000, largeur || 640))), H = 240, G = 40, D = 14, HAUT = 24, BAS = 30;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "courbe");
    svg.setAttribute("role", "img");
    const dernierPoint = points[points.length - 1];
    svg.setAttribute("aria-label", t("courbe.label", { debut: un(points[0].mae), fin: un(dernierPoint.mae) }));
    const n = (tag, attrs, texte) => {
      const e = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      if (texte != null) e.textContent = texte;
      svg.append(e);
      return e;
    };
    const max = Math.max(10, Math.ceil(Math.max(...points.map((p) => p.mae)) / 5) * 5);
    const premier = points.length === 1 ? 1 : points[0].i;
    const fin = Math.max(premier + 1, total);
    const x = (i) => G + ((i - premier) / (fin - premier)) * (W - G - D);
    const y = (v) => H - BAS - (v / max) * (H - BAS - HAUT);
    for (let v = 0; v <= max; v += 5) {
      n("line", { x1: G, x2: W - D, y1: y(v), y2: y(v), class: v === 0 ? "axe" : "grille" });
      n("text", { x: G - 8, y: y(v) + 4, "text-anchor": "end", class: "etiquette" }, String(v));
    }
    n("text", { x: G - 8, y: HAUT - 12, "text-anchor": "end", class: "etiquette" }, t("courbe.ans"));
    const pas = Math.max(10, Math.ceil((fin - premier) / 6 / 10) * 10);
    for (let i = Math.ceil(premier / pas) * pas; i <= fin; i += pas) {
      n("text", { x: x(i), y: H - BAS + 18, "text-anchor": "middle", class: "etiquette" }, String(i));
    }
    n("text", { x: W - D, y: H - 2, "text-anchor": "end", class: "etiquette" }, t("courbe.essai"));
    for (const m of montees) {
      if (m.i < premier) continue;
      n("line", { x1: x(m.i), x2: x(m.i), y1: HAUT, y2: H - BAS, class: "montee-trait" });
      n("text", { x: x(m.i) + 4, y: HAUT + 10, class: "etiquette" }, t("courbe.niveau", { n: m.v }));
    }
    if (points.length > 1) n("polyline", { points: points.map((p) => `${x(p.i)},${y(p.mae)}`).join(" "), class: "trace" });
    n("circle", { cx: x(dernierPoint.i), cy: y(dernierPoint.mae), r: 4.5, class: "point" });
    // L'étiquette du dernier point, au-dessus du tracé et détourée (paint-order) pour rester lisible sur la ligne.
    const yFin = y(dernierPoint.mae);
    n("text", { x: x(dernierPoint.i), y: yFin > HAUT + 30 ? yFin - 14 : yFin + 22, "text-anchor": "end", class: "valeur-fin" }, `${un(dernierPoint.mae)} ${t("ans")}`);
    return svg;
  }

  function blocPrecision() {
    const points = S.glissante(etat.hist, 10);
    const bloc = el("div", { class: "bloc precision" }, el("h2", {}, t("precision.titre")));
    if (!points.length) {
      bloc.append(el("p", { class: "vide" }, t("precision.vide")));
      return bloc;
    }
    const montees = [];
    let haut = 0;
    etat.hist.forEach((h, j) => {
      if (h.v > haut) {
        if (haut > 0) montees.push({ i: j + 1, v: h.v });
        haut = h.v;
      }
    });
    bloc.append(courbe(points, montees, etat.hist.length, $("bilan").clientWidth - 36));
    const abs = etat.hist.map((h) => Math.abs(h.g - S.ageReel(h.a)));
    const moy = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const legende = abs.length >= 20
      ? t("precision.20", { debut: un(moy(abs.slice(0, 10))), fin: un(moy(abs.slice(-10))) })
      : abs.length < 10
        ? t("precision.moins10", { n: abs.length })
        : t("precision.10");
    bloc.append(el("p", { class: "vide" }, legende + (montees.length ? t("precision.montees") : "")));
    return bloc;
  }

  function rendreBilan() {
    const r = S.resumer(etat.hist);
    const zone = $("bilan");
    if (!r.n) {
      zone.replaceChildren(el("p", { class: "vide" }, t("bilan.vide")));
      return;
    }
    const lignes = S.TRANCHES.map((tr) => {
      const x = r.parTranche[tr];
      const sens = x.biais == null ? "" : x.biais > 0.5 ? t("bilan.vieillit", { x: un(x.biais) }) : x.biais < -0.5 ? t("bilan.rajeunit", { x: un(-x.biais) }) : t("bilan.juste");
      return el("tr", {}, el("td", {}, tr), el("td", {}, String(x.n)), el("td", {}, x.mae == null ? "–" : un(x.mae)), el("td", {}, barre(x.biais)), el("td", {}, sens));
    });
    const tableau = el("table", { class: "tranches" },
      el("thead", {}, el("tr", {}, el("th", {}, t("bilan.th.tranche")), el("th", {}, t("bilan.th.essais")), el("th", {}, t("bilan.th.erreur")), el("th", {}, t("bilan.th.biais")), el("th", {}, ""))),
      el("tbody", {}, ...lignes));
    const sens = r.biais > 0.5 ? t("bilan.sens.vieillit", { x: un(r.biais) }) : r.biais < -0.5 ? t("bilan.sens.rajeunit", { x: un(-r.biais) }) : t("bilan.sens.neutre");
    const reset = el("button", { class: "discret" }, t("bilan.effacer"));
    reset.addEventListener("click", () => {
      if (!confirm(t("bilan.effacer.confirm"))) return;
      etat.hist = [];
      etat.niveau = 1;
      etat.vus.clear();
      etat.exclus.clear();
      etat.doutes.clear();
      sauver();
      rendreBilan();
      nouveau();
    });
    const niv = NIVEAUX[etat.niveau - 1];
    zone.replaceChildren(
      blocPrecision(),
      el("div", { class: "bilan-grille" },
        el("div", { class: "bloc" }, el("h2", {}, t("bilan.erreur")), el("div", { class: "grand" }, `${un(r.mae)} ${t("ans")}`), el("p", {}, t("bilan.erreur.detail", { n: r.n, recents: un(r.recents), exacts: r.exacts }))),
        el("div", { class: "bloc" }, el("h2", {}, t("bilan.biais")), el("p", {}, sens), el("p", { class: "vide" }, t("bilan.biais.note"))),
        el("div", { class: "bloc" }, el("h2", {}, t("bilan.niveau")), el("div", { class: "grand" }, `${etat.niveau} / 3`),
          el("p", {}, `${niv.nom} (${niv.detail}).${etat.tranche ? t("bilan.niveau.tranche", { t: etat.tranche }) : ""}`)),
      ),
      el("div", { class: "bloc", style: "margin-top:1rem" }, el("h2", {}, t("bilan.tranches")), tableau,
        el("p", { class: "vide" }, t("bilan.tranches.note"))),
      el("p", { class: "vide" }, t("bilan.exclus", { n: etat.exclus.size }), etat.doutes.size ? t("bilan.doutes", { n: etat.doutes.size }) : "", reset),
    );
  }

  // ---------- Apprendre ----------
  function rendreFiches() {
    const zone = $("fiches");
    zone.replaceChildren(...FICHES.map((f) => el("article", { class: "fiche", id: "fiche-" + f.id },
      el("h2", {}, f.titre),
      ...f.texte.map((x) => el("p", {}, x)),
      f.note ? el("p", { class: "note" }, f.note) : null,
      f.sources.length ? el("ul", { class: "sources" }, ...f.sources.map((s) => el("li", {}, lien(`https://doi.org/${s.doi}`, s.label)))) : null,
    )));
  }

  rendreFiches();
  nouveau();
  viderFile(); // des signalements restés en file (hors ligne au moment du clic) repartent
  const vue = params.get("vue");
  if (vue && vues[vue]) montrer(vue);
  // ?demo=reponse[&ecart=N] : une estimation posée et validée (réel + N, 7 par défaut), pour montrer l'écran de réponse.
  if (DEMO === "reponse" && courant) {
    poser(S.ageReel(courant.a) + (Number(params.get("ecart")) || 7));
    valider();
  }
})();
