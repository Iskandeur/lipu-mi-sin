// Les fiches « Apprendre ». Chaque affirmation renvoie à une source dont le DOI a été vérifié (Crossref, 25/10/2026)
// et dont le résumé dit ce que la fiche lui prête. Ce qui n'a pas de source le dit.
window.FICHES = [
  {
    id: "methode",
    titre: "La méthode : une décennie, puis un ajustement",
    texte: [
      "Commence par une seule question : dans quelle décennie est cette personne ? Puis ajuste dans la décennie avec les indices des fiches suivantes.",
      "Avant de valider, demande-toi dans quel sens tu te trompes d'habitude pour cette tranche (ton tableau de biais, onglet Mes stats) et corrige d'autant.",
    ],
    note: "C'est une méthode d'entraînement, pas un résultat de recherche : elle sert à rendre tes erreurs régulières, donc corrigeables.",
    sources: [],
  },
  {
    id: "peau",
    titre: "La peau : rides, taches, teint inégal",
    texte: [
      "Les rides, les taches pigmentées et les marques de soleil font partie des indices qui disent le mieux si quelqu'un fait plus ou moins que son âge.",
      "Le teint compte autant que les rides : une peau au teint uniforme paraît plus jeune, une peau à la couleur inégale (taches, rougeurs) paraît plus âgée.",
      "Regarde d'abord la zone des yeux (pattes d'oie, paupières, cernes) : c'est l'une des zones les plus parlantes.",
    ],
    sources: [
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
      { label: "Fink, Grammer & Matts 2006, Evolution and Human Behavior", doi: "10.1016/j.evolhumbehav.2006.08.007" },
      { label: "Nkengne et al. 2008, JEADV", doi: "10.1111/j.1468-3083.2008.02698.x" },
    ],
  },
  {
    id: "contraste",
    titre: "Le contraste du visage s'efface avec l'âge",
    texte: [
      "Avec l'âge, les lèvres, les yeux et les sourcils se détachent moins de la peau qui les entoure. Un visage peu contrasté paraît plus âgé, un visage très contrasté plus jeune.",
      "Le maquillage augmente ce contraste : une personne maquillée paraît souvent plus jeune qu'elle ne l'est.",
    ],
    sources: [{ label: "Porcheron, Mauger & Russell 2013, PLoS ONE", doi: "10.1371/journal.pone.0057985" }],
  },
  {
    id: "cheveux",
    titre: "Les cheveux : utiles, mais pas une horloge",
    texte: [
      "Le gris, le recul du front et les lèvres plus fines sont liés à l'âge apparent. Mais le gris dépend beaucoup de la génétique et de l'origine.",
      "La règle « à 50 ans, la moitié des gens ont la moitié des cheveux gris » est fausse : sur 4 192 personnes, seuls 6 à 23 % en sont là à 50 ans, selon l'origine et la couleur naturelle. Et une teinture efface l'indice.",
    ],
    sources: [
      { label: "Panhard, Lozano & Loussouarn 2012, British Journal of Dermatology", doi: "10.1111/j.1365-2133.2012.11095.x" },
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
    ],
  },
  {
    id: "forme",
    titre: "Le contour et les volumes, surtout avant 20 ans",
    texte: [
      "Chez l'enfant et l'adolescent, c'est la forme de la tête qui parle : le bas du visage grandit plus que le crâne. Des yeux placés bas dans le visage et un front large signalent un enfant ; un menton et une mâchoire marqués, un adulte.",
      "Chez l'adulte, regarde les volumes : la structure sous la peau (joues, ovale) explique une part de ce qui fait paraître jeune ou vieux. Les lèvres s'affinent avec l'âge.",
    ],
    note: "Les mains, quand elles sont visibles (peau du dos de la main, veines, articulations), aident sans doute, mais je n'ai pas trouvé d'étude solide qui le mesure : prends-les comme un indice d'appoint.",
    sources: [
      { label: "Pittenger & Shaw 1975, JEP: Human Perception and Performance", doi: "10.1037/0096-1523.1.4.374" },
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
    ],
  },
  {
    id: "expression",
    titre: "L'expression fausse l'estimation",
    texte: [
      "Un visage neutre est celui dont on estime l'âge le plus juste. Les autres expressions déplacent l'estimation.",
      "Le sens n'est pas simple : une étude trouve qu'on sous-estime l'âge des visages joyeux, une autre que les visages souriants paraissent plus âgés que les mêmes visages neutres, à cause des rides que le sourire creuse autour des yeux.",
      "Le geste : sur un sourire, ne compte pas les plis qui disparaîtront quand le visage se relâchera.",
    ],
    sources: [
      { label: "Voelkle et al. 2012, Psychology and Aging", doi: "10.1037/a0025065" },
      { label: "Ganel 2015, Psychonomic Bulletin & Review", doi: "10.3758/s13423-015-0822-7" },
    ],
  },
  {
    id: "biais",
    titre: "Le biais classique : tout ramener vers le milieu",
    texte: [
      "On a tendance à vieillir les jeunes et à rajeunir les personnes âgées : les estimations se resserrent vers le milieu de la vie.",
      "L'âge des visages âgés est aussi plus difficile à estimer que celui des visages jeunes, et on estime mieux les gens de son propre groupe d'âge.",
      "Le tableau par tranche de l'onglet Mes stats te montre ta version de ce biais. Pour le corriger : sur une personne clairement âgée, ose plus haut ; sur un jeune, ose plus bas.",
    ],
    sources: [
      { label: "Moyse 2014, Psychologica Belgica (revue)", doi: "10.5334/pb.aq" },
      { label: "Voelkle et al. 2012, Psychology and Aging", doi: "10.1037/a0025065" },
      { label: "Rhodes 2009, Applied Cognitive Psychology (revue)", doi: "10.1002/acp.1442" },
    ],
  },
  {
    id: "pieges",
    titre: "Les pièges propres à ces photos",
    texte: [
      "Photo ancienne : le noir et blanc, le grain, la coiffure et les vêtements datent la photo, pas la personne. Juge le visage seul.",
      "Personnes publiques : éclairage de studio, maquillage, retouche. Tout ça rajeunit.",
      "La date de prise de vue vient de la page Commons. Elle est confrontée à l'appareil photo (EXIF) et aux catégories datées : les dates d'upload, les estimations et les dates contredites sont retirées du jeu. Il en reste peut-être : un écart énorme peut venir de là, pas de toi. Dans ce cas, « Âge douteux ? » le fait revérifier.",
      "Les visages sont détectés et recadrés, mais le détecteur ne distingue pas une photo d'une statue, d'un tableau ou d'une affiche : passe-les avec « Photo inutilisable ».",
    ],
    note: "Cette fiche décrit le jeu de données (README du dépôt), pas une étude.",
    sources: [],
  },
];

// The same cards in English (v3). Same ids, same sources: a test checks they match the French ones one for one.
window.FICHES_EN = [
  {
    id: "methode",
    titre: "The method: a decade, then a fine-tune",
    texte: [
      "Start with a single question: which decade is this person in? Then fine-tune within the decade using the cues from the next cards.",
      "Before submitting, ask yourself which way you usually miss for this age band (your bias table, My stats tab) and correct for it.",
    ],
    note: "This is a training method, not a research finding: it makes your errors consistent, so they can be corrected.",
    sources: [],
  },
  {
    id: "peau",
    titre: "Skin: wrinkles, spots, uneven tone",
    texte: [
      "Wrinkles, pigment spots and sun damage are among the cues that best tell whether someone looks older or younger than their age.",
      "Skin tone matters as much as wrinkles: an even complexion looks younger, uneven colour (spots, redness) looks older.",
      "Look first at the eye area (crow's feet, eyelids, dark circles): it is one of the most telling zones.",
    ],
    sources: [
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
      { label: "Fink, Grammer & Matts 2006, Evolution and Human Behavior", doi: "10.1016/j.evolhumbehav.2006.08.007" },
      { label: "Nkengne et al. 2008, JEADV", doi: "10.1111/j.1468-3083.2008.02698.x" },
    ],
  },
  {
    id: "contraste",
    titre: "Facial contrast fades with age",
    texte: [
      "With age, the lips, eyes and eyebrows stand out less from the surrounding skin. A low-contrast face looks older, a high-contrast face younger.",
      "Make-up increases that contrast: a person wearing make-up often looks younger than they are.",
    ],
    sources: [{ label: "Porcheron, Mauger & Russell 2013, PLoS ONE", doi: "10.1371/journal.pone.0057985" }],
  },
  {
    id: "cheveux",
    titre: "Hair: useful, but not a clock",
    texte: [
      "Grey hair, a receding hairline and thinner lips are linked to apparent age. But greying depends a lot on genetics and ancestry.",
      "The rule “at 50, half of people have half their hair grey” is wrong: out of 4,192 people, only 6 to 23% were there at 50, depending on ancestry and natural hair colour. And hair dye erases the cue.",
    ],
    sources: [
      { label: "Panhard, Lozano & Loussouarn 2012, British Journal of Dermatology", doi: "10.1111/j.1365-2133.2012.11095.x" },
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
    ],
  },
  {
    id: "forme",
    titre: "Outline and volumes, especially under 20",
    texte: [
      "In children and teenagers, the shape of the head tells the age: the lower face grows more than the skull. Eyes set low in the face and a wide forehead mean a child; a defined chin and jaw, an adult.",
      "In adults, look at the volumes: the structure under the skin (cheeks, face outline) explains part of what makes someone look young or old. Lips get thinner with age.",
    ],
    note: "Hands, when visible (skin on the back of the hand, veins, joints), probably help, but I found no solid study measuring it: treat them as a secondary cue.",
    sources: [
      { label: "Pittenger & Shaw 1975, JEP: Human Perception and Performance", doi: "10.1037/0096-1523.1.4.374" },
      { label: "Gunn et al. 2009, PLoS ONE", doi: "10.1371/journal.pone.0008021" },
    ],
  },
  {
    id: "expression",
    titre: "Expression skews the estimate",
    texte: [
      "A neutral face is the one whose age we estimate best. Other expressions shift the estimate.",
      "The direction is not simple: one study finds that happy faces are judged younger, another that smiling faces look older than the same neutral faces, because of the wrinkles a smile carves around the eyes.",
      "The habit: on a smile, don't count the folds that will vanish once the face relaxes.",
    ],
    sources: [
      { label: "Voelkle et al. 2012, Psychology and Aging", doi: "10.1037/a0025065" },
      { label: "Ganel 2015, Psychonomic Bulletin & Review", doi: "10.3758/s13423-015-0822-7" },
    ],
  },
  {
    id: "biais",
    titre: "The classic bias: pulling everything toward the middle",
    texte: [
      "We tend to guess young people too old and older people too young: estimates squeeze toward mid-life.",
      "The age of older faces is also harder to estimate than that of younger faces, and we judge people of our own age group better.",
      "The by-age-band table in the My stats tab shows your version of this bias. To correct it: on a clearly older person, go higher; on a young one, go lower.",
    ],
    sources: [
      { label: "Moyse 2014, Psychologica Belgica (review)", doi: "10.5334/pb.aq" },
      { label: "Voelkle et al. 2012, Psychology and Aging", doi: "10.1037/a0025065" },
      { label: "Rhodes 2009, Applied Cognitive Psychology (review)", doi: "10.1002/acp.1442" },
    ],
  },
  {
    id: "pieges",
    titre: "The traps of these particular photos",
    texte: [
      "Old photo: black and white, grain, hairstyle and clothes date the photo, not the person. Judge the face alone.",
      "Public figures: studio lighting, make-up, retouching. All of that makes people look younger.",
      "The date the photo was taken comes from the Commons page. It is checked against the camera (EXIF) and dated categories: upload dates, estimates and contradicted dates are removed from the game. Some may remain: a huge gap can come from there, not from you. In that case, “Doubtful age?” sends it for a re-check.",
      "Faces are detected and cropped, but the detector cannot tell a photo from a statue, a painting or a poster: skip those with “Unusable photo”.",
    ],
    note: "This card describes the dataset (the repository README), not a study.",
    sources: [],
  },
];
