/* Languages. Loaded in <head>, before the first paint: picks the language
   (?lang= > saved choice > browser > English) and sets <html lang dir>. */
(function () {
  var T = {
    en: {
      greet: "hello", skip: "Skip to content", nav1: "Stuff", nav2: "Now", nav3: "Hello", langLabel: "Language",
      iam: "I'm", sub: "Mostly AI agents that go investigate things. Sometimes they come back with the truth.",
      hint: "Go on, knock it over. Tap the empty space for more letters.", rebuild: "Rebuild",
      count: "{n} knocked over. Someone will have to rebuild that.",
      s1: "stuff", s2: "now", s3: "hello",
      t1: "threat intel · agent", t2: "AI security · sandbox", t3: "multi-agent", t4: "dev tools", t5: "artificial life", t6: "threat intel · pipeline",
      p1: "Give it a suspicious domain or IP. It runs the investigation on its own, pivot after pivot, and writes up what it found.",
      p2: "A fake company run by AI email assistants. You release a worm, flip the defenses on and off, and watch the outbreak spread.",
      p3: "Draw a team of AI agents, decide who is allowed to talk to whom, then watch the conversation travel through the graph.",
      p4: "One ticket board for all my Claude Code sessions: what is waiting on me, what is running, what is done.",
      p5: "A cellular automaton. Cells merge into organisms, organisms get a language model for a brain, and the only thing a brain can do is rewrite the rules of its own body.",
      p6: "Vulnerability and ransomware feeds in, scored alerts out, straight to the phone. So the bad news finds me first.",
      try: "Try it", code: "Code", more: "Everything else, unsorted →",
      now: "Teaching agents to do cyber investigations (threat intel, OSINT, SOC), and building the part that checks what they report.",
      now2: "Trust, but verify. Mostly verify.", big: "Say hello.",
      foot: "Hand-made. No cookies, no trackers, no framework.",
      egg: "There is an eleventh language. It has 120 words.",
      found: "toki! You found the eleventh language. Tap hello again to leave."
    },
    fr: {
      greet: "salut", skip: "Aller au contenu", nav1: "Trucs", nav2: "En ce moment", nav3: "Salut", langLabel: "Langue",
      iam: "moi c'est", sub: "Surtout des agents IA qui partent enquêter. Parfois, ils reviennent avec la vérité.",
      hint: "Vas-y, fais tout tomber. Touche le vide pour d'autres lettres.", rebuild: "Reconstruire",
      count: "{n} par terre. Il faudra bien que quelqu'un range.",
      s1: "trucs", s2: "en ce moment", s3: "salut",
      t1: "renseignement · agent", t2: "sécurité IA · bac à sable", t3: "multi-agents", t4: "outils de dev", t5: "vie artificielle", t6: "renseignement · pipeline",
      p1: "Donne-lui un domaine ou une IP louche. Il mène l'enquête tout seul, piste après piste, et rédige ce qu'il a trouvé.",
      p2: "Une fausse entreprise tenue par des assistants mail IA. Tu lâches un ver, tu allumes et coupes les défenses, et tu regardes l'épidémie se propager.",
      p3: "Dessine une équipe d'agents IA, décide qui a le droit de parler à qui, puis regarde la conversation circuler dans le graphe.",
      p4: "Un seul tableau de tickets pour toutes mes sessions Claude Code : ce qui m'attend, ce qui tourne, ce qui est fini.",
      p5: "Un automate cellulaire. Les cellules fusionnent en organismes, les organismes reçoivent un modèle de langage en guise de cerveau, et la seule chose qu'un cerveau peut faire, c'est réécrire les règles de son propre corps.",
      p6: "Des flux de vulnérabilités et de rançongiciels en entrée, des alertes notées en sortie, direct sur le téléphone. Comme ça, les mauvaises nouvelles me trouvent en premier.",
      try: "Essayer", code: "Code", more: "Tout le reste, en vrac →",
      now: "J'apprends à des agents à mener des enquêtes cyber (renseignement sur la menace, OSINT, SOC), et je construis la partie qui vérifie ce qu'ils rapportent.",
      now2: "La confiance n'exclut pas le contrôle. Surtout le contrôle.", big: "Dis bonjour.",
      foot: "Fait main. Pas de cookies, pas de traceurs, pas de framework.",
      egg: "Il existe une onzième langue. Elle a 120 mots.",
      found: "toki ! Tu as trouvé la onzième langue. Retouche salut pour en sortir."
    },
    es: {
      greet: "hola", skip: "Ir al contenido", nav1: "Cosas", nav2: "Ahora", nav3: "Hola", langLabel: "Idioma",
      iam: "soy", sub: "Sobre todo agentes de IA que salen a investigar. A veces vuelven con la verdad.",
      hint: "Venga, tíralo todo. Toca el espacio vacío para más letras.", rebuild: "Reconstruir",
      count: "{n} por el suelo. Alguien tendrá que recogerlo.",
      s1: "cosas", s2: "ahora", s3: "hola",
      t1: "inteligencia de amenazas · agente", t2: "seguridad IA · sandbox", t3: "multiagente", t4: "herramientas dev", t5: "vida artificial", t6: "inteligencia de amenazas · pipeline",
      p1: "Dale un dominio o una IP sospechosa. Investiga solo, pista tras pista, y redacta lo que encontró.",
      p2: "Una empresa falsa llevada por asistentes de correo con IA. Sueltas un gusano, activas y desactivas las defensas y ves cómo se propaga el brote.",
      p3: "Dibuja un equipo de agentes de IA, decide quién puede hablar con quién y mira cómo viaja la conversación por el grafo.",
      p4: "Un solo tablero de tickets para todas mis sesiones de Claude Code: lo que me espera, lo que corre, lo que está hecho.",
      p5: "Un autómata celular. Las células se fusionan en organismos, los organismos reciben un modelo de lenguaje como cerebro, y lo único que puede hacer un cerebro es reescribir las reglas de su propio cuerpo.",
      p6: "Entran fuentes de vulnerabilidades y ransomware, salen alertas puntuadas, directas al móvil. Así las malas noticias me encuentran primero.",
      try: "Probar", code: "Código", more: "Todo lo demás, sin ordenar →",
      now: "Enseño a agentes a hacer investigaciones de ciberseguridad (inteligencia de amenazas, OSINT, SOC) y construyo la parte que comprueba lo que cuentan.",
      now2: "Confía, pero verifica. Sobre todo verifica.", big: "Saluda.",
      foot: "Hecho a mano. Sin cookies, sin rastreadores, sin framework.",
      egg: "Hay un undécimo idioma. Tiene 120 palabras.",
      found: "¡toki! Encontraste el undécimo idioma. Toca hola otra vez para salir."
    },
    it: {
      greet: "ciao", skip: "Vai al contenuto", nav1: "Cose", nav2: "Adesso", nav3: "Ciao", langLabel: "Lingua",
      iam: "sono", sub: "Soprattutto agenti IA che vanno a indagare. A volte tornano con la verità.",
      hint: "Dai, butta giù tutto. Tocca lo spazio vuoto per altre lettere.", rebuild: "Ricostruisci",
      count: "{n} per terra. Qualcuno dovrà rimettere a posto.",
      s1: "cose", s2: "adesso", s3: "ciao",
      t1: "threat intel · agente", t2: "sicurezza IA · sandbox", t3: "multi-agente", t4: "strumenti dev", t5: "vita artificiale", t6: "threat intel · pipeline",
      p1: "Dagli un dominio o un IP sospetto. Indaga da solo, pista dopo pista, e scrive cosa ha trovato.",
      p2: "Un'azienda finta gestita da assistenti email IA. Liberi un worm, accendi e spegni le difese e guardi l'epidemia diffondersi.",
      p3: "Disegna una squadra di agenti IA, decidi chi può parlare con chi, poi guarda la conversazione viaggiare nel grafo.",
      p4: "Un'unica bacheca di ticket per tutte le mie sessioni Claude Code: cosa aspetta me, cosa gira, cosa è fatto.",
      p5: "Un automa cellulare. Le cellule si fondono in organismi, gli organismi ricevono un modello linguistico come cervello, e l'unica cosa che un cervello può fare è riscrivere le regole del proprio corpo.",
      p6: "Entrano feed di vulnerabilità e ransomware, escono allerte con un punteggio, dritte sul telefono. Così le brutte notizie trovano me per primo.",
      try: "Provalo", code: "Codice", more: "Tutto il resto, in disordine →",
      now: "Insegno ad agenti a fare indagini cyber (threat intel, OSINT, SOC) e costruisco la parte che controlla quello che riportano.",
      now2: "Fidarsi è bene, controllare è meglio. Soprattutto controllare.", big: "Fatti sentire.",
      foot: "Fatto a mano. Niente cookie, niente tracker, niente framework.",
      egg: "Esiste un'undicesima lingua. Ha 120 parole.",
      found: "toki! Hai trovato l'undicesima lingua. Tocca di nuovo ciao per uscire."
    },
    ru: {
      greet: "привет", skip: "К содержанию", nav1: "Штуки", nav2: "Сейчас", nav3: "Привет", langLabel: "Язык",
      iam: "я", sub: "В основном ИИ-агенты, которые уходят расследовать. Иногда возвращаются с правдой.",
      hint: "Давай, сломай всё. Нажми на пустое место, чтобы добавить букв.", rebuild: "Собрать заново",
      count: "Сломано: {n}. Кому-то придётся собирать.",
      s1: "штуки", s2: "сейчас", s3: "привет",
      t1: "разведка угроз · агент", t2: "безопасность ИИ · песочница", t3: "мультиагенты", t4: "инструменты", t5: "искусственная жизнь", t6: "разведка угроз · конвейер",
      p1: "Дай ему подозрительный домен или IP. Он сам ведёт расследование, зацепка за зацепкой, и пишет отчёт о найденном.",
      p2: "Ненастоящая компания, где почтой занимаются ИИ-ассистенты. Ты выпускаешь червя, включаешь и выключаешь защиту и смотришь, как идёт эпидемия.",
      p3: "Нарисуй команду ИИ-агентов, реши, кто с кем может говорить, и смотри, как разговор бежит по графу.",
      p4: "Одна доска задач для всех моих сессий Claude Code: что ждёт меня, что работает, что готово.",
      p5: "Клеточный автомат. Клетки сливаются в организмы, организмы получают языковую модель вместо мозга, и единственное, что мозг может, это переписать правила собственного тела.",
      p6: "На входе ленты уязвимостей и вымогателей, на выходе оценённые тревоги, прямо на телефон. Плохие новости находят меня первыми.",
      try: "Попробовать", code: "Код", more: "Всё остальное, вперемешку →",
      now: "Учу агентов вести киберрасследования (разведка угроз, OSINT, SOC) и строю ту часть, что проверяет их отчёты.",
      now2: "Доверяй, но проверяй. В основном проверяй.", big: "Напиши мне.",
      foot: "Сделано руками. Без куки, без трекеров, без фреймворка.",
      egg: "Есть одиннадцатый язык. В нём 120 слов.",
      found: "toki! Ты нашёл одиннадцатый язык. Нажми на «привет» ещё раз, чтобы выйти."
    },
    ar: {
      greet: "مرحبا", skip: "انتقل إلى المحتوى", nav1: "أشياء", nav2: "الآن", nav3: "مرحبا", langLabel: "اللغة",
      iam: "أنا", sub: "في الغالب وكلاء ذكاء اصطناعي يذهبون للتحقيق. وأحيانًا يعودون بالحقيقة.",
      hint: "هيا، أسقط كل شيء. المس المساحة الفارغة لمزيد من الحروف.", rebuild: "أعد البناء",
      count: "سقط {n}. سيضطر أحدهم إلى إعادة البناء.",
      s1: "أشياء", s2: "الآن", s3: "مرحبا",
      t1: "استخبارات التهديدات · وكيل", t2: "أمن الذكاء الاصطناعي · مختبر", t3: "وكلاء متعددون", t4: "أدوات تطوير", t5: "حياة اصطناعية", t6: "استخبارات التهديدات · سلسلة",
      p1: "أعطه نطاقًا أو عنوان IP مريبًا. يجري التحقيق وحده، خيطًا بعد خيط، ويكتب ما وجده.",
      p2: "شركة وهمية يديرها مساعدو بريد بالذكاء الاصطناعي. تطلق دودة، تشغّل الدفاعات وتطفئها، وتشاهد العدوى تنتشر.",
      p3: "ارسم فريقًا من وكلاء الذكاء الاصطناعي، وقرّر من يحق له أن يكلّم من، ثم شاهد المحادثة تسري في الشبكة.",
      p4: "لوحة تذاكر واحدة لكل جلسات Claude Code عندي: ما ينتظرني، وما يعمل، وما انتهى.",
      p5: "آلة خلوية. تندمج الخلايا في كائنات، وتحصل الكائنات على نموذج لغوي بدل الدماغ، والشيء الوحيد الذي يستطيعه الدماغ هو إعادة كتابة قواعد جسده.",
      p6: "تدخل نشرات الثغرات وبرامج الفدية، وتخرج تنبيهات مصنّفة مباشرة إلى الهاتف. هكذا تجدني الأخبار السيئة أولًا.",
      try: "جرّبه", code: "الكود", more: "كل الباقي، بلا ترتيب ←",
      now: "أعلّم الوكلاء إجراء تحقيقات سيبرانية (استخبارات التهديدات، OSINT، SOC)، وأبني الجزء الذي يتحقق مما يقولونه.",
      now2: "ثق، لكن تحقّق. تحقّق أكثر.", big: "قل مرحبا.",
      foot: "صُنع باليد. بلا كوكيز، بلا متتبعات، بلا إطار عمل.",
      egg: "هناك لغة حادية عشرة. فيها 120 كلمة.",
      found: "toki! وجدت اللغة الحادية عشرة. المس «مرحبا» مرة أخرى للخروج."
    },
    he: {
      greet: "שלום", skip: "דלג לתוכן", nav1: "דברים", nav2: "עכשיו", nav3: "שלום", langLabel: "שפה",
      iam: "אני", sub: "בעיקר סוכני בינה מלאכותית שיוצאים לחקור. לפעמים הם חוזרים עם האמת.",
      hint: "קדימה, תפיל הכול. גע בשטח הריק בשביל עוד אותיות.", rebuild: "לבנות מחדש",
      count: "{n} על הרצפה. מישהו יצטרך לסדר.",
      s1: "דברים", s2: "עכשיו", s3: "שלום",
      t1: "מודיעין איומים · סוכן", t2: "אבטחת AI · ארגז חול", t3: "ריבוי סוכנים", t4: "כלי פיתוח", t5: "חיים מלאכותיים", t6: "מודיעין איומים · צינור",
      p1: "תן לו דומיין או IP חשוד. הוא חוקר לבד, רמז אחרי רמז, וכותב מה מצא.",
      p2: "חברה מדומה שמנוהלת בידי עוזרי מייל מבוססי AI. משחררים תולעת, מדליקים ומכבים הגנות, ורואים את המגפה מתפשטת.",
      p3: "מציירים צוות של סוכני AI, מחליטים מי מדבר עם מי, ורואים את השיחה זורמת בגרף.",
      p4: "לוח משימות אחד לכל סשני ה-Claude Code שלי: מה מחכה לי, מה רץ, מה גמור.",
      p5: "אוטומט תאי. תאים מתמזגים לאורגניזמים, אורגניזמים מקבלים מודל שפה במקום מוח, והדבר היחיד שמוח יכול לעשות הוא לשכתב את חוקי הגוף שלו.",
      p6: "פידים של חולשות וכופרות נכנסים, התראות מדורגות יוצאות, ישר לטלפון. ככה החדשות הרעות מוצאות אותי ראשון.",
      try: "לנסות", code: "קוד", more: "כל השאר, בלי סדר ←",
      now: "מלמד סוכנים לנהל חקירות סייבר (מודיעין איומים, OSINT, SOC), ובונה את החלק שבודק מה הם מדווחים.",
      now2: "סמוך, אבל בדוק. בעיקר בדוק.", big: "תגיד שלום.",
      foot: "עבודת יד. בלי עוגיות, בלי מעקב, בלי פריימוורק.",
      egg: "יש שפה אחת־עשרה. יש בה 120 מילים.",
      found: "toki! מצאת את השפה האחת־עשרה. גע ב«שלום» שוב כדי לצאת."
    },
    ja: {
      greet: "こんにちは", skip: "本文へ", nav1: "つくったもの", nav2: "いま", nav3: "連絡", langLabel: "言語",
      iam: "", sub: "主に、調査に出かける AI エージェント。ときどき真実を持ち帰ってくる。",
      hint: "どうぞ、崩してみて。空いているところをタップすると文字が増えます。", rebuild: "建て直す",
      count: "{n} 個たおれた。だれかが片付けることになる。",
      s1: "つくったもの", s2: "いま", s3: "連絡",
      t1: "脅威インテリジェンス · エージェント", t2: "AI セキュリティ · 砂場", t3: "マルチエージェント", t4: "開発ツール", t5: "人工生命", t6: "脅威インテリジェンス · パイプライン",
      p1: "怪しいドメインか IP を渡すと、手がかりを一つずつたどって自分で調査し、見つけたことをまとめます。",
      p2: "AI のメールアシスタントが回している架空の会社。ワームを放ち、防御をオンオフして、感染が広がるのを眺める。",
      p3: "AI エージェントのチームを描き、だれがだれと話せるかを決めて、会話がグラフを流れるのを見る。",
      p4: "自分の Claude Code セッション全部をまとめるチケットボード。待っているもの、動いているもの、終わったもの。",
      p5: "セル・オートマトン。細胞が集まって生物になり、生物は脳として言語モデルを持つ。脳にできるのは、自分の体のルールを書き換えることだけ。",
      p6: "脆弱性とランサムウェアの情報を取り込み、点数つきの警報をスマホへ直送。悪い知らせが真っ先に届くように。",
      try: "試す", code: "コード", more: "そのほか全部、順不同 →",
      now: "サイバー調査(脅威インテリジェンス、OSINT、SOC)をエージェントに教えつつ、その報告を確かめる部分をつくっています。",
      now2: "信頼せよ、されど確認せよ。主に確認。", big: "気軽にどうぞ。",
      foot: "手づくり。クッキーなし、トラッカーなし、フレームワークなし。",
      egg: "十一番目の言語がある。単語は 120 個。",
      found: "toki! 十一番目の言語を見つけた。もう一度「こんにちは」をタップで戻る。"
    },
    zh: {
      greet: "你好", skip: "跳到内容", nav1: "作品", nav2: "现在", nav3: "联系", langLabel: "语言",
      iam: "我是", sub: "主要是会自己去调查的 AI 智能体。有时它们会带着真相回来。",
      hint: "来吧,推倒它。点空白处会掉下更多字母。", rebuild: "重建",
      count: "倒了 {n} 个。总得有人收拾。",
      s1: "作品", s2: "现在", s3: "联系",
      t1: "威胁情报 · 智能体", t2: "AI 安全 · 沙盒", t3: "多智能体", t4: "开发工具", t5: "人工生命", t6: "威胁情报 · 流水线",
      p1: "给它一个可疑的域名或 IP。它会自己一条线索接一条线索地调查,再把发现写成报告。",
      p2: "一家由 AI 邮件助手运营的虚构公司。放出一只蠕虫,开关各种防御,看疫情怎么蔓延。",
      p3: "画出一支 AI 智能体团队,决定谁能和谁说话,然后看对话在图里流动。",
      p4: "一块看板管理我所有的 Claude Code 会话:等我处理的、正在跑的、已完成的。",
      p5: "一个细胞自动机。细胞融合成生物,生物得到一个语言模型当大脑,而大脑唯一能做的,就是改写自己身体的规则。",
      p6: "输入漏洞和勒索软件情报,输出打好分的警报,直接推到手机。让坏消息第一个找到我。",
      try: "试试", code: "代码", more: "其余的,没排序 →",
      now: "在教智能体做网络安全调查(威胁情报、OSINT、SOC),同时打造检查它们汇报内容的那一环。",
      now2: "信任,但要核实。主要是核实。", big: "打个招呼吧。",
      foot: "纯手工。没有 cookie,没有追踪,没有框架。",
      egg: "还有第十一种语言。它只有 120 个词。",
      found: "toki!你找到了第十一种语言。再点一次「你好」就能回去。"
    },
    id: {
      greet: "halo", skip: "Langsung ke isi", nav1: "Karya", nav2: "Sekarang", nav3: "Halo", langLabel: "Bahasa",
      iam: "aku", sub: "Kebanyakan agen AI yang pergi menyelidiki. Kadang mereka pulang membawa kebenaran.",
      hint: "Ayo, robohkan saja. Ketuk ruang kosong untuk huruf tambahan.", rebuild: "Bangun lagi",
      count: "{n} roboh. Nanti ada yang harus membereskan.",
      s1: "karya", s2: "sekarang", s3: "halo",
      t1: "intelijen ancaman · agen", t2: "keamanan AI · sandbox", t3: "multi-agen", t4: "alat developer", t5: "kehidupan buatan", t6: "intelijen ancaman · pipeline",
      p1: "Beri dia domain atau IP yang mencurigakan. Dia menyelidiki sendiri, petunjuk demi petunjuk, lalu menulis apa yang ditemukan.",
      p2: "Perusahaan palsu yang dijalankan asisten email AI. Kamu melepas worm, menyalakan dan mematikan pertahanan, lalu menonton wabahnya menyebar.",
      p3: "Gambar tim agen AI, tentukan siapa boleh bicara dengan siapa, lalu lihat percakapannya mengalir di graf.",
      p4: "Satu papan tiket untuk semua sesi Claude Code-ku: yang menungguku, yang sedang jalan, yang sudah selesai.",
      p5: "Sebuah automaton seluler. Sel-sel bergabung jadi organisme, organisme dapat model bahasa sebagai otak, dan satu-satunya yang bisa dilakukan otak itu adalah menulis ulang aturan tubuhnya sendiri.",
      p6: "Masuk: kabar kerentanan dan ransomware. Keluar: peringatan berskor, langsung ke ponsel. Biar kabar buruk menemukanku duluan.",
      try: "Coba", code: "Kode", more: "Sisanya, tanpa urutan →",
      now: "Mengajari agen melakukan investigasi siber (intelijen ancaman, OSINT, SOC), dan membangun bagian yang memeriksa laporan mereka.",
      now2: "Percaya, tapi periksa. Terutama periksa.", big: "Sapa aku.",
      foot: "Buatan tangan. Tanpa cookie, tanpa pelacak, tanpa framework.",
      egg: "Ada bahasa kesebelas. Kosakatanya 120 kata.",
      found: "toki! Kamu menemukan bahasa kesebelas. Ketuk halo lagi untuk keluar."
    },
    tok: {
      greet: "toki", skip: "o tawa lipu", nav1: "ijo", nav2: "tenpo ni", nav3: "toki", langLabel: "toki",
      iam: "mi", sub: "mi pali e ilo sona. ilo li tawa alasa e sona. tenpo ante la ona li kama jo e lon.",
      hint: "o pakala e ni. o luka e ma weka la sitelen sin li kama.", rebuild: "o pali sin",
      count: "ijo {n} li anpa. jan li wile pali sin.",
      s1: "ijo", s2: "tenpo ni", s3: "toki",
      t1: "alasa ike · ilo", t2: "ilo sona li awen ala", t3: "ilo mute", t4: "ilo pali", t5: "lon pi ilo", t6: "alasa ike · nasin",
      p1: "o pana e nimi ike. ilo li alasa e sona, li sitelen e ijo ale.",
      p2: "kulupu pali li jo e ilo sona. sina pana e pipi ike. pipi li tawa jan ale anu seme?",
      p3: "o sitelen e kulupu ilo. jan seme li ken toki tawa jan seme?",
      p4: "lipu wan li jo e pali ale mi.",
      p5: "kiwen lili li kama wan, li kama jo e lawa. lawa li ken ante e nasin sijelo taso.",
      p6: "sona ike li kama, ilo li toki tawa ilo toki mi.",
      try: "o lukin", code: "nasin", more: "ijo ante ale →",
      now: "mi pana e sona alasa tawa ilo. mi pali e ilo ni: ona li lukin e ni: ilo li toki lon anu seme?",
      now2: "o sona. o lukin sin.", big: "o toki tawa mi.",
      foot: "luka mi li pali e ni. ala li alasa e sina.",
      egg: "toki pona li jo e nimi 120 taso.",
      found: "sina kama sona e toki pona! o luka e toki la sina tawa."
    }
  };
  var RTL = { ar: 1, he: 1 };
  var keep = function (k, v) { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  var saved = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  function pick() {
    var q = (location.search.match(/[?&]lang=([a-z]{2,3})/i) || [])[1];
    if (q && T[q.toLowerCase()]) return q.toLowerCase();
    var s = saved("lang"); if (s && T[s]) return s;
    var list = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var b = String(list[i]).toLowerCase().split("-")[0];
      if (b === "iw") b = "he"; if (b === "in") b = "id";
      if (T[b] && b !== "tok") return b;
    }
    return "en";
  }
  var lang = pick();
  var root = document.documentElement;
  root.lang = lang === "tok" ? "tok" : lang;
  root.dir = RTL[lang] ? "rtl" : "ltr";
  if (lang !== "en") root.className += " i18n-wait";
  window.I18N = {
    T: T, RTL: RTL, lang: lang, keep: keep,
    apply: function (l) {
      var d = T[l] || T.en; this.lang = l;
      root.lang = l; root.dir = RTL[l] ? "rtl" : "ltr";
      var els = document.querySelectorAll("[data-i]");
      for (var i = 0; i < els.length; i++) {
        var k = els[i].getAttribute("data-i");
        if (d[k] !== undefined) els[i].textContent = d[k];
      }
      document.title = "Alexandre Pinoteau · building stuff";
      root.classList.remove("i18n-wait");
    }
  };
})();
