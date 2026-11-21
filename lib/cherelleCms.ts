export type CmsLanguage = "nl" | "en";

export type CmsCopy = {
  nl: string;
  en: string;
};

export type CmsContentMap = Record<string, CmsCopy>;

export type CmsReview = {
  id: string;
  name: string;
  role_nl: string | null;
  role_en: string | null;
  quote_nl: string;
  quote_en: string;
  image_url: string | null;
  image_storage_path: string | null;
  experience_date: string | null;
  is_published: boolean;
  sort_order: number;
};

export type CmsMedia = {
  slot: string;
  storage_path: string;
  public_url: string;
  alt_nl: string | null;
  alt_en: string | null;
};

export type CmsSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email?: string;
  };
};

export type CherelleClientStatus = "invited" | "active" | "completed" | "archived";

export type CherelleClient = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: CherelleClientStatus;
  invited_at: string;
  activated_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CherelleIntake = {
  client_id: string;
  birth_date: string | null;
  phone: string | null;
  intention: string | null;
  energy_experience_level: "none" | "basic" | "advanced" | null;
  intense_energy_experience: boolean | null;
  intense_energy_details: string | null;
  physical_conditions: boolean | null;
  physical_conditions_details: string | null;
  medications: boolean | null;
  medications_details: string | null;
  meditation_breathwork_experience: boolean | null;
  meditation_breathwork_details: string | null;
  mental_health_or_trauma: boolean | null;
  mental_health_or_trauma_details: string | null;
  stimulants: boolean | null;
  stimulants_details: string | null;
  contraindications_acknowledged: boolean;
  declaration_accepted: boolean;
  signature_name: string | null;
  signature_date: string | null;
  submitted_at: string | null;
  updated_at: string;
};

export type CherelleClientMessage = {
  id: string;
  client_id: string;
  subject: string;
  body: string;
  created_by: string | null;
  created_at: string;
  read_at: string | null;
};

export type CherelleAdminEvent = {
  id: string;
  client_id: string | null;
  event_type: "account_activated" | "intake_submitted";
  title: string;
  created_at: string;
  read_at: string | null;
};

export type CherelleDashboardMetrics = {
  clients_total: number;
  clients_active: number;
  visitors_today: number;
  visitors_7d: number;
  visitors_30d: number;
  page_views_today: number;
  unread_activity: number;
};

export type CherelleNewsletterLog = {
  id: string;
  subject: string;
  body: string;
  image_urls: string[];
  recipient_count: number;
  sent_by: string | null;
  sent_at: string;
};

export type NewsletterImage = {
  url: string;
  storage_path: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const sessionKey = "cherelle-cms-session";
const accountSessionKey = "cherelle-account-session";

export const isCmsConfigured = Boolean(supabaseUrl && supabaseKey);

export const DEFAULT_HOMEPAGE_CONTENT: CmsContentMap = {
  hero_sentence_1: {
    nl: "Je bent al zo lang sterk geweest.",
    en: "You have been strong for so long.",
  },
  hero_sentence_2: {
    nl: "Maar ben je ook Zacht geweest voor jezelf?",
    en: "But have you also been gentle with yourself?",
  },
  hero_subtitle: {
    nl: "Voor de vrouw die alles draagt en zichzelf onderweg is kwijtgeraakt.",
    en: "For the woman who carries everything and lost herself along the way.",
  },
  hero_cta: { nl: "Herkenbaar?", en: "Recognize this?" },
  quote_bar: {
    nl: "Van hoofd naar hart. Van doen naar zijn. Van controle naar overgave.",
    en: "From head to heart. From doing to being. From control to surrender.",
  },

  recognition_kicker: { nl: "Herkenning", en: "Recognition" },
  recognition_title: { nl: "Herken je dit?", en: "Does this feel familiar?" },
  recognition_body: {
    nl: "Je staat altijd klaar, voor je werk, je gezin en iedereen om je heen. ’s Avonds lig je in bed en je hoofd blijft maar doorgaan. Je bent moe, al zo lang dat je bijna vergeten bent hoe het anders voelde. Van buiten ziet je leven er goed uit, en toch vraag je je soms af waarom jij dat geluk niet voelt.",
    en: "You are always there for your work, your family and everyone around you. At night you lie in bed while your mind keeps going. You are tired, for so long that you have almost forgotten what it felt like to feel different. From the outside your life looks good, yet sometimes you wonder why you do not feel that happiness.",
  },
  recognition_emphasis: {
    nl: "Er is niets mis met je. Je hebt alleen heel lang gezocht op een plek waar het niet te vinden is.",
    en: "There is nothing wrong with you. You have simply been searching for a long time in a place where it cannot be found.",
  },
  recognition_cta: {
    nl: "Lees verder over herkenning",
    en: "Read more about recognition",
  },

  homecoming_kicker: { nl: "Wat er mogelijk is", en: "What becomes possible" },
  homecoming_title: {
    nl: "Thuiskomen in je lichaam",
    en: "Coming home to your body",
  },
  homecoming_body: {
    nl: "Stel je voor dat je weer voelt wat je nodig hebt, en daar ook naar durft te handelen. Dat je nee kunt zeggen zonder schuldgevoel en hulp kunt aannemen zonder dat het ongemakkelijk voelt. Dat je rust neemt omdat je moe bent, en dat er weer ruimte is voor plezier, sensualiteit en vrijheid.",
    en: "Imagine feeling what you need again, and daring to act on it. Saying no without guilt and accepting help without discomfort. Resting because you are tired, while making space again for pleasure, sensuality and freedom.",
  },
  homecoming_manifesto: {
    nl: "Van hoofd naar hart.\nVan doen naar zijn.\nVan controle naar overgave.",
    en: "From head to heart.\nFrom doing to being.\nFrom control to surrender.",
  },
  homecoming_cta: {
    nl: "Ontdek wat thuiskomen betekent",
    en: "Discover what coming home means",
  },

  guidance_kicker: { nl: "Zo kan ik je begeleiden", en: "How I can support you" },
  guidance_title: {
    nl: "Een vorm die past bij waar jij nu bent.",
    en: "A form of support that meets you where you are.",
  },
  guidance_1_title: { nl: "The Feminine Way", en: "The Feminine Way" },
  guidance_1_body: {
    nl: "Een persoonlijk traject van zes maanden waarin je stap voor stap terugkomt in je lichaam en weer leert leven vanuit je vrouwelijke energie. Volledig afgestemd op jou en in jouw tempo. Veel vrouwen merken dat ze na dit traject rustiger zijn, beter voelen wat ze nodig hebben en weer kunnen ontvangen.",
    en: "A personal six-month journey in which you gradually return to your body and learn to live from your feminine energy again. Fully tailored to you and at your pace. Many women notice they feel calmer, sense what they need more clearly and are able to receive again.",
  },
  guidance_1_cta: { nl: "Lees meer", en: "Read more" },
  guidance_2_title: { nl: "1-op-1 sessie", en: "1-to-1 session" },
  guidance_2_body: {
    nl: "Een sessie van ongeveer anderhalf uur waarin we samen werken met wat er op dat moment in jou leeft. Ook mogelijk samen met je partner, vriendin of moeder.",
    en: "A session of around ninety minutes in which we work together with whatever is alive in you at that moment. Also possible together with your partner, a friend or your mother.",
  },
  guidance_2_cta: { nl: "Bekijk sessies", en: "View sessions" },
  guidance_3_title: { nl: "Ceremonies", en: "Ceremonies" },
  guidance_3_body: {
    nl: "Samen met andere vrouwen ruimte maken om te voelen, los te laten en te verbinden.",
    en: "Creating space with other women to feel, let go and connect.",
  },
  guidance_3_cta: { nl: "Bekijk ceremonies", en: "View ceremonies" },

  approach_kicker: { nl: "Mijn manier van werken", en: "My approach" },
  approach_body: {
    nl: "We werken altijd in jouw tempo. Soms raken we diepe lagen aan, zoals oude patronen of wat je van thuis hebt meegekregen. Daar ga ik zorgvuldig mee om, zodat het veilig voelt en je niets hoeft te forceren.",
    en: "We always work at your pace. Sometimes we touch deeper layers, such as old patterns or things you learned at home. I approach those carefully, so it feels safe and nothing needs to be forced.",
  },
  approach_emphasis: {
    nl: "Jij bepaalt waar je naartoe wilt, ik loop met je mee en hou je vast als het spannend wordt.",
    en: "You decide where you want to go. I walk beside you and support you when it feels vulnerable.",
  },
  approach_note: {
    nl: "Mijn begeleiding is geen vervanging van therapie of medische zorg. Twijfel je of dit bij je past? Dan bespreken we dat gewoon samen.",
    en: "My guidance is not a replacement for therapy or medical care. Unsure whether this is right for you? We can simply discuss that together.",
  },
  approach_cta: {
    nl: "Lees meer over mijn werkwijze",
    en: "Read more about my approach",
  },

  reviews_kicker: { nl: "Ervaringen", en: "Experiences" },
  reviews_title: { nl: "Wat vrouwen zeggen", en: "What women say" },

  about_kicker: { nl: "Over mij", en: "About me" },
  about_title: { nl: "Ik ben Cherelle Elisa", en: "I’m Cherelle Elisa" },
  about_body_1: {
    nl: "Ik ken dit van binnenuit. Jarenlang deed ik alles goed: harder werken, meer leren, er altijd voor anderen zijn. En toch bleef het van binnen leeg. Op een reis naar Egypte voelde ik voor het eerst hoe het is om gewoon te zijn, vrij en in het moment.",
    en: "I know this from the inside. For years I did everything right: working harder, learning more and always being there for others. Yet inside it still felt empty. During a journey to Egypt I felt for the first time what it is like to simply be, free and present.",
  },
  about_body_2: {
    nl: "Sindsdien begeleid ik vrouwen terug naar zichzelf. Inmiddels zijn dat er zo’n 500, en organiseerde ik ongeveer 15 ceremonies.",
    en: "Since then I have guided women back to themselves. By now that is around 500 women, and I have organised about 15 ceremonies.",
  },
  about_cta: { nl: "Lees mijn verhaal", en: "Read my story" },

  invitation_kicker: { nl: "Uitnodiging", en: "Invitation" },
  invitation_title: {
    nl: "Voel je dat het tijd is?",
    en: "Do you feel it is time?",
  },
  invitation_body: {
    nl: "Plan een vrijblijvend kennismakingsgesprek. We kijken samen waar je nu staat en wat bij je past. Je mag ook gewoon een berichtje sturen.",
    en: "Plan a no-obligation introductory conversation. Together we will look at where you are now and what suits you. You are also welcome to simply send a message.",
  },

  detail_recognition_hero_kicker: { nl: "Herkenning", en: "Recognition" },
  detail_recognition_hero_title: {
    nl: "Je bent uitgeput. En dat gaat niet over met een weekendje niks doen.",
    en: "You are exhausted. And a quiet weekend is not going to fix it.",
  },
  detail_recognition_hero_intro: {
    nl: "Jij bent de vrouw die alles regelt. Voor je kinderen, je partner, je vriendinnen — je staat altijd klaar voor iedereen.",
    en: "You are the woman who takes care of everything. Your children, your partner, your friends — you are always there for everyone.",
  },
  detail_recognition_section_kicker: { nl: "Dit ben jij", en: "This is you" },
  detail_recognition_section_title: {
    nl: "Je bent zo gewend om te dragen, dat je bijna niet meer merkt hoeveel het van je vraagt.",
    en: "You are so used to carrying everything that you barely notice how much it asks of you.",
  },
  detail_recognition_body: {
    nl: "Als er iets gedaan moet worden, ben jij degene die het doet, die het oplost. En ergens voel je de druk: als er iets met mij gebeurt, als ik instort, wie doet het dan? Ik moet sterk blijven.\n\nDus je gaat door. Ook als je voelt dat je zenuwstelsel allang overprikkeld is. Je bent aan, de hele dag, en weet niet meer goed hoe het is om écht uit te schakelen.\n\nIn de loop van de jaren erger je je steeds meer aan dingen die er niet toe doen. Een mok in de verkeerde kast. Een berichtje waar je op moet wachten. Je weet best dat het daar niet echt over gaat, en dat frustreert je soms nog meer.\n\nSoms huil je om iets kleins, en veeg je het meteen weg: doe niet zo raar, er zijn mensen die het harder nodig hebben.\n\nVoor de buitenwereld is je leven perfect. Je hebt een goede baan, een fijn huis, lieve kids, een partner. Hoe kun je nou ongelukkig zijn met dit leven?\n\nEn dat is precies waar het schuldgevoel begint. Want van buiten heb je alles. En van binnen voel je dat niet. Dat verschil draag je al jaren met je mee, zonder dat je het hardop durft te zeggen.\n\nJe bent zo gewend om te doen, dat ontvangen bijna niet meer lukt. Iemand die iets voor jóu doet — daar weet je je geen raad mee. Je voelt iets, en meteen wil je het al oplossen, in plaats van het gewoon even te laten zijn.",
    en: "When something needs to be done, you are the one who does it, who fixes it. And somewhere underneath is the pressure: if something happens to me, if I collapse, who will do it then? I have to stay strong.\n\nSo you keep going. Even when you can feel that your nervous system has been overstimulated for a long time. You are switched on all day and barely remember what it feels like to truly switch off.\n\nOver the years, small things start to irritate you more and more. A mug in the wrong cupboard. A message you have to wait for. You know it is not really about that, which can make it even more frustrating.\n\nSometimes you cry over something small and immediately dismiss it: do not be silly, other people have it much harder.\n\nTo the outside world, your life looks perfect. A good job, a lovely home, wonderful children, a partner. How could you possibly be unhappy with this life?\n\nAnd that is exactly where the guilt begins. From the outside, you have everything. Inside, it does not feel that way. You have carried that difference for years without daring to say it out loud.\n\nYou are so used to doing that receiving has almost become impossible. When someone does something for you, you hardly know what to do with it. You feel something and immediately want to solve it instead of simply letting it be.",
  },
  detail_recognition_emphasis: {
    nl: "Je bent niet ongelukkig omdat er iets mis is met jou. Je bent uitgeput, omdat je al jaren leeft voor iedereen, behalve voor jezelf.",
    en: "You are not unhappy because something is wrong with you. You are exhausted because you have spent years living for everyone except yourself.",
  },
  detail_recognition_transitions_kicker: { nl: "Waar het anders kan beginnen", en: "Where things can begin to change" },
  detail_recognition_transitions_title: { nl: "Niet nóg harder. Wel dichter bij jezelf.", en: "Not harder. Closer to yourself." },
  detail_recognition_transition_1: { nl: "Van jezelf ergeren aan iets kleins, naar merken dat het nooit om het kleine ging.", en: "From getting irritated by something small, to realising it was never really about the small thing." },
  detail_recognition_transition_2: { nl: "Van vijf dingen tegelijk doen en niks echt afkrijgen, naar één ding doen en het laten voelen als genoeg.", en: "From doing five things at once and finishing none of them, to doing one thing and letting that be enough." },
  detail_recognition_transition_3: { nl: "Van huilen om iets kleins en denken ‘doe niet zo raar’, naar weten dat het nooit om het kleine ging.", en: "From crying over something small and telling yourself not to be ridiculous, to knowing it was never really about the small thing." },
  detail_recognition_transition_4: { nl: "Van ‘zo hoort het nu eenmaal’, naar merken dat je het zelf ook anders mag willen.", en: "From ‘this is just how it is’, to realising you are allowed to want something different." },
  detail_recognition_transition_5: { nl: "Van jaren om je heen kijken en denken ‘is dit het nu?’, naar er middenin staan en weten: dit is van mij.", en: "From looking around for years and thinking ‘is this it?’, to standing in the middle of your life and knowing: this is mine." },
  detail_recognition_transition_6: { nl: "Van jezelf wegcijferen en het liefde noemen, naar zien dat het ook uitputting was.", en: "From making yourself smaller and calling it love, to seeing that it was exhaustion too." },
  detail_recognition_transition_7: { nl: "Van sterk moeten blijven omdat niemand anders het overneemt, naar merken dat je het even mag laten zakken.", en: "From having to stay strong because no one else will take over, to realising you are allowed to let it drop for a moment." },
  detail_recognition_cta_kicker: { nl: "Waar jij naar verlangt", en: "What you long for" },
  detail_recognition_cta_title: { nl: "Dus laat me je vertellen waar dit anders kan beginnen.", en: "Let me show you where things can begin to change." },
  detail_recognition_cta_text: { nl: "Niet nóg een manier om vol te houden. Wel weer leren wat echte rust is.", en: "Not another way to keep going. A way back to what real rest feels like." },
  detail_recognition_cta_label: { nl: "Naar Thuiskomen", en: "Go to Coming home" },

  detail_homecoming_hero_kicker: { nl: "Thuiskomen", en: "Coming home" },
  detail_homecoming_hero_title: { nl: "Je verlangt niet naar nog een techniek om het vol te houden.", en: "You are not longing for another technique to keep going." },
  detail_homecoming_hero_intro: { nl: "Je verlangt naar het moment waarop je niet meer hoeft vol te houden.", en: "You are longing for the moment when you no longer have to keep holding everything together." },
  detail_homecoming_section_kicker: { nl: "Waar jij naar verlangt", en: "What you long for" },
  detail_homecoming_section_title: { nl: "Niet meer volhouden. Eindelijk weer voelen wat rust is.", en: "Not holding on anymore. Remembering what real rest feels like." },
  detail_homecoming_body: {
    nl: "Naar een avond waarop je hoofd eindelijk stil is, en je lijf niet meer op scherp staat. Naar voelen wat je voelt, zonder dat je het meteen wil oplossen of wegstoppen.\n\nNaar iemand die iets voor jóu doet, zonder dat je je daar schuldig over voelt.\n\nJe zenuwstelsel mag eindelijk weer leren wat rust is. Niet de rust van een avondje Netflix terwijl je hoofd doorraast, maar rust die blijft zitten.\n\nEn dat schuldgevoel — dat je eigenlijk niet zou mogen klagen, want je hebt het toch goed — dat mag er ook gewoon zijn, zonder dat je het meteen wegredeneert.",
    en: "An evening where your mind is finally quiet and your body is no longer on high alert. Feeling what you feel without immediately trying to fix it or push it away.\n\nSomeone doing something for you without you feeling guilty about it.\n\nYour nervous system is allowed to learn what rest feels like again. Not the kind of rest where you watch Netflix while your mind keeps racing, but a calm that actually stays with you.\n\nAnd that guilt — the feeling that you should not complain because your life is good — is allowed to be there too, without you immediately reasoning it away.",
  },
  detail_homecoming_story_kicker: { nl: "Een verhaal zoals het jouwe", en: "A story like yours" },
  detail_homecoming_story_title: { nl: "Tot ze voor zichzelf koos.", en: "Until she chose herself." },
  detail_homecoming_story_body: {
    nl: "Ze was alleenstaande moeder van drie kinderen, en zorgde voor iedereen — ook voor haar ex, die de kinderen maar één keer per week zag. Als het hem niet uitkwam, was zij degene die haar agenda omgooide.\n\nZe paste haar woonplek aan, haar werktijden, alles, om het voor hem zo makkelijk mogelijk te maken.\n\nToen maakte ze duidelijke afspraken — niet vanuit hardheid, maar vanuit zelfrespect. Er kwam rust: voor haar kinderen, voor de ex, voor haarzelf.\n\nZe nam niet langer klakkeloos aan wat haar werd opgelegd. Ze kwam voor zichzelf op, en daarmee ook voor haar kinderen.\n\nVandaag staat ze op het podium als fitnessmodel. Niet omdat ze harder ging werken, maar omdat ze ownership nam over haar eigen keuzes.",
    en: "She was a single mother of three and took care of everyone — including her ex, who saw the children only once a week. If the timing did not suit him, she was the one who rearranged her schedule.\n\nShe changed where she lived, her working hours, everything, to make life as easy as possible for him.\n\nThen she made clear agreements — not from harshness, but from self-respect. Calm returned: for her children, for her ex, and for herself.\n\nShe stopped simply accepting what was placed on her. She stood up for herself, and in doing so, for her children too.\n\nToday she stands on stage as a fitness model. Not because she started working harder, but because she took ownership of her own choices.",
  },
  detail_homecoming_story_quote: { nl: "Ik bereik helemaal niks als ik voor iedereen zorg draag, behalve voor mijn dromen en mijn doelen.", en: "I achieve nothing if I take care of everyone except my own dreams and goals." },
  detail_homecoming_cta_kicker: { nl: "Begeleiding", en: "Guidance" },
  detail_homecoming_cta_title: { nl: "Welke vorm past bij waar jij nu bent?", en: "What kind of support fits where you are now?" },
  detail_homecoming_cta_text: { nl: "Van een 1:1 sessie tot een langer traject of retreat.", en: "From a 1:1 session to a longer journey or retreat." },
  detail_homecoming_cta_label: { nl: "Bekijk de begeleiding", en: "Explore guidance" },

  detail_guidance_hero_kicker: { nl: "Begeleiding", en: "Guidance" },
  detail_guidance_hero_title: { nl: "Mijn diensten.", en: "My services." },
  detail_guidance_hero_intro: { nl: "Ieder verhaal is anders. Daarom begint begeleiding niet bij een standaardroute, maar bij waar jij vandaag werkelijk staat.", en: "Every story is different. That is why guidance does not begin with a standard route, but with where you truly are today." },
  detail_guidance_section_kicker: { nl: "Mijn diensten", en: "My services" },
  detail_guidance_section_title: { nl: "Een vorm die past bij wat jij nu nodig hebt.", en: "A form of support that meets what you need now." },
  detail_guidance_1_script: { nl: "1:1", en: "1:1" },
  detail_guidance_1_title: { nl: "1:1 sessies", en: "1:1 sessions" },
  detail_guidance_1_body: {
    nl: "We beginnen gewoon met praten. Ik wil weten wie je bent, wat er speelt, en ik vertel je wat we gaan doen, zodat je niet in het onbekende stapt. Dan ga je liggen, en land je in je lijf.\n\nDit is het moment waarop jij eens niet degene bent die iets voor een ander doet. Je hoeft hier niks op te lossen, niks te regelen. Je lichaam geeft je wat je op dat moment nodig hebt — soms is het stil, soms komt er iets los. Wat er ook gebeurt, het mag er zijn.\n\nWat bijna iedereen achteraf zegt: haar schouders zijn eindelijk gezakt. Het overprikkelde gevoel, dat je normaal niet eens meer opmerkt omdat het er altijd is, is voor even weg.\n\nVoor de meeste vrouwen is één sessie een begin, geen eindpunt. Een patroon dat je jarenlang met je meedraagt, gaat niet in negentig minuten weg. Daarom kies je vaak voor een bundel van 3 of 6, met ruimte ertussen om te laten landen.",
    en: "We simply start by talking. I want to know who you are and what is happening in your life, and I explain what we are going to do so you do not step into the unknown. Then you lie down and land in your body.\n\nThis is the moment where you are not the one doing something for someone else. You do not need to solve or organise anything. Your body gives you what you need in that moment — sometimes it is quiet, sometimes something releases. Whatever happens is allowed to be there.\n\nWhat almost everyone says afterwards: their shoulders finally dropped. That overstimulated feeling, which you barely notice anymore because it is always there, is gone for a while.\n\nFor most women, one session is a beginning, not an end point. A pattern you have carried for years does not disappear in ninety minutes. That is why women often choose a bundle of 3 or 6 sessions, with space in between to let things settle.",
  },
  detail_guidance_1_meta: { nl: "Losse sessie €188 · Bundel van 3 of 6", en: "Single session €188 · Bundle of 3 or 6" },
  detail_guidance_2_script: { nl: "The Feminine Way", en: "The Feminine Way" },
  detail_guidance_2_title: { nl: "The Feminine Way — 6 maanden", en: "The Feminine Way — 6 months" },
  detail_guidance_2_body: {
    nl: "Dit traject volgt je chakra's, niet als idee maar als een route door je lichaam. De ene maand werk je aan je basis — grond onder je voeten. Dan je hart — voelen zonder het weg te duwen. Dan je keel — zeggen wat je denkt. Uiteindelijk je kroon — weten wie je bent, zonder het te hoeven bewijzen.\n\nDit is waar het schuldgevoel plaatsmaakt voor iets anders. Waar je leert ontvangen in plaats van alleen maar geven — niet als iets wat je erbij moet doen, maar als iets wat je stap voor stap weer aanleert. Je zenuwstelsel gaat mee in die verandering: het leert dat het niet altijd op scherp hoeft te staan.\n\nIn de praktijk merk je het klein: een nee die makkelijker komt. Iets voelen zonder het meteen weg te stoppen. Jezelf uitspreken zonder het achteraf terug te nemen.",
    en: "This journey follows your chakras, not as an idea but as a route through your body. One month focuses on your foundation — ground beneath your feet. Then your heart — feeling without pushing it away. Then your throat — saying what you think. Eventually your crown — knowing who you are without having to prove it.\n\nThis is where guilt begins to make room for something else. Where you learn to receive instead of only giving — not as another task, but as something you gradually relearn. Your nervous system moves with that change: it learns that it does not always have to stay on high alert.\n\nIn daily life you notice it in small ways: saying no more easily. Feeling something without immediately pushing it away. Speaking your truth without taking it back afterwards.",
  },
  detail_guidance_2_mantra: { nl: "Van hoofd naar hart. Van doen naar zijn. Van controle naar overgave.", en: "From head to heart. From doing to being. From control to surrender." },
  detail_guidance_2_word_1: { nl: "Grenzen", en: "Boundaries" },
  detail_guidance_2_word_2: { nl: "Voelen", en: "Feeling" },
  detail_guidance_2_word_3: { nl: "Uitspreken", en: "Speaking" },
  detail_guidance_2_word_4: { nl: "Kiezen", en: "Choosing" },
  detail_guidance_3_script: { nl: "Retreats", en: "Retreats" },
  detail_guidance_3_title: { nl: "Even helemaal niets hoeven regelen.", en: "Not having to organise anything for a while." },
  detail_guidance_3_body: { nl: "Meerdaags, met andere vrouwen die hetzelfde dragen als jij. Hier hoef je even helemaal niks te regelen — je wordt verzorgd, in plaats van dat jij voor iedereen zorgt.\n\nJe ziet jezelf terug in een ander, en beseft dat je nooit de enige was.", en: "Several days with other women who carry many of the same things you do. Here you do not have to organise anything — you are cared for instead of being the one who takes care of everyone.\n\nYou recognise yourself in another woman and realise you were never the only one." },
  detail_guidance_3_meta: { nl: "Eerstvolgende retreat: eind september 2027 · deuren open vanaf 1 november", en: "Next retreat: late September 2027 · doors open from 1 November" },
  detail_guidance_4_script: { nl: "Ceremonies", en: "Ceremonies" },
  detail_guidance_4_title: { nl: "Soul Unbound", en: "Soul Unbound" },
  detail_guidance_cta_kicker: { nl: "Neem contact op", en: "Get in touch" },
  detail_guidance_cta_title: { nl: "Ieder verhaal is anders, dus laten we gewoon even praten.", en: "Every story is different, so let’s simply talk." },
  detail_guidance_cta_text: { nl: "App me, bel me, of vul het contactformulier in — dan kijken we samen wat bij jou past.", en: "Message me, call me, or fill in the contact form — then we can look together at what fits you." },
  detail_guidance_cta_label: { nl: "Neem contact op", en: "Get in touch" },

  detail_approach_hero_kicker: { nl: "Werkwijze", en: "Approach" },
  detail_approach_hero_title: { nl: "Elke sessie begint bij waar jij vandaag werkelijk staat.", en: "Every session begins with where you truly are today." },
  detail_approach_hero_intro: { nl: "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders.", en: "I do not believe in one fixed approach that is the same for everyone. Every story is different." },
  detail_approach_section_kicker: { nl: "Geen vast protocol", en: "No fixed protocol" },
  detail_approach_section_title: { nl: "Ik begin niet bij een methode. Ik begin bij jou.", en: "I do not begin with a method. I begin with you." },
  detail_approach_body: { nl: "De vrouwen die bij mij komen, herken ik meteen. Werkende vrouwen met een gezin. Vrouwen die het fundament zijn — voor hun kinderen, hun partner, soms hun ex, hun werk, hun hele omgeving.\n\nEn die zelf al zo lang niet meer gedragen worden, dat ze het niet eens meer merken.", en: "I recognise the women who come to me immediately. Working women with families. Women who are the foundation — for their children, their partner, sometimes their ex, their work, their entire environment.\n\nAnd who have gone without being supported themselves for so long that they barely notice it anymore." },
  detail_approach_emphasis: { nl: "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders. Dus elke sessie begint bij waar jij vandaag werkelijk staat.", en: "I do not believe in one fixed approach that is the same for everyone. Every story is different. So every session starts with where you truly are today." },
  detail_approach_method_kicker: { nl: "Een sessie", en: "A session" },
  detail_approach_method_title: { nl: "Zo ontstaat er ruimte.", en: "This is how space begins to open." },
  detail_approach_step_1_title: { nl: "We beginnen gewoon met praten.", en: "We simply start by talking." },
  detail_approach_step_1_body: { nl: "Ik wil weten wie je bent, wat er speelt, en ik vertel je wat we gaan doen, zodat je niet in het onbekende stapt.", en: "I want to know who you are and what is happening, and I explain what we are going to do so you do not step into the unknown." },
  detail_approach_step_2_title: { nl: "Dan land je in je lijf.", en: "Then you land in your body." },
  detail_approach_step_2_body: { nl: "Je gaat liggen. Je hoeft even niet degene te zijn die iets voor een ander doet. Je hoeft niets op te lossen en niets te regelen.", en: "You lie down. For a moment, you are not the one doing something for someone else. You do not need to solve or organise anything." },
  detail_approach_step_3_title: { nl: "Je lichaam geeft aan wat er nodig is.", en: "Your body shows what is needed." },
  detail_approach_step_3_body: { nl: "Soms is het stil, soms komt er iets los. Wat er ook gebeurt, het mag er zijn. Ik werk niet volgens een protocol dat ik al honderd keer heb gedraaid.", en: "Sometimes it is quiet, sometimes something releases. Whatever happens is allowed to be there. I do not work from a protocol I have repeated a hundred times." },
  detail_approach_step_4_title: { nl: "Daarna mag het landen.", en: "Afterwards, it gets space to settle." },
  detail_approach_step_4_body: { nl: "Voor de meeste vrouwen is één sessie een begin, geen eindpunt. Een patroon dat je jarenlang met je meedraagt, gaat niet in negentig minuten weg. Daarom zit er ruimte tussen sessies.", en: "For most women one session is a beginning, not an end point. A pattern carried for years does not disappear in ninety minutes. That is why there is space between sessions." },
  detail_approach_statement: { nl: "Je lichaam geeft je wat je op dat moment nodig hebt.", en: "Your body gives you what you need in that moment." },
  detail_approach_cta_kicker: { nl: "Begeleiding", en: "Guidance" },
  detail_approach_cta_title: { nl: "Voel welke vorm bij jou past.", en: "Feel which form of support suits you." },
  detail_approach_cta_text: { nl: "Je hoeft vooraf niet alles te weten. We beginnen bij waar jij bent.", en: "You do not need to know everything beforehand. We begin where you are." },
  detail_approach_cta_label: { nl: "Bekijk de begeleiding", en: "Explore guidance" },

  detail_about_hero_kicker: { nl: "Over mij", en: "About me" },
  detail_about_hero_title: { nl: "Ik ben Cherelle Elisa.", en: "I’m Cherelle Elisa." },
  detail_about_hero_intro: { nl: "Feminine embodiment coach. Ik ken deze weg niet alleen vanuit mijn werk, maar omdat ik hem zelf gelopen heb — en nog steeds loop.", en: "Feminine embodiment coach. I know this path not only through my work, but because I have walked it myself — and still do." },
  detail_about_section_kicker: { nl: "Mijn verhaal", en: "My story" },
  detail_about_section_title: { nl: "Ik dacht dat ik gewoon sterk was.", en: "I thought I was simply strong." },
  detail_about_body: { nl: "Jarenlang droeg ik een deel in mij dat mij beschermde tegen afwijzing en kritiek. Ik wist het zelf niet eens — ik dacht dat ik gewoon sterk was.\n\nIk zorgde voor iedereen, behalve voor mezelf, en noemde dat liefde. Pas toen ik mezelf volledig ging accepteren, in plaats van mezelf te blijven bewijzen, veranderde er iets fundamenteels. In mijn werk, in mijn relaties, in hoe ik door mijn dagen ga.\n\nDus als ik nu vrouwen begeleid, doe ik dat niet vanuit een boek dat ik gelezen heb. Ik ken de weg, omdat ik hem zelf gelopen heb. En nog steeds loop.\n\nDe vrouwen die bij mij komen, herken ik meteen. Werkende vrouwen met een gezin. Vrouwen die het fundament zijn — voor hun kinderen, hun partner, soms hun ex, hun werk, hun hele omgeving. En die zelf al zo lang niet meer gedragen worden, dat ze het niet eens meer merken.", en: "For years I carried a part of me that protected me from rejection and criticism. I did not even realise it — I thought I was simply strong.\n\nI took care of everyone except myself and called it love. Only when I started fully accepting myself instead of constantly proving myself did something fundamental change. In my work, in my relationships, in the way I move through my days.\n\nSo when I guide women now, I do not do that from a book I have read. I know the path because I have walked it myself. And I am still walking it.\n\nI recognise the women who come to me immediately. Working women with families. Women who are the foundation — for their children, their partner, sometimes their ex, their work, their whole environment. Women who have gone without being supported themselves for so long that they barely notice it anymore." },
  detail_about_emphasis: { nl: "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders. Dus elke sessie begint bij waar jij vandaag werkelijk staat, niet bij een protocol dat ik al honderd keer heb gedraaid.", en: "I do not believe in one fixed approach that is the same for everyone. Every story is different. So every session begins with where you truly are today, not with a protocol I have already repeated a hundred times." },
  detail_about_stat_1_value: { nl: "2", en: "2" },
  detail_about_stat_1_label: { nl: "jaar ervaring", en: "years of experience" },
  detail_about_stat_2_value: { nl: "~500", en: "~500" },
  detail_about_stat_2_label: { nl: "vrouwen begeleid", en: "women guided" },
  detail_about_stat_3_value: { nl: "15", en: "15" },
  detail_about_stat_3_label: { nl: "ceremonies georganiseerd", en: "ceremonies organised" },
  detail_about_statement: { nl: "Ik ken de weg, omdat ik hem zelf gelopen heb. En nog steeds loop.", en: "I know the path because I have walked it myself. And I am still walking it." },
  detail_about_cta_kicker: { nl: "Een eerste stap", en: "A first step" },
  detail_about_cta_title: { nl: "Ieder verhaal is anders.", en: "Every story is different." },
  detail_about_cta_text: { nl: "Laten we gewoon even praten en samen kijken wat bij jou past.", en: "Let’s simply talk and look together at what fits you." },
  detail_about_cta_label: { nl: "Neem contact op", en: "Get in touch" },
};

export const CONTENT_GROUPS = [
  {
    id: "hero",
    title: "Hero",
    fields: ["hero_subtitle", "hero_cta", "quote_bar"],
  },
  {
    id: "recognition",
    title: "Herkenning",
    fields: ["recognition_kicker", "recognition_title", "recognition_body", "recognition_emphasis", "recognition_cta"],
  },
  {
    id: "homecoming",
    title: "Thuiskomen",
    fields: ["homecoming_kicker", "homecoming_title", "homecoming_body", "homecoming_manifesto", "homecoming_cta"],
  },
  {
    id: "guidance",
    title: "Begeleiding",
    fields: [
      "guidance_kicker", "guidance_title",
      "guidance_1_title", "guidance_1_body", "guidance_1_cta",
      "guidance_2_title", "guidance_2_body", "guidance_2_cta",
      "guidance_3_title", "guidance_3_body", "guidance_3_cta",
    ],
  },
  {
    id: "approach",
    title: "Werkwijze",
    fields: ["approach_kicker", "approach_body", "approach_emphasis", "approach_note", "approach_cta"],
  },
  {
    id: "reviews",
    title: "Ervaringen",
    fields: ["reviews_kicker", "reviews_title"],
  },
  {
    id: "about",
    title: "Over mij",
    fields: ["about_kicker", "about_title", "about_body_1", "about_body_2", "about_cta"],
  },
  {
    id: "invitation",
    title: "Uitnodiging",
    fields: ["invitation_kicker", "invitation_title", "invitation_body"],
  },
  {
    id: "detail-recognition",
    title: "Losse pagina · Herkenning",
    fields: [
      "detail_recognition_hero_kicker", "detail_recognition_hero_title", "detail_recognition_hero_intro",
      "detail_recognition_section_kicker", "detail_recognition_section_title", "detail_recognition_body", "detail_recognition_emphasis",
      "detail_recognition_transitions_kicker", "detail_recognition_transitions_title",
      "detail_recognition_transition_1", "detail_recognition_transition_2", "detail_recognition_transition_3",
      "detail_recognition_transition_4", "detail_recognition_transition_5", "detail_recognition_transition_6", "detail_recognition_transition_7",
      "detail_recognition_cta_kicker", "detail_recognition_cta_title", "detail_recognition_cta_text", "detail_recognition_cta_label",
    ],
  },
  {
    id: "detail-homecoming",
    title: "Losse pagina · Thuiskomen",
    fields: [
      "detail_homecoming_hero_kicker", "detail_homecoming_hero_title", "detail_homecoming_hero_intro",
      "detail_homecoming_section_kicker", "detail_homecoming_section_title", "detail_homecoming_body",
      "detail_homecoming_story_kicker", "detail_homecoming_story_title", "detail_homecoming_story_body", "detail_homecoming_story_quote",
      "detail_homecoming_cta_kicker", "detail_homecoming_cta_title", "detail_homecoming_cta_text", "detail_homecoming_cta_label",
    ],
  },
  {
    id: "detail-guidance",
    title: "Losse pagina · Begeleiding",
    fields: [
      "detail_guidance_hero_kicker", "detail_guidance_hero_title", "detail_guidance_hero_intro",
      "detail_guidance_section_kicker", "detail_guidance_section_title",
      "detail_guidance_1_script", "detail_guidance_1_title", "detail_guidance_1_body", "detail_guidance_1_meta",
      "detail_guidance_2_script", "detail_guidance_2_title", "detail_guidance_2_body", "detail_guidance_2_mantra",
      "detail_guidance_2_word_1", "detail_guidance_2_word_2", "detail_guidance_2_word_3", "detail_guidance_2_word_4",
      "detail_guidance_3_script", "detail_guidance_3_title", "detail_guidance_3_body", "detail_guidance_3_meta",
      "detail_guidance_4_script", "detail_guidance_4_title",
      "detail_guidance_cta_kicker", "detail_guidance_cta_title", "detail_guidance_cta_text", "detail_guidance_cta_label",
    ],
  },
  {
    id: "detail-approach",
    title: "Losse pagina · Werkwijze",
    fields: [
      "detail_approach_hero_kicker", "detail_approach_hero_title", "detail_approach_hero_intro",
      "detail_approach_section_kicker", "detail_approach_section_title", "detail_approach_body", "detail_approach_emphasis",
      "detail_approach_method_kicker", "detail_approach_method_title",
      "detail_approach_step_1_title", "detail_approach_step_1_body",
      "detail_approach_step_2_title", "detail_approach_step_2_body",
      "detail_approach_step_3_title", "detail_approach_step_3_body",
      "detail_approach_step_4_title", "detail_approach_step_4_body",
      "detail_approach_statement",
      "detail_approach_cta_kicker", "detail_approach_cta_title", "detail_approach_cta_text", "detail_approach_cta_label",
    ],
  },
  {
    id: "detail-about",
    title: "Losse pagina · Over mij",
    fields: [
      "detail_about_hero_kicker", "detail_about_hero_title", "detail_about_hero_intro",
      "detail_about_section_kicker", "detail_about_section_title", "detail_about_body", "detail_about_emphasis",
      "detail_about_statement",
      "detail_about_cta_kicker", "detail_about_cta_title", "detail_about_cta_text", "detail_about_cta_label",
    ],
  },
] as const;

export const MEDIA_SLOTS = [
  { slot: "hero", label: "Hero", fallback: "/HeroCherelle.webp" },
  { slot: "recognition", label: "Herkenning", fallback: "/Herkenning.jpg" },
  { slot: "homecoming", label: "Thuiskomen", fallback: "/Thuiskomen.jpg" },
  { slot: "guidance_feminine", label: "The Feminine Way", fallback: "/feminine.jpg" },
  { slot: "guidance_1to1", label: "1-op-1 sessie", fallback: "/1-op-1.jpg" },
  { slot: "guidance_ceremonies", label: "Ceremonies", fallback: "/ceremonies.webp" },
  { slot: "approach", label: "Werkwijze", fallback: "/Werkwijze.png" },
  { slot: "about", label: "Over mij", fallback: "/Overmij.webp" },
  { slot: "invitation", label: "Uitnodiging", fallback: "/Uitnodiging.webp" },
  { slot: "detail_recognition_hero", label: "Losse pagina Herkenning – hero", fallback: "/Herkenning.jpg" },
  { slot: "detail_homecoming_hero", label: "Losse pagina Thuiskomen – hero", fallback: "/Thuiskomen.jpg" },
  { slot: "detail_guidance_hero", label: "Losse pagina Begeleiding – hero", fallback: "/feminine.jpg" },
  { slot: "detail_approach_hero", label: "Losse pagina Werkwijze – hero", fallback: "/Werkwijze.png" },
  { slot: "detail_about_hero", label: "Losse pagina Over mij – hero", fallback: "/Overmij.webp" },
] as const;

function headers(accessToken?: string) {
  const result: Record<string, string> = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
  };
  if (accessToken) result.Authorization = `Bearer ${accessToken}`;
  return result;
}

async function responseError(response: Response) {
  try {
    const body = await response.json();
    return body?.message || body?.error_description || body?.error || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export function contentValue(content: CmsContentMap, key: string, language: CmsLanguage) {
  return content[key]?.[language] ?? DEFAULT_HOMEPAGE_CONTENT[key]?.[language] ?? "";
}

export async function loadPublicCms() {
  if (!isCmsConfigured) {
    return {
      content: DEFAULT_HOMEPAGE_CONTENT,
      reviews: [] as CmsReview[],
      media: {} as Record<string, CmsMedia>,
    };
  }

  try {
    const [contentResponse, reviewsResponse, mediaResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/cherelle_content?select=key,value_nl,value_en`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/cherelle_reviews?select=*&is_published=eq.true&order=sort_order.asc,created_at.asc`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/cherelle_media?select=*`, {
        headers: { apikey: supabaseKey },
        cache: "no-store",
      }),
    ]);

    if (!contentResponse.ok || !reviewsResponse.ok || !mediaResponse.ok) {
      throw new Error("CMS data kon niet worden geladen.");
    }

    const contentRows = await contentResponse.json() as Array<{ key: string; value_nl: string; value_en: string }>;
    const reviews = await reviewsResponse.json() as CmsReview[];
    const mediaRows = await mediaResponse.json() as CmsMedia[];

    const content: CmsContentMap = { ...DEFAULT_HOMEPAGE_CONTENT };
    for (const row of contentRows) {
      content[row.key] = {
        nl: row.value_nl ?? content[row.key]?.nl ?? "",
        en: row.value_en ?? content[row.key]?.en ?? "",
      };
    }

    const media = Object.fromEntries(mediaRows.map((item) => [item.slot, item])) as Record<string, CmsMedia>;
    return { content, reviews, media };
  } catch {
    return {
      content: DEFAULT_HOMEPAGE_CONTENT,
      reviews: [] as CmsReview[],
      media: {} as Record<string, CmsMedia>,
    };
  }
}

export async function signupCms(email: string, password: string) {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await responseError(response));
  return await response.json();
}

export async function loginCms(email: string, password: string): Promise<CmsSession> {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error(await responseError(response));
  const data = await response.json();

  const session: CmsSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in ?? 3600) * 1000,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  };

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { headers: headers(session.access_token) }
  );

  if (!adminResponse.ok) throw new Error(await responseError(adminResponse));
  const admins = await adminResponse.json();
  if (!Array.isArray(admins) || admins.length === 0) {
    throw new Error("Dit account heeft geen beheerrechten.");
  }

  window.localStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
}


export async function loginAccount(email: string, password: string): Promise<{ session: CmsSession; isAdmin: boolean }> {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("De persoonlijke omgeving is tijdelijk niet bereikbaar. Probeer het opnieuw.");
  }

  if (!response.ok) throw new Error("E-mailadres of wachtwoord is onjuist.");
  const data = await response.json();

  const session: CmsSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in ?? 3600) * 1000,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  };

  const adminResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { headers: headers(session.access_token), cache: "no-store" }
  );

  let isAdmin = false;
  if (adminResponse.ok) {
    const rows = await adminResponse.json();
    isAdmin = Array.isArray(rows) && rows.length > 0;
  }

  window.localStorage.setItem(accountSessionKey, JSON.stringify(session));
  if (isAdmin) {
    window.localStorage.setItem(sessionKey, JSON.stringify(session));
  }

  return { session, isAdmin };
}

export function getSavedAccountSession(): CmsSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(accountSessionKey);
    return raw ? JSON.parse(raw) as CmsSession : null;
  } catch {
    return null;
  }
}

export function clearAccountSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(accountSessionKey);
}

export function saveAccountSession(session: CmsSession) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(accountSessionKey, JSON.stringify(session));
  }
}

export async function verifyClientInviteToken(tokenHash: string, type: string): Promise<CmsSession> {
  if (!isCmsConfigured) throw new Error("De persoonlijke omgeving is niet geconfigureerd.");

  const allowedTypes = new Set(["invite", "magiclink"]);
  if (!tokenHash || !allowedTypes.has(type)) {
    throw new Error("Deze uitnodigingslink is ongeldig.");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token_hash: tokenHash, type }),
  });

  if (!response.ok) {
    throw new Error("Deze uitnodigingslink is ongeldig of verlopen. Vraag Cherelle om een nieuwe uitnodiging.");
  }

  const data = await response.json();
  const source = data.session ?? data;
  const user = data.user ?? source.user;

  if (!source.access_token || !source.refresh_token || !user?.id) {
    throw new Error("De uitnodiging kon niet worden bevestigd.");
  }

  const session: CmsSession = {
    access_token: source.access_token,
    refresh_token: source.refresh_token,
    expires_at: Date.now() + Number(source.expires_in ?? 3600) * 1000,
    user: {
      id: user.id,
      email: user.email,
    },
  };

  saveAccountSession(session);
  return session;
}

export async function setAccountPassword(session: CmsSession, password: string) {
  if (password.length < 8) throw new Error("Gebruik minimaal 8 tekens voor je wachtwoord.");

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) throw new Error(await responseError(response));
}

export async function activateClientAccount(session: CmsSession) {
  const now = new Date().toISOString();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_clients?user_id=eq.${encodeURIComponent(session.user.id)}`,
    {
      method: "PATCH",
      headers: {
        ...headers(session.access_token),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "active",
        activated_at: now,
        updated_at: now,
      }),
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
}

export async function loadOwnClientPortal(session: CmsSession): Promise<{
  client: CherelleClient;
  intake: CherelleIntake | null;
}> {
  const clientResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_clients?select=*&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!clientResponse.ok) throw new Error(await responseError(clientResponse));
  const clients = await clientResponse.json() as CherelleClient[];
  const client = clients[0];
  if (!client) throw new Error("Er is geen klantprofiel aan dit account gekoppeld.");

  const intakeResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_intakes?select=*&client_id=eq.${encodeURIComponent(client.id)}&limit=1`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!intakeResponse.ok) throw new Error(await responseError(intakeResponse));
  const intakes = await intakeResponse.json() as CherelleIntake[];

  return { client, intake: intakes[0] ?? null };
}

export async function saveClientIntake(
  session: CmsSession,
  clientId: string,
  intake: Omit<CherelleIntake, "client_id" | "updated_at">
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_intakes?on_conflict=client_id`,
    {
      method: "POST",
      headers: {
        ...headers(session.access_token),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        client_id: clientId,
        ...intake,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  const rows = await response.json() as CherelleIntake[];
  return rows[0];
}

export async function loadAdminClients(session: CmsSession): Promise<CherelleClient[]> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_clients?select=*&order=created_at.desc`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  return await response.json() as CherelleClient[];
}

export async function loadAdminIntake(
  session: CmsSession,
  clientId: string
): Promise<CherelleIntake | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_intakes?select=*&client_id=eq.${encodeURIComponent(clientId)}&limit=1`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  const rows = await response.json() as CherelleIntake[];
  return rows[0] ?? null;
}

export async function inviteClient(
  session: CmsSession,
  input: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email: string;
    action?: "invite" | "resend";
  }
): Promise<CherelleClient> {
  const response = await fetch("/api/admin/clients", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: input.action ?? "invite",
      first_name: input.firstName ?? "",
      last_name: input.lastName ?? "",
      phone: input.phone ?? "",
      email: input.email,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Uitnodiging kon niet worden verstuurd.");
  }

  return data.client as CherelleClient;
}

export async function loadClientMessages(
  session: CmsSession,
  clientId: string
): Promise<CherelleClientMessage[]> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_client_messages?select=*&client_id=eq.${encodeURIComponent(clientId)}&order=created_at.desc`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  return await response.json() as CherelleClientMessage[];
}

export async function sendClientMessage(
  session: CmsSession,
  clientId: string,
  subject: string,
  body: string
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_client_messages`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      client_id: clientId,
      subject: subject.trim(),
      body: body.trim(),
      created_by: session.user.id,
    }),
  });

  if (!response.ok) throw new Error(await responseError(response));
  const rows = await response.json() as CherelleClientMessage[];
  return rows[0];
}

export async function markClientMessagesRead(
  session: CmsSession,
  clientId: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_client_messages?client_id=eq.${encodeURIComponent(clientId)}&read_at=is.null`,
    {
      method: "PATCH",
      headers: {
        ...headers(session.access_token),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
}

export async function loadAdminDashboard(session: CmsSession): Promise<{
  metrics: CherelleDashboardMetrics;
  events: CherelleAdminEvent[];
}> {
  const [metricsResponse, eventsResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/rpc/cherelle_admin_dashboard_metrics`, {
      method: "POST",
      headers: headers(session.access_token),
      body: JSON.stringify({}),
      cache: "no-store",
    }),
    fetch(`${supabaseUrl}/rest/v1/cherelle_admin_events?select=*&order=created_at.desc&limit=10`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
  ]);

  if (!metricsResponse.ok) throw new Error(await responseError(metricsResponse));
  if (!eventsResponse.ok) throw new Error(await responseError(eventsResponse));

  return {
    metrics: await metricsResponse.json() as CherelleDashboardMetrics,
    events: await eventsResponse.json() as CherelleAdminEvent[],
  };
}

export async function markAdminEventsRead(session: CmsSession) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_admin_events?read_at=is.null`,
    {
      method: "PATCH",
      headers: {
        ...headers(session.access_token),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
}

export async function updateClientProfile(
  session: CmsSession,
  clientId: string,
  name: string,
  phone: string
) {
  const now = new Date().toISOString();

  const [clientResponse, intakeResponse] = await Promise.all([
    fetch(
      `${supabaseUrl}/rest/v1/cherelle_clients?id=eq.${encodeURIComponent(clientId)}`,
      {
        method: "PATCH",
        headers: {
          ...headers(session.access_token),
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name: name.trim(),
          updated_at: now,
        }),
      }
    ),
    fetch(`${supabaseUrl}/rest/v1/cherelle_intakes?on_conflict=client_id`, {
      method: "POST",
      headers: {
        ...headers(session.access_token),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        client_id: clientId,
        phone: phone.trim() || null,
        updated_at: now,
      }),
    }),
  ]);

  if (!clientResponse.ok) throw new Error(await responseError(clientResponse));
  if (!intakeResponse.ok) throw new Error(await responseError(intakeResponse));

  const clients = await clientResponse.json() as CherelleClient[];
  const intakes = await intakeResponse.json() as CherelleIntake[];

  return {
    client: clients[0],
    intake: intakes[0],
  };
}

export async function updateAccountEmail(
  session: CmsSession,
  email: string
): Promise<CmsSession> {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!response.ok) throw new Error(await responseError(response));
  const user = await response.json();

  const nextSession: CmsSession = {
    ...session,
    user: {
      ...session.user,
      email: user.email ?? session.user.email,
    },
  };

  saveAccountSession(nextSession);
  return nextSession;
}

export async function deleteOwnClientAccount(session: CmsSession) {
  const response = await fetch(`${supabaseUrl}/functions/v1/client-account`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "delete" }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Account kon niet worden verwijderd.");
}

export async function clearNewsletterHistory(session: CmsSession) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_newsletters?id=not.is.null`,
    {
      method: "DELETE",
      headers: {
        ...headers(session.access_token),
        Prefer: "return=minimal",
      },
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
}

export async function loadNewsletterHistory(
  session: CmsSession
): Promise<CherelleNewsletterLog[]> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_newsletters?select=*&order=sent_at.desc&limit=20`,
    {
      headers: headers(session.access_token),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error(await responseError(response));
  return await response.json() as CherelleNewsletterLog[];
}

export async function sendNewsletter(
  session: CmsSession,
  subject: string,
  body: string,
  recipientIds: string[],
  imageUrls: string[] = []
) {
  const response = await fetch("/api/admin/newsletter", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject,
      body,
      recipient_ids: recipientIds,
      image_urls: imageUrls,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Nieuwsbrief kon niet worden verstuurd.");
  return data as { ok: true; sent: number };
}

export async function optimizeImageForWeb(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecteer een afbeelding.");
  }

  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") {
    throw new Error("Deze browser kan de afbeelding niet optimaliseren.");
  }

  const maxDimension = options.maxDimension ?? 2200;
  const quality = options.quality ?? 0.82;
  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Afbeelding kon niet worden verwerkt.");

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob || blob.type !== "image/webp") {
      throw new Error("Afbeelding kon niet naar WebP worden omgezet.");
    }

    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9_-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "afbeelding";

    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export async function uploadNewsletterImage(
  session: CmsSession,
  file: File
): Promise<NewsletterImage> {
  const optimized = await optimizeImageForWeb(file);
  const storagePath = `newsletters/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.webp`;

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: optimized,
    }
  );

  if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));

  return {
    storage_path: storagePath,
    url: `${supabaseUrl}/storage/v1/object/public/cherelle-media/${storagePath}`,
  };
}

export async function deleteNewsletterImage(
  session: CmsSession,
  image: NewsletterImage
) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${image.storage_path}`,
    {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(await responseError(response));
  }
}

export async function downloadClientIntakePdf(
  session: CmsSession,
  clientId: string
) {
  const response = await fetch(
    `/api/admin/clients/${encodeURIComponent(clientId)}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || "PDF kon niet worden aangemaakt.");
  }

  return await response.blob();
}

export async function verifyAccountSession(session: CmsSession) {
  if (!isCmsConfigured) return false;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function accountIsAdmin(session: CmsSession) {
  if (!isCmsConfigured) return false;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
      { headers: headers(session.access_token), cache: "no-store" }
    );

    if (!response.ok) return false;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export function getSavedCmsSession(): CmsSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) as CmsSession : null;
  } catch {
    return null;
  }
}

export function clearCmsSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export async function verifyCmsSession(session: CmsSession) {
  if (!isCmsConfigured) return false;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_admins?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`,
      { headers: headers(session.access_token), cache: "no-store" }
    );
    if (!response.ok) return false;
    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export async function loadAdminCms(session: CmsSession) {
  if (!isCmsConfigured) throw new Error("Supabase is nog niet gekoppeld.");

  const [contentResponse, reviewsResponse, mediaResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/cherelle_content?select=*&order=key.asc`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
    fetch(`${supabaseUrl}/rest/v1/cherelle_reviews?select=*&order=sort_order.asc,created_at.asc`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
    fetch(`${supabaseUrl}/rest/v1/cherelle_media?select=*`, {
      headers: headers(session.access_token),
      cache: "no-store",
    }),
  ]);

  if (!contentResponse.ok) throw new Error(await responseError(contentResponse));
  if (!reviewsResponse.ok) throw new Error(await responseError(reviewsResponse));
  if (!mediaResponse.ok) throw new Error(await responseError(mediaResponse));

  const contentRows = await contentResponse.json() as Array<{ key: string; value_nl: string; value_en: string }>;
  const content: CmsContentMap = { ...DEFAULT_HOMEPAGE_CONTENT };
  for (const row of contentRows) {
    content[row.key] = { nl: row.value_nl ?? "", en: row.value_en ?? "" };
  }

  const reviews = await reviewsResponse.json() as CmsReview[];
  const mediaRows = await mediaResponse.json() as CmsMedia[];
  const media = Object.fromEntries(mediaRows.map((item) => [item.slot, item])) as Record<string, CmsMedia>;

  return { content, reviews, media };
}

export async function saveContentGroup(session: CmsSession, content: CmsContentMap, keys: readonly string[]) {
  const rows = keys.map((key) => ({
    key,
    value_nl: content[key]?.nl ?? "",
    value_en: content[key]?.en ?? "",
    updated_at: new Date().toISOString(),
  }));

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_content?on_conflict=key`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) throw new Error(await responseError(response));
}

export async function saveReview(
  session: CmsSession,
  review: Omit<CmsReview, "id"> & { id?: string }
) {
  if (review.id) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cherelle_reviews?id=eq.${encodeURIComponent(review.id)}`,
      {
        method: "PATCH",
        headers: {
          ...headers(session.access_token),
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name: review.name,
          role_nl: review.role_nl,
          role_en: review.role_en,
          quote_nl: review.quote_nl,
          quote_en: review.quote_en,
          image_url: review.image_url,
          image_storage_path: review.image_storage_path,
          experience_date: review.experience_date,
          is_published: review.is_published,
          sort_order: review.sort_order,
          updated_at: new Date().toISOString(),
        }),
      }
    );
    if (!response.ok) throw new Error(await responseError(response));
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_reviews`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function uploadReviewImage(
  session: CmsSession,
  file: File
): Promise<{ url: string; storage_path: string }> {
  const optimized = await optimizeImageForWeb(file, { maxDimension: 1400, quality: 0.82 });
  const storagePath = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.webp`;

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: optimized,
    }
  );

  if (!response.ok) throw new Error(await responseError(response));

  return {
    storage_path: storagePath,
    url: `${supabaseUrl}/storage/v1/object/public/cherelle-media/${storagePath}`,
  };
}

export async function deleteReviewImage(
  session: CmsSession,
  storagePath: string
) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${storagePath}`,
    {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(await responseError(response));
  }
}

export async function deleteReview(session: CmsSession, id: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: headers(session.access_token),
    }
  );
  if (!response.ok) throw new Error(await responseError(response));
}

export async function deleteMedia(session: CmsSession, item: CmsMedia) {
  const storageResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${item.storage_path}`,
    {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!storageResponse.ok && storageResponse.status !== 404) {
    throw new Error(await responseError(storageResponse));
  }

  const metadataResponse = await fetch(
    `${supabaseUrl}/rest/v1/cherelle_media?slot=eq.${encodeURIComponent(item.slot)}`,
    {
      method: "DELETE",
      headers: {
        ...headers(session.access_token),
        Prefer: "return=minimal",
      },
    }
  );

  if (!metadataResponse.ok) throw new Error(await responseError(metadataResponse));
}

export async function uploadMedia(
  session: CmsSession,
  slot: string,
  file: File,
  altNl: string,
  altEn: string
) {
  const optimized = await optimizeImageForWeb(file);
  const storagePath = `${slot}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.webp`;

  const uploadResponse = await fetch(
    `${supabaseUrl}/storage/v1/object/cherelle-media/${storagePath}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: optimized,
    }
  );
  if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/cherelle-media/${storagePath}`;
  const response = await fetch(`${supabaseUrl}/rest/v1/cherelle_media?on_conflict=slot`, {
    method: "POST",
    headers: {
      ...headers(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      slot,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_nl: altNl || null,
      alt_en: altEn || null,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(await responseError(response));

  return { slot, storage_path: storagePath, public_url: publicUrl, alt_nl: altNl || null, alt_en: altEn || null } as CmsMedia;
}
