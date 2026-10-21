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
      found: "toki! You found the eleventh language. Tap hello again to leave.",
      nav4: "Blog", s4: "blog", blog0: "Nothing here yet. The first post is on its way.", back: "← Back",
      sndOn: "Sound off", sndOff: "Sound on"
    },
    fr: {
      greet: "salut", skip: "Aller au contenu", nav1: "Projets", nav2: "En ce moment", nav3: "Contact", langLabel: "Langue",
      iam: "moi c'est", sub: "Surtout des agents IA qui partent enquêter. Des fois, ils reviennent avec la vérité.",
      hint: "Vas-y, fais tout tomber. Un clic dans le vide, il en pleut d'autres.", rebuild: "Tout remettre",
      count: "{n} par terre. Faudra bien que quelqu'un range.",
      s1: "projets", s2: "en ce moment", s3: "contact",
      t1: "threat intel · agent", t2: "sécu IA · bac à sable", t3: "multi-agents", t4: "outils de dev", t5: "vie artificielle", t6: "threat intel · pipeline",
      p1: "Tu lui files un domaine ou une IP louche. Il mène l'enquête tout seul, de pivot en pivot, et te rend son rapport.",
      p2: "Une fausse boîte où des assistants IA gèrent les mails. Tu lâches un ver, tu coupes ou tu remets les défenses, et tu regardes l'épidémie se répandre.",
      p3: "Tu dessines une équipe d'agents IA, tu choisis qui a le droit de parler à qui, et tu regardes la conversation se propager dans le graphe.",
      p4: "Un seul tableau de tickets pour toutes mes sessions Claude Code : ce qui attend que je m'en occupe, ce qui tourne, ce qui est fini.",
      p5: "Un automate cellulaire. Les cellules s'assemblent en organismes, chaque organisme reçoit un modèle de langage en guise de cerveau, et ce cerveau ne sait faire qu'une chose : réécrire les règles de son propre corps.",
      p6: "Des flux de vulnérabilités et de ransomwares d'un côté, des alertes triées de l'autre, direct sur mon téléphone. Les mauvaises nouvelles, je préfère les apprendre en premier.",
      try: "Tester", code: "Code", more: "Tout le reste, en vrac →",
      now: "J'apprends à des agents à mener des enquêtes cyber (threat intel, OSINT, SOC). Et je construis ce qui vérifie ce qu'ils racontent.",
      now2: "Faire confiance, oui. Mais vérifier. Surtout vérifier.", big: "Écris-moi.",
      foot: "Fait main. Pas de cookies, pas de traqueurs, pas de framework.",
      egg: "Il y a une onzième langue. Elle tient en 120 mots.",
      found: "toki ! Tu as trouvé la onzième langue. Retouche « salut » pour revenir.",
      nav4: "Blog", s4: "blog", blog0: "Rien pour l'instant. Le premier article arrive.", back: "← Retour",
      sndOn: "Couper le son", sndOff: "Mettre le son"
    },
    es: {
      greet: "hola", skip: "Ir al contenido", nav1: "Proyectos", nav2: "Ahora", nav3: "Hola", langLabel: "Idioma",
      iam: "soy", sub: "Sobre todo agentes de IA que salen a investigar. A veces vuelven con la verdad.",
      hint: "Venga, tíralo todo. Toca el espacio vacío para más letras.", rebuild: "Reconstruir",
      count: "{n} por el suelo. Alguien tendrá que recogerlo.",
      s1: "proyectos", s2: "ahora", s3: "hola",
      t1: "threat intel · agente", t2: "seguridad IA · sandbox", t3: "multiagente", t4: "herramientas para devs", t5: "vida artificial", t6: "threat intel · pipeline",
      p1: "Dale un dominio o una IP sospechosa. Investiga solo, pista tras pista, y te entrega el informe con lo que encontró.",
      p2: "Una empresa de mentira cuyo correo lo llevan asistentes de IA. Sueltas un gusano, activas y desactivas las defensas y ves cómo se propaga el brote.",
      p3: "Dibuja un equipo de agentes de IA, decide quién puede hablar con quién y mira cómo se propaga la conversación por el grafo.",
      p4: "Un solo tablero de tickets para todas mis sesiones de Claude Code: lo que espera por mí, lo que está corriendo, lo que ya está hecho.",
      p5: "Un autómata celular. Las células se fusionan en organismos, los organismos reciben un modelo de lenguaje como cerebro, y lo único que puede hacer un cerebro es reescribir las reglas de su propio cuerpo.",
      p6: "Entran feeds de vulnerabilidades y ransomware, salen alertas con puntuación, directas al móvil. Así las malas noticias me encuentran primero.",
      try: "Probar", code: "Código", more: "Todo lo demás, a granel →",
      now: "Enseño a agentes a hacer investigaciones de ciberseguridad (threat intel, OSINT, SOC) y construyo la parte que comprueba lo que cuentan.",
      now2: "Confía, pero verifica. Sobre todo verifica.", big: "Di hola.",
      foot: "Hecho a mano. Sin cookies, sin rastreadores, sin framework.",
      egg: "Existe un idioma número once. Tiene 120 palabras.",
      found: "¡toki! Has encontrado el idioma número once. Vuelve a tocar hola para salir.",
      nav4: "Blog", s4: "blog", blog0: "Aún no hay nada. El primer artículo está en camino.", back: "← Volver",
      sndOn: "Silenciar", sndOff: "Activar sonido"
    },
    it: {
      greet: "ciao", skip: "Vai al contenuto", nav1: "Cose", nav2: "Adesso", nav3: "Ciao", langLabel: "Lingua",
      iam: "sono", sub: "Soprattutto agenti IA che vanno a indagare. A volte tornano con la verità.",
      hint: "Dai, butta giù tutto. Tocca lo spazio vuoto per altre lettere.", rebuild: "Ricostruisci",
      count: "{n} per terra. Qualcuno dovrà rimettere a posto.",
      s1: "cose", s2: "adesso", s3: "ciao",
      t1: "threat intel · agente", t2: "sicurezza IA · sandbox", t3: "multi-agent", t4: "tool per sviluppatori", t5: "vita artificiale", t6: "threat intel · pipeline",
      p1: "Dagli un dominio o un IP sospetto. Indaga da solo, pista dopo pista, e ti consegna il rapporto.",
      p2: "Un'azienda finta in cui le email le gestiscono assistenti IA. Lanci un worm, accendi e spegni le difese e guardi l'epidemia diffondersi.",
      p3: "Disegna un team di agenti IA, decidi chi può parlare con chi e guarda la conversazione propagarsi nel grafo.",
      p4: "Un'unica bacheca di ticket per tutte le mie sessioni Claude Code: cosa aspetta una mia mossa, cosa è in corso, cosa è finito.",
      p5: "Un automa cellulare. Le cellule si fondono in organismi, gli organismi ricevono un modello linguistico al posto del cervello, e l'unica cosa che un cervello sa fare è riscrivere le regole del proprio corpo.",
      p6: "In ingresso feed di vulnerabilità e ransomware, in uscita allerte con un punteggio, dritte sul telefono. Così le brutte notizie mi trovano per primo.",
      try: "Provalo", code: "Codice", more: "Tutto il resto, alla rinfusa →",
      now: "Insegno agli agenti a condurre indagini cyber (threat intel, OSINT, SOC) e costruisco la parte che verifica quello che riferiscono.",
      now2: "Fidarsi è bene, controllare è meglio. Soprattutto controllare.", big: "Fatti sentire.",
      foot: "Fatto a mano. Niente cookie, niente tracker, niente framework.",
      egg: "Esiste un'undicesima lingua. Ha 120 parole.",
      found: "toki! Hai trovato l'undicesima lingua. Tocca di nuovo ciao per uscire.",
      nav4: "Blog", s4: "blog", blog0: "Ancora niente. Il primo articolo sta arrivando.", back: "← Indietro",
      sndOn: "Silenzia", sndOff: "Attiva l'audio"
    },
    ru: {
      greet: "привет", skip: "К содержанию", nav1: "Проекты", nav2: "Сейчас", nav3: "Написать", langLabel: "Язык",
      iam: "я", sub: "В основном ИИ-агенты, которые сами идут расследовать. Иногда возвращаются с правдой.",
      hint: "Давай, сломай всё. Нажми на пустое место — появятся ещё буквы.", rebuild: "Собрать заново",
      count: "Упало: {n}. Кому-то же придётся убирать.",
      s1: "проекты", s2: "сейчас", s3: "написать",
      t1: "threat intel · агент", t2: "безопасность ИИ · песочница", t3: "мультиагентность", t4: "dev-инструменты", t5: "искусственная жизнь", t6: "threat intel · пайплайн",
      p1: "Дай ему подозрительный домен или IP. Он сам ведёт расследование, зацепка за зацепкой, и пишет отчёт о найденном.",
      p2: "Вымышленная компания, где почту разбирают ИИ-ассистенты. Выпускаешь червя, включаешь и отключаешь защиту и смотришь, как расползается эпидемия.",
      p3: "Нарисуй команду ИИ-агентов, реши, кто с кем может общаться, и смотри, как разговор расходится по графу.",
      p4: "Одна доска тикетов для всех моих сессий Claude Code: что ждёт моего решения, что в работе, что готово.",
      p5: "Клеточный автомат. Клетки сливаются в организмы, организмы получают языковую модель вместо мозга, и единственное, на что способен мозг, — переписывать правила собственного тела.",
      p6: "На входе — ленты уязвимостей и шифровальщиков, на выходе — алерты с оценкой критичности прямо в телефон. Плохие новости должны находить меня первыми.",
      try: "Попробовать", code: "Код", more: "Всё остальное, без разбору →",
      now: "Учу агентов вести киберрасследования (threat intel, OSINT, SOC) и строю часть, которая проверяет их отчёты.",
      now2: "Доверяй, но проверяй. В основном проверяй.", big: "Скажи привет.",
      foot: "Сделано вручную. Без куки, трекеров и фреймворков.",
      egg: "Есть одиннадцатый язык. В нём 120 слов.",
      found: "toki! Ты нашёл одиннадцатый язык. Нажми на «привет» ещё раз, чтобы выйти.",
      nav4: "Блог", s4: "блог", blog0: "Пока пусто. Первый пост уже в пути.", back: "← Назад",
      sndOn: "Выключить звук", sndOff: "Включить звук"
    },
    ar: {
      greet: "مرحبا", skip: "انتقل إلى المحتوى", nav1: "مشاريع", nav2: "الآن", nav3: "راسلني", langLabel: "اللغة",
      iam: "أنا", sub: "في الغالب وكلاء ذكاء اصطناعي يخرجون للتحقيق. وأحيانًا يعودون بالحقيقة.",
      hint: "هيا، اقلب كل شيء. اضغط على أي مساحة فارغة لتنزل حروف أخرى.", rebuild: "أعد البناء",
      count: "سقط {n}. سيضطر أحدهم إلى ترتيب الفوضى.",
      s1: "مشاريع", s2: "الآن", s3: "راسلني",
      t1: "استخبارات التهديدات · وكيل", t2: "أمن الذكاء الاصطناعي · بيئة معزولة", t3: "تعدد الوكلاء", t4: "أدوات المطوّرين", t5: "حياة اصطناعية", t6: "استخبارات التهديدات · خط معالجة",
      p1: "أعطه نطاقًا أو عنوان IP مريبًا. يجري التحقيق وحده، خيطًا بعد خيط، ويكتب تقريرًا بما وجده.",
      p2: "شركة وهمية يدير بريدها مساعدون يعملون بالذكاء الاصطناعي. تطلق دودة، تشغّل الدفاعات وتطفئها، وتشاهد العدوى تنتشر.",
      p3: "ارسم فريقًا من وكلاء الذكاء الاصطناعي، وحدّد من يحق له التحدث إلى من، ثم شاهد المحادثة تسري في الرسم.",
      p4: "لوحة تذاكر واحدة لكل جلسات Claude Code الخاصة بي: ما ينتظرني، وما يعمل الآن، وما انتهى.",
      p5: "أوتوماتا خلوية. تندمج الخلايا في كائنات، ويحصل كل كائن على نموذج لغوي بدل الدماغ، والشيء الوحيد الذي يستطيع الدماغ فعله هو إعادة كتابة قواعد جسده.",
      p6: "تدخل خلاصات الثغرات وهجمات الفدية، وتخرج تنبيهات مرتبة بالأهمية مباشرة إلى الهاتف. هكذا تصلني الأخبار السيئة أولًا.",
      try: "جرّبه", code: "الكود", more: "كل الباقي، بلا ترتيب ←",
      now: "أعلّم الوكلاء إجراء تحقيقات سيبرانية (استخبارات التهديدات، OSINT، SOC)، وأبني الجزء الذي يتحقق مما يقولونه.",
      now2: "ثق، لكن تحقّق. والأهم أن تتحقّق.", big: "قل مرحبًا.",
      foot: "صُنع باليد. بلا كوكيز، بلا أدوات تتبّع، بلا إطار عمل.",
      egg: "هناك لغة حادية عشرة. فيها 120 كلمة فقط.",
      found: "toki! وجدت اللغة الحادية عشرة. اضغط على «مرحبا» مرة أخرى للخروج.",
      nav4: "المدوّنة", s4: "المدوّنة", blog0: "لا شيء هنا بعد. أول تدوينة في الطريق.", back: "→ رجوع",
      sndOn: "كتم الصوت", sndOff: "تشغيل الصوت"
    },
    he: {
      greet: "שלום", skip: "דלג לתוכן", nav1: "פרויקטים", nav2: "עכשיו", nav3: "לדבר", langLabel: "שפה",
      iam: "אני", sub: "בעיקר סוכני בינה מלאכותית שיוצאים לחקור. לפעמים הם חוזרים עם האמת.",
      hint: "קדימה, תפיל הכול. לחץ על מקום ריק כדי לקבל עוד אותיות.", rebuild: "לבנות מחדש",
      count: "{n} על הרצפה. מישהו יצטרך לסדר.",
      s1: "פרויקטים", s2: "עכשיו", s3: "לדבר",
      t1: "threat intel · סוכן", t2: "אבטחת AI · ארגז חול", t3: "ריבוי סוכנים", t4: "כלי פיתוח", t5: "חיים מלאכותיים", t6: "threat intel · פייפליין",
      p1: "תן לו דומיין או IP חשוד. הוא חוקר לבד, רמז אחרי רמז, וכותב דוח עם מה שמצא.",
      p2: "חברה בדויה שעוזרי מייל מבוססי AI מנהלים לה את הדואר. משחררים תולעת, מדליקים ומכבים הגנות, ורואים את המגפה מתפשטת.",
      p3: "מציירים צוות של סוכני AI, מחליטים מי מדבר עם מי, ורואים את השיחה זורמת בגרף.",
      p4: "לוח טיקטים אחד לכל הסשנים שלי ב-Claude Code: מה מחכה לי, מה רץ ומה כבר סגור.",
      p5: "אוטומט תאי. תאים מתמזגים לאורגניזמים, כל אורגניזם מקבל מודל שפה בתור מוח, והדבר היחיד שמוח יכול לעשות הוא לשכתב את החוקים של הגוף שלו.",
      p6: "פידים של חולשות אבטחה וכופרה נכנסים, התראות עם ציון יוצאות, ישר לטלפון. ככה החדשות הרעות מוצאות אותי ראשון.",
      try: "לנסות", code: "קוד", more: "כל השאר, בלי סדר ←",
      now: "מלמד סוכנים לנהל חקירות סייבר (threat intel, OSINT, SOC), ובונה את החלק שבודק את הדיווחים שלהם.",
      now2: "סמוך, אבל תבדוק. בעיקר תבדוק.", big: "תגיד שלום.",
      foot: "עבודת יד. בלי קוקיז, בלי טראקרים, בלי פריימוורק.",
      egg: "יש גם שפה מספר 11. יש בה 120 מילים.",
      found: "toki! מצאת את שפה מספר 11. לחץ על «שלום» שוב כדי לצאת.",
      nav4: "בלוג", s4: "בלוג", blog0: "עוד אין כאן כלום. הפוסט הראשון בדרך.", back: "→ חזרה",
      sndOn: "השתקה", sndOff: "הפעלת קול"
    },
    ja: {
      greet: "こんにちは", skip: "本文へ", nav1: "つくったもの", nav2: "いま", nav3: "連絡", langLabel: "言語",
      iam: "", sub: "主に、調査に出かける AI エージェント。ときどき真実を持ち帰ってくる。",
      hint: "どうぞ、崩してみて。何もないところをタップすると文字が増えるよ。", rebuild: "建て直す",
      count: "{n} 個倒れた。だれかが片付けなきゃ。",
      s1: "つくったもの", s2: "いま", s3: "連絡",
      t1: "脅威インテリジェンス · エージェント", t2: "AI セキュリティ · サンドボックス", t3: "マルチエージェント", t4: "開発ツール", t5: "人工生命", t6: "脅威インテリジェンス · パイプライン",
      p1: "怪しいドメインか IP を渡すと、手がかりを一つずつたどって自分で調査し、見つけたことをまとめます。",
      p2: "AI のメールアシスタントが回している架空の会社。ワームを放ち、防御をオンオフして、感染が広がるのを眺める。",
      p3: "AI エージェントのチームを描き、だれがだれと話せるかを決めて、会話がグラフを流れるのを見る。",
      p4: "自分の Claude Code セッション全部をまとめるチケットボード。待っているもの、動いているもの、終わったもの。",
      p5: "セル・オートマトン。細胞が集まって生物になり、生物は脳として言語モデルを持つ。脳にできるのは、自分の体のルールを書き換えることだけ。",
      p6: "脆弱性とランサムウェアのフィードを取り込み、スコア付きのアラートをスマホへ直送。悪いニュースが真っ先に届くように。",
      try: "試す", code: "コード", more: "そのほか全部、順不同 →",
      now: "サイバー攻撃の調査(脅威インテリジェンス、OSINT、SOC)をエージェントに教えつつ、その報告を確かめる部分をつくっています。",
      now2: "信じる。でも確かめる。ほとんど確かめる。", big: "気軽に声をかけて。",
      foot: "手づくり。クッキーなし、トラッカーなし、フレームワークなし。",
      egg: "11 番目の言語がある。単語は 120 個。",
      found: "toki! 11 番目の言語を見つけた。もう一度「こんにちは」をタップで戻る。",
      nav4: "ブログ", s4: "ブログ", blog0: "まだ何もない。最初の記事はもうすぐ。", back: "← 戻る",
      sndOn: "音を消す", sndOff: "音を出す"
    },
    zh: {
      greet: "你好", skip: "跳到内容", nav1: "作品", nav2: "现在", nav3: "联系", langLabel: "语言",
      iam: "我是", sub: "主要是会自己去调查的 AI 智能体。有时它们会带着真相回来。",
      hint: "来吧，推倒它。点空白处会掉下更多字母。", rebuild: "重建",
      count: "倒了 {n} 个。总得有人收拾。",
      s1: "作品", s2: "现在", s3: "联系",
      t1: "威胁情报 · 智能体", t2: "AI 安全 · 沙箱", t3: "多智能体", t4: "开发工具", t5: "人工生命", t6: "威胁情报 · 流水线",
      p1: "给它一个可疑的域名或 IP。它会自己顺着线索一条条查下去，最后写成报告。",
      p2: "一家由 AI 邮件助手运营的虚构公司。放出一只蠕虫，开关各种防御，看疫情怎么蔓延。",
      p3: "画出一支 AI 智能体团队，决定谁能和谁说话，然后看对话在图里流动。",
      p4: "一块看板管理我所有的 Claude Code 会话：等我处理的、正在跑的、已完成的。",
      p5: "一个细胞自动机。细胞融合成生物，生物得到一个语言模型当大脑，而大脑唯一能做的，就是改写自己身体的规则。",
      p6: "漏洞和勒索软件情报源进，打好分的告警出，直接推到手机。让坏消息第一个找到我。",
      try: "试试", code: "代码", more: "其余的，没整理 →",
      now: "在教智能体做网络安全调查（威胁情报、OSINT、SOC），同时打造检查它们汇报内容的那一环。",
      now2: "信任，但要核实。主要是核实。", big: "打个招呼吧。",
      foot: "纯手工。没有 cookie，没有追踪，没有框架。",
      egg: "还有第十一种语言。它只有 120 个词。",
      found: "toki！你找到了第十一种语言。再点一次「你好」就能回去。",
      nav4: "博客", s4: "博客", blog0: "这里还没有内容。第一篇文章马上就来。", back: "← 返回",
      sndOn: "关闭声音", sndOff: "打开声音"
    },
    id: {
      greet: "halo", skip: "Langsung ke isi", nav1: "Proyek", nav2: "Sekarang", nav3: "Halo", langLabel: "Bahasa",
      iam: "aku", sub: "Kebanyakan agen AI yang berangkat menyelidiki sesuatu. Kadang mereka pulang membawa kebenaran.",
      hint: "Ayo, robohkan semuanya. Ketuk bagian yang kosong untuk huruf tambahan.", rebuild: "Bangun lagi",
      count: "{n} roboh. Ada yang harus beres-beres nih.",
      s1: "proyek", s2: "sekarang", s3: "halo",
      t1: "threat intel · agen", t2: "keamanan AI · sandbox", t3: "multi-agen", t4: "tool developer", t5: "kehidupan buatan", t6: "threat intel · pipeline",
      p1: "Kasih dia domain atau IP yang mencurigakan. Dia menyelidiki sendiri, petunjuk demi petunjuk, lalu menulis laporan dari temuannya.",
      p2: "Perusahaan palsu yang emailnya diurus asisten AI. Kamu melepas worm, menyalakan dan mematikan pertahanan, lalu melihat wabahnya menyebar.",
      p3: "Gambar tim agen AI, atur siapa boleh bicara dengan siapa, lalu lihat percakapannya mengalir di graf.",
      p4: "Satu papan tiket untuk semua sesi Claude Code-ku: yang menunggu aku tangani, yang sedang jalan, yang sudah selesai.",
      p5: "Sebuah automata seluler. Sel-sel menyatu jadi organisme, tiap organisme mendapat model bahasa sebagai otak, dan satu-satunya yang bisa dilakukan otak itu adalah menulis ulang aturan tubuhnya sendiri.",
      p6: "Masuk: feed kerentanan dan ransomware. Keluar: alert berskor, langsung ke ponsel. Biar kabar buruk menemukanku duluan.",
      try: "Coba", code: "Kode", more: "Sisanya, acak-acakan →",
      now: "Mengajari agen melakukan investigasi siber (threat intel, OSINT, SOC), sambil membangun bagian yang memeriksa laporan mereka.",
      now2: "Percaya, tapi periksa. Terutama periksa.", big: "Sapa aku.",
      foot: "Buatan tangan. Tanpa cookie, tanpa pelacak, tanpa framework.",
      egg: "Ada bahasa kesebelas. Kosakatanya 120 kata.",
      found: "toki! Kamu menemukan bahasa kesebelas. Ketuk halo lagi untuk keluar.",
      nav4: "Blog", s4: "blog", blog0: "Belum ada apa-apa. Tulisan pertama segera hadir.", back: "← Kembali",
      sndOn: "Matikan suara", sndOff: "Nyalakan suara"
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
  var ALT = {
    en: "Pixel art: a workbench on a cliff at the edge of the world, at dusk. Little lantern drones fly out over the clouds, threads of light linking them into a graph.",
    fr: "Pixel art : un établi au bord d'une falaise, au bout du monde, à la tombée du jour. De petits drones à lanterne filent au-dessus des nuages, reliés par des fils de lumière.",
    es: "Pixel art: un banco de trabajo en un acantilado al borde del mundo, al anochecer. Pequeños drones con farol vuelan sobre las nubes, unidos por hilos de luz.",
    it: "Pixel art: un banco da lavoro su una scogliera ai confini del mondo, al tramonto. Piccoli droni con lanterna volano sopra le nuvole, legati da fili di luce.",
    ru: "Пиксель-арт: верстак на обрыве на краю света, в сумерках. Маленькие дроны с фонариками летят над облаками, связанные нитями света.",
    ar: "فن البكسل: طاولة عمل على جرف عند حافة العالم وقت الغروب. طائرات صغيرة بفوانيس تحلّق فوق الغيوم، تربطها خيوط من الضوء.",
    he: "פיקסל־ארט: שולחן עבודה על צוק בקצה העולם, בשעת דמדומים. רחפנים קטנים עם פנסים עפים מעל העננים, מחוברים בחוטי אור.",
    ja: "ピクセルアート：世界の果ての崖に置かれた作業台、夕暮れ。ランタンを下げた小さなドローンが雲の上へ飛び立ち、光の糸でつながっていく。",
    zh: "像素画:黄昏时分,世界尽头的悬崖上放着一张工作台。提着灯笼的小无人机飞向云海,彼此由光线连成一张网。",
    id: "Pixel art: meja kerja di tebing di ujung dunia, saat senja. Drone kecil berlentera terbang di atas awan, terhubung benang cahaya.",
    tok: "sitelen: supa pali li lon nena lon pini ma. ilo waso lili li tawa sewi kon. linja suno li linja e ona."
  };
  window.I18N = {
    T: T, RTL: RTL, lang: lang, keep: keep,
    apply: function (l) {
      var d = T[l] || T.en; this.lang = l;
      root.lang = l; root.dir = RTL[l] ? "rtl" : "ltr";
      var els = document.querySelectorAll("[data-i]");
      for (var i = 0; i < els.length; i++) {
        var k = els[i].getAttribute("data-i");
        var v = d[k] !== undefined ? d[k] : T.en[k];
        if (v !== undefined) els[i].textContent = v;
      }
      var ar = document.querySelectorAll("[data-ia]");
      for (var j = 0; j < ar.length; j++) {
        var ka = ar[j].getAttribute("data-ia"), va = d[ka] !== undefined ? d[ka] : T.en[ka];
        if (va !== undefined) ar[j].setAttribute("aria-label", va);
      }
      if (window.onLang) window.onLang(l);
      var art = document.getElementById("art");
      if (art) art.alt = ALT[l] || ALT.en;
      document.title = "Alexandre Pinoteau · building stuff";
      root.classList.remove("i18n-wait");
    }
  };
})();
