// Calculs purs de l'entraînement : tirage équilibré par tranche, résumé des erreurs. Script classique (pas de module)
// pour que l'appli s'ouvre en file:// ; testé sous Node par test/stats.test.mjs.
(function (racine) {
  const TRANCHES = ["<20", "20-29", "30-39", "40-49", "50-59", "60-69", "70+"];

  function trancheDe(age) {
    if (age < 20) return "<20";
    if (age >= 70) return "70+";
    const d = Math.floor(age / 10) * 10;
    return d + "-" + (d + 9);
  }

  /** L'âge réel affiché : les années révolues à la prise de vue. */
  function ageReel(age) {
    return Math.floor(age);
  }

  /**
   * Tire un portrait : une tranche au hasard parmi celles qui ont encore des portraits non vus, puis un portrait non
   * vu dans cette tranche. Le jeu est déséquilibré (30-49 rares) : sans ça on verrait surtout des 70+.
   * Tout vu : on repart de zéro (vus vidé). `exclus` (photos signalées) n'est jamais tiré. `garder` (facultatif) borne
   * le tirage aux portraits qu'il accepte (niveau, tranche choisie).
   */
  function tirer(portraits, vus, exclus, rng, garder) {
    const r = rng || Math.random;
    const pool = (ignorerVus) => {
      const parT = {};
      for (const p of portraits) {
        if (garder && !garder(p)) continue;
        if (exclus.has(p.q) || (!ignorerVus && vus.has(p.q))) continue;
        (parT[trancheDe(p.a)] = parT[trancheDe(p.a)] || []).push(p);
      }
      return parT;
    };
    let parT = pool(false);
    let recommence = false;
    if (!Object.keys(parT).length) {
      parT = pool(true);
      recommence = true;
    }
    const tranches = TRANCHES.filter((t) => parT[t] && parT[t].length);
    if (!tranches.length) return { portrait: null, recommence };
    const t = tranches[Math.floor(r() * tranches.length)];
    const liste = parT[t];
    return { portrait: liste[Math.floor(r() * liste.length)], recommence };
  }

  const moyenne = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

  /**
   * Résumé d'un historique d'essais `{ a: âge réel exact, g: estimation }`. Erreur signée = estimation - âge réel
   * (positive : tu as vieilli). `recents` : les 20 derniers. `courbe` : erreur moyenne par bloc de 10 essais.
   */
  function resumer(hist) {
    const err = hist.map((h) => h.g - ageReel(h.a));
    const abs = err.map(Math.abs);
    const parTranche = {};
    for (const t of TRANCHES) parTranche[t] = { n: 0, mae: null, biais: null };
    const groupes = {};
    hist.forEach((h, i) => {
      const t = trancheDe(h.a);
      (groupes[t] = groupes[t] || []).push(err[i]);
    });
    for (const t of Object.keys(groupes)) {
      const e = groupes[t];
      parTranche[t] = { n: e.length, mae: moyenne(e.map(Math.abs)), biais: moyenne(e) };
    }
    const courbe = [];
    for (let i = 0; i + 10 <= abs.length; i += 10) courbe.push(moyenne(abs.slice(i, i + 10)));
    return {
      n: hist.length,
      mae: moyenne(abs),
      recents: moyenne(abs.slice(-20)),
      biais: moyenne(err),
      exacts: abs.filter((x) => x <= 2).length,
      parTranche,
      courbe,
    };
  }

  /**
   * La fiche à relire après un essai, ou null. Relie le jeu à l'apprentissage sur les deux erreurs que les fiches
   * expliquent : le biais vers le milieu (un jeune vieilli, un âgé rajeuni, de 5 ans ou plus) et la photo ancienne.
   * `recentes` : les erreurs signées des derniers essais de la même tranche, pour dire quand le biais se répète.
   */
  const CONSEILS = {
    fr: {
      repete: (k) => ` C'est la ${k}e fois de suite dans cette tranche.`,
      rajeuni: "Tu as rajeuni une personne âgée : c'est le biais le plus courant.",
      vieilli: "Tu as vieilli une personne jeune : c'est le biais le plus courant.",
      ancienne: "Photo ancienne : le grain et la mode datent la photo, pas la personne.",
    },
    en: {
      repete: (k) => ` That's ${k} times in a row in this age band.`,
      rajeuni: "You guessed an older person too young: the most common bias.",
      vieilli: "You guessed a young person too old: the most common bias.",
      ancienne: "Old photo: grain and fashion date the photo, not the person.",
    },
  };
  const langueDe = (l) => (l === "en" ? "en" : "fr");

  function conseil(reel, g, anneePhoto, recentes, langue) {
    const C = CONSEILS[langueDe(langue)];
    const e = g - reel;
    const meme = (recentes || []).filter((x) => Math.sign(x) === Math.sign(e) && Math.abs(x) >= 5).length;
    const repete = meme >= 2 ? C.repete(meme + 1) : "";
    if (reel >= 60 && e <= -5) return { fiche: "biais", texte: C.rajeuni + repete };
    if (reel < 30 && e >= 5) return { fiche: "biais", texte: C.vieilli + repete };
    if (anneePhoto && anneePhoto < 1970 && Math.abs(e) >= 8) return { fiche: "pieges", texte: C.ancienne };
    return null;
  }

  // ---------- Difficulté (v1, son choix B du 26/10 : départ facile, puis ça monte) ----------
  // Aucune détection de visage : « facile » ne peut pas vouloir dire « de face ». Ce qu'on sait de chaque photo, c'est
  // l'âge, l'année de prise de vue et le format. Facile = un adulte entre 20 et 59 ans (le milieu de vie, où l'erreur
  // est la plus faible), photo de 2000 ou après (couleur, numérique), cadrage vertical (plus souvent un portrait qu'un
  // plan large). Moyen ouvre de 15 à 74 ans et aux photos depuis 1990. Difficile = tout le jeu (enfants, grand âge,
  // photos anciennes).
  const NIVEAUX = [
    { n: 1, nom: "Facile", detail: "adultes de 20 à 59 ans, photos récentes, cadrage vertical ; « de face » non garanti" },
    { n: 2, nom: "Moyen", detail: "de 15 à 74 ans, photos depuis 1990" },
    { n: 3, nom: "Difficile", detail: "tout le jeu : enfants, grand âge, photos anciennes" },
  ];
  const NIVEAUX_EN = [
    { n: 1, nom: "Easy", detail: "adults aged 20 to 59, recent photos, portrait framing; “facing the camera” not guaranteed" },
    { n: 2, nom: "Medium", detail: "ages 15 to 74, photos since 1990" },
    { n: 3, nom: "Hard", detail: "the whole set: children, old age, old photos" },
  ];
  /** Les niveaux dans une langue ("fr" par défaut). */
  const niveaux = (langue) => (langueDe(langue) === "en" ? NIVEAUX_EN : NIVEAUX);
  const SEUIL_MONTEE = 8; // erreur moyenne (ans) sur les 10 derniers essais du niveau pour monter
  const ESSAIS_MONTEE = 10;
  const ESSAIS_MAX_PAR_NIVEAU = 30; // personne ne reste coincé : au 30e essai d'un niveau, on monte quand même

  const anneePhoto = (p) => Number(String(p.t || "").slice(0, 4)) || null;

  /** Le niveau le plus bas où ce portrait apparaît (1, 2 ou 3). `r` : largeur / hauteur de l'original. */
  function niveauDe(p) {
    const an = anneePhoto(p);
    const vertical = typeof p.r === "number" ? p.r <= 0.9 : true;
    if (p.a >= 20 && p.a < 60 && an && an >= 2000 && vertical) return 1;
    if (p.a >= 15 && p.a < 75 && an && an >= 1990) return 2;
    return 3;
  }

  /**
   * Où en est la progression : `{ niveau, essais, mae, reste }` pour le niveau courant (les essais `v === niveau`
   * depuis qu'on y est). On monte quand les 10 derniers essais du niveau sont à 8 ans d'erreur moyenne ou moins, ou
   * au 30e essai du niveau. `reste` : essais avant la prochaine vérification (0 au niveau 3).
   */
  function progression(hist, niveau) {
    const n = Math.min(3, Math.max(1, Number(niveau) || 1));
    const ici = hist.filter((h) => h.v === n);
    const derniers = ici.slice(-ESSAIS_MONTEE).map((h) => Math.abs(h.g - ageReel(h.a)));
    const mae = moyenne(derniers);
    let monte = false;
    if (n < 3) monte = (derniers.length === ESSAIS_MONTEE && mae <= SEUIL_MONTEE) || ici.length >= ESSAIS_MAX_PAR_NIVEAU;
    return { niveau: monte ? n + 1 : n, monte, essais: ici.length, mae, reste: n < 3 ? Math.max(0, ESSAIS_MONTEE - ici.length) : 0 };
  }

  // ---------- Retour : l'indice (son choix C, puis 2B du 26/10 : une ligne courte suffit) ----------
  // Pas d'annotation par photo : l'indice est GÉNÉRAL, par tranche d'âge réel et sens de l'erreur. Une phrase de
  // 70 signes au plus (test/stats.test.mjs) ; le détail et les sources sont dans la fiche liée.
  const INDICES = {
    "<20": {
      rajeuni: { fiche: "forme", texte: "Avant 20 ans, juge la forme : menton et mâchoire marqués = plus âgé." },
      vieilli: { fiche: "forme", texte: "Joues rondes, yeux bas, front large = enfant, même en tenue d'adulte." },
    },
    "20-39": {
      rajeuni: { fiche: "peau", texte: "Regarde le tour des yeux : pattes d'oie, paupières, cernes." },
      vieilli: { fiche: "peau", texte: "Barbe, front dégarni, lumière dure vieillissent : fie-toi à la peau." },
    },
    "40-59": {
      rajeuni: { fiche: "contraste", texte: "Regarde les sillons du nez à la bouche et les paupières." },
      vieilli: { fiche: "cheveux", texte: "Le gris des cheveux trompe : juge la peau et les volumes." },
    },
    "60+": {
      rajeuni: { fiche: "biais", texte: "Après 60 ans, regarde le cou et les paupières, puis ose plus haut." },
      vieilli: { fiche: "expression", texte: "Les plis du sourire ne comptent pas : juge le visage au repos." },
    },
  };
  // Les mêmes en anglais (même fiche, même borne de 70 signes).
  const INDICES_EN = {
    "<20": {
      rajeuni: "Under 20, judge the shape: defined chin and jaw = older.",
      vieilli: "Round cheeks, low-set eyes, wide forehead = a child, even dressed up.",
    },
    "20-39": {
      rajeuni: "Look around the eyes: crow's feet, eyelids, dark circles.",
      vieilli: "Beard, receding hairline, harsh light age a face: trust the skin.",
    },
    "40-59": {
      rajeuni: "Look at the nose-to-mouth folds and the eyelids.",
      vieilli: "Grey hair misleads: judge the skin and the volumes.",
    },
    "60+": {
      rajeuni: "Over 60, look at the neck and eyelids, then dare to go higher.",
      vieilli: "Smile lines don't count: judge the face at rest.",
    },
  };
  const groupeIndice = (reel) => (reel < 20 ? "<20" : reel < 40 ? "20-39" : reel < 60 ? "40-59" : "60+");
  const libelleGroupe = { "<20": "moins de 20 ans", "20-39": "20-39 ans", "40-59": "40-59 ans", "60+": "plus de 60 ans" };
  const libelleGroupeEn = { "<20": "under 20", "20-39": "aged 20-39", "40-59": "aged 40-59", "60+": "over 60" };

  /** L'indice après un essai, ou null si l'erreur est de moins de 3 ans. `{ fiche, texte, cadre }` : `cadre` dit
   *  que c'est un indice général (tranche + sens), pas une lecture de cette photo ; l'appli le met en infobulle. */
  function indice(reel, g, langue) {
    const e = g - reel;
    if (Math.abs(e) < 3) return null;
    const groupe = groupeIndice(reel);
    const sens = e < 0 ? "rajeuni" : "vieilli";
    const i = INDICES[groupe][sens];
    if (langueDe(langue) === "en") {
      return { fiche: i.fiche, texte: INDICES_EN[groupe][sens], cadre: `General hint when you guessed someone ${libelleGroupeEn[groupe]} too ${e < 0 ? "young" : "old"} (not a reading of this photo)` };
    }
    return { fiche: i.fiche, texte: i.texte, cadre: `Indice général quand on a ${sens} quelqu'un de ${libelleGroupe[groupe]} (pas une lecture de cette photo)` };
  }

  // ---------- Courbe de précision (son choix A + écran de stats) ----------
  /** L'erreur moyenne glissante sur les `k` derniers essais, un point par essai à partir du k-ième : [{ i, mae }]
   *  (`i` = numéro d'essai, à partir de 1). Moins de k essais : un seul point sur ce qu'il y a, s'il y en a 3 ou plus. */
  function glissante(hist, k) {
    const f = k || 10;
    const abs = hist.map((h) => Math.abs(h.g - ageReel(h.a)));
    if (abs.length < f) return abs.length >= 3 ? [{ i: abs.length, mae: moyenne(abs) }] : [];
    const out = [];
    let somme = 0;
    abs.forEach((x, j) => {
      somme += x;
      if (j >= f) somme -= abs[j - f];
      if (j >= f - 1) out.push({ i: j + 1, mae: somme / f });
    });
    return out;
  }

  // ---------- mode Défi (v4) ----------
  /** Points d'un essai : 100 pile, 5 de moins par année d'écart, jamais sous 0 (20 ans d'écart ou plus = 0). */
  function points(ecart) {
    return Math.max(0, 100 - 5 * Math.abs(Math.round(ecart)));
  }

  /** Le carré du partage : 🟩 écart de 3 ans ou moins, 🟨 de 4 à 8, 🟥 au-delà. */
  function carre(ecart) {
    const e = Math.abs(ecart);
    return e <= 3 ? "🟩" : e <= 8 ? "🟨" : "🟥";
  }

  /** Une suite de nombres déterministe d'après un texte (la graine du défi : même texte, mêmes photos). */
  function suiteDeTexte(texte) {
    const s = String(texte);
    let h = 1779033703 ^ s.length;
    for (const c of s) {
      h = Math.imul(h ^ c.charCodeAt(0), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let x = h >>> 0 || 1;
    return () => {
      x = (x + 0x6d2b79f5) >>> 0;
      let z = x;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Les photos d'un défi : les `n` premières tirées avec la suite de `graine`, sans repasser deux fois sur la même.
   * Le jeu entier compte, sans aucun réglage local (photos exclues, niveau) : deux joueurs avec le même code voient
   * les mêmes photos dans le même ordre.
   */
  function tirageDefi(portraits, graine, n) {
    const rng = suiteDeTexte(graine);
    const vus = new Set();
    const liste = [];
    while (liste.length < n) {
      const { portrait, recommence } = tirer(portraits, vus, new Set(), rng);
      if (!portrait) break;
      if (recommence) vus.clear();
      vus.add(portrait.q);
      liste.push(portrait);
    }
    return liste;
  }

  /**
   * Un code de défi `s10-abc123` (série de 10 photos) ou `c60-abc123` (60 secondes) : le mode, sa taille, la graine.
   * Renvoie null si le code n'a pas cette forme ou une taille hors des choix proposés.
   */
  const DEFIS = { s: [5, 10, 20], c: [30, 60, 120] };
  function lireCodeDefi(code) {
    const m = /^([sc])(\d{1,3})-([a-z0-9]{4,12})$/.exec(String(code || ""));
    if (!m || !DEFIS[m[1]].includes(Number(m[2]))) return null;
    return { mode: m[1] === "s" ? "serie" : "chrono", taille: Number(m[2]), graine: m[3], code: m[0] };
  }

  const api = { points, carre, suiteDeTexte, tirageDefi, lireCodeDefi, DEFIS, TRANCHES, trancheDe, ageReel, tirer, resumer, conseil, NIVEAUX, niveaux, niveauDe, progression, indice, glissante };
  racine.AgeStats = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
