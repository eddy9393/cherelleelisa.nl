"use client";

import Image from "next/image";
import AccountLink from "./AccountLink";
import { ReactNode, useEffect, useState } from "react";

type Language = "nl" | "en";
type DetailKey = "herkenning" | "thuiskomen" | "begeleiding" | "werkwijze" | "over-mij";

const languageStorageKey = "cherelle-language";

const navItems = [
  { href: "/", nl: "Home", en: "Home" },
  { href: "/herkenning", nl: "Herkenning", en: "Recognition" },
  { href: "/thuiskomen", nl: "Thuiskomen", en: "Coming home" },
  { href: "/begeleiding", nl: "Begeleiding", en: "Guidance" },
  { href: "/werkwijze", nl: "Werkwijze", en: "Approach" },
  { href: "/over-mij", nl: "Over mij", en: "About me" },
  { href: "/ervaringen", nl: "Ervaringen", en: "Experiences" },
  { href: "/#uitnodiging", nl: "Uitnodiging", en: "Invitation" },
];

const heroContent = {
  herkenning: {
    image: "/Herkenning.jpg",
    kicker: { nl: "Herkenning", en: "Recognition" },
    title: {
      nl: "Je bent uitgeput. En dat gaat niet over met een weekendje niks doen.",
      en: "You are exhausted. And a quiet weekend is not going to fix it.",
    },
    intro: {
      nl: "Jij bent de vrouw die alles regelt. Voor je kinderen, je partner, je vriendinnen — je staat altijd klaar voor iedereen.",
      en: "You are the woman who takes care of everything. Your children, your partner, your friends — you are always there for everyone.",
    },
  },
  thuiskomen: {
    image: "/Thuiskomen.jpg",
    kicker: { nl: "Thuiskomen", en: "Coming home" },
    title: {
      nl: "Je verlangt niet naar nog een techniek om het vol te houden.",
      en: "You are not longing for another technique to keep going.",
    },
    intro: {
      nl: "Je verlangt naar het moment waarop je niet meer hoeft vol te houden.",
      en: "You are longing for the moment when you no longer have to keep holding everything together.",
    },
  },
  begeleiding: {
    image: "/feminine.jpg",
    kicker: { nl: "Begeleiding", en: "Guidance" },
    title: { nl: "Mijn diensten.", en: "My services." },
    intro: {
      nl: "Ieder verhaal is anders. Daarom begint begeleiding niet bij een standaardroute, maar bij waar jij vandaag werkelijk staat.",
      en: "Every story is different. That is why guidance does not begin with a standard route, but with where you truly are today.",
    },
  },
  werkwijze: {
    image: "/Werkwijze.png",
    kicker: { nl: "Werkwijze", en: "Approach" },
    title: {
      nl: "Elke sessie begint bij waar jij vandaag werkelijk staat.",
      en: "Every session begins with where you truly are today.",
    },
    intro: {
      nl: "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders.",
      en: "I do not believe in one fixed approach that is the same for everyone. Every story is different.",
    },
  },
  "over-mij": {
    image: "/Overmij.webp",
    kicker: { nl: "Over mij", en: "About me" },
    title: { nl: "Ik ben Cherelle.", en: "I’m Cherelle." },
    intro: {
      nl: "Feminine embodiment coach. Ik ken deze weg niet alleen vanuit mijn werk, maar omdat ik hem zelf gelopen heb — en nog steeds loop.",
      en: "Feminine embodiment coach. I know this path not only through my work, but because I have walked it myself — and still do.",
    },
  },
} satisfies Record<DetailKey, any>;

function SectionShell({
  kicker,
  title,
  children,
  className = "",
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`detailEditorialSection ${className}`.trim()}>
      <div className="detailEditorialHeading">
        {kicker ? <p className="detailKicker">{kicker}</p> : null}
        <h2>{title}</h2>
      </div>
      <div className="detailEditorialBody">{children}</div>
    </section>
  );
}

function HerkenningBody({ language }: { language: Language }) {
  const transitions =
    language === "nl"
      ? [
          ["Van jezelf ergeren aan iets kleins", "naar merken dat het nooit om het kleine ging."],
          ["Van vijf dingen tegelijk doen en niks echt afkrijgen", "naar één ding doen en het laten voelen als genoeg."],
          ["Van huilen om iets kleins en denken ‘doe niet zo raar’", "naar weten dat het nooit om het kleine ging."],
          ["Van ‘zo hoort het nu eenmaal’", "naar merken dat je het zelf ook anders mag willen."],
          ["Van jaren om je heen kijken en denken ‘is dit het nu?’", "naar er middenin staan en weten: dit is van mij."],
          ["Van jezelf wegcijferen en het liefde noemen", "naar zien dat het ook uitputting was."],
          ["Van sterk moeten blijven omdat niemand anders het overneemt", "naar merken dat je het even mag laten zakken."],
        ]
      : [
          ["From getting irritated by something small", "to realising it was never really about the small thing."],
          ["From doing five things at once and finishing none of them", "to doing one thing and letting that be enough."],
          ["From crying over something small and telling yourself not to be ridiculous", "to knowing it was never really about the small thing."],
          ["From ‘this is just how it is’", "to realising you are allowed to want something different."],
          ["From looking around for years and thinking ‘is this it?’", "to standing in the middle of your life and knowing: this is mine."],
          ["From making yourself smaller and calling it love", "to seeing that it was exhaustion too."],
          ["From having to stay strong because no one else will take over", "to realising you are allowed to let it drop for a moment."],
        ];

  return (
    <>
      <SectionShell
        kicker={language === "nl" ? "Dit ben jij" : "This is you"}
        title={
          language === "nl"
            ? "Je bent zo gewend om te dragen, dat je bijna niet meer merkt hoeveel het van je vraagt."
            : "You are so used to carrying everything that you barely notice how much it asks of you."
        }
      >
        <div className="detailLongform">
          <p>
            {language === "nl"
              ? "Als er iets gedaan moet worden, ben jij degene die het doet, die het oplost. En ergens voel je de druk: als er iets met mij gebeurt, als ik instort, wie doet het dan? Ik moet sterk blijven."
              : "When something needs to be done, you are the one who does it, who fixes it. And somewhere underneath is the pressure: if something happens to me, if I collapse, who will do it then? I have to stay strong."}
          </p>
          <p>
            {language === "nl"
              ? "Dus je gaat door. Ook als je voelt dat je zenuwstelsel allang overprikkeld is. Je bent aan, de hele dag, en weet niet meer goed hoe het is om écht uit te schakelen."
              : "So you keep going. Even when you can feel that your nervous system has been overstimulated for a long time. You are switched on all day and barely remember what it feels like to truly switch off."}
          </p>
          <p>
            {language === "nl"
              ? "In de loop van de jaren erger je je steeds meer aan dingen die er niet toe doen. Een mok in de verkeerde kast. Een berichtje waar je op moet wachten. Je weet best dat het daar niet echt over gaat, en dat frustreert je soms nog meer."
              : "Over the years, small things start to irritate you more and more. A mug in the wrong cupboard. A message you have to wait for. You know it is not really about that, which can make it even more frustrating."}
          </p>
          <p>
            {language === "nl"
              ? "Soms huil je om iets kleins, en veeg je het meteen weg: doe niet zo raar, er zijn mensen die het harder nodig hebben."
              : "Sometimes you cry over something small and immediately dismiss it: do not be silly, other people have it much harder."}
          </p>
          <p>
            {language === "nl"
              ? "Voor de buitenwereld is je leven perfect. Je hebt een goede baan, een fijn huis, lieve kids, een partner. Hoe kun je nou ongelukkig zijn met dit leven?"
              : "To the outside world, your life looks perfect. A good job, a lovely home, wonderful children, a partner. How could you possibly be unhappy with this life?"}
          </p>
          <p>
            {language === "nl"
              ? "En dat is precies waar het schuldgevoel begint. Want van buiten heb je alles. En van binnen voel je dat niet. Dat verschil draag je al jaren met je mee, zonder dat je het hardop durft te zeggen."
              : "And that is exactly where the guilt begins. From the outside, you have everything. Inside, it does not feel that way. You have carried that difference for years without daring to say it out loud."}
          </p>
          <p>
            {language === "nl"
              ? "Je bent zo gewend om te doen, dat ontvangen bijna niet meer lukt. Iemand die iets voor jóu doet — daar weet je je geen raad mee. Je voelt iets, en meteen wil je het al oplossen, in plaats van het gewoon even te laten zijn."
              : "You are so used to doing that receiving has almost become impossible. When someone does something for you, you hardly know what to do with it. You feel something and immediately want to solve it instead of simply letting it be."}
          </p>
          <p className="detailEmphasis">
            {language === "nl"
              ? "Je bent niet ongelukkig omdat er iets mis is met jou. Je bent uitgeput, omdat je al jaren leeft voor iedereen, behalve voor jezelf."
              : "You are not unhappy because something is wrong with you. You are exhausted because you have spent years living for everyone except yourself."}
          </p>
        </div>
      </SectionShell>

      <SectionShell
        kicker={language === "nl" ? "Waar het anders kan beginnen" : "Where things can begin to change"}
        title={language === "nl" ? "Niet nóg harder. Wel dichter bij jezelf." : "Not harder. Closer to yourself."}
        className="detailTransitionsSection"
      >
        <div className="detailTransitions">
          {transitions.map(([from, to], index) => (
            <article key={from}>
              <span>0{index + 1}</span>
              <p><strong>{from}</strong> {to}</p>
            </article>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

function ThuiskomenBody({ language }: { language: Language }) {
  return (
    <>
      <SectionShell
        kicker={language === "nl" ? "Waar jij naar verlangt" : "What you long for"}
        title={
          language === "nl"
            ? "Niet meer volhouden. Eindelijk weer voelen wat rust is."
            : "Not holding on anymore. Remembering what real rest feels like."
        }
      >
        <div className="detailLongform">
          <p>
            {language === "nl"
              ? "Naar een avond waarop je hoofd eindelijk stil is, en je lijf niet meer op scherp staat. Naar voelen wat je voelt, zonder dat je het meteen wil oplossen of wegstoppen."
              : "An evening where your mind is finally quiet and your body is no longer on high alert. Feeling what you feel without immediately trying to fix it or push it away."}
          </p>
          <p>
            {language === "nl"
              ? "Naar iemand die iets voor jóu doet, zonder dat je je daar schuldig over voelt."
              : "Someone doing something for you without you feeling guilty about it."}
          </p>
          <p>
            {language === "nl"
              ? "Je zenuwstelsel mag eindelijk weer leren wat rust is. Niet de rust van een avondje Netflix terwijl je hoofd doorraast, maar rust die blijft zitten."
              : "Your nervous system is allowed to learn what rest feels like again. Not the kind of rest where you watch Netflix while your mind keeps racing, but a calm that actually stays with you."}
          </p>
          <p>
            {language === "nl"
              ? "En dat schuldgevoel — dat je eigenlijk niet zou mogen klagen, want je hebt het toch goed — dat mag er ook gewoon zijn, zonder dat je het meteen wegredeneert."
              : "And that guilt — the feeling that you should not complain because your life is good — is allowed to be there too, without you immediately reasoning it away."}
          </p>
        </div>
      </SectionShell>

      <SectionShell
        kicker={language === "nl" ? "Een verhaal zoals het jouwe" : "A story like yours"}
        title={language === "nl" ? "Tot ze voor zichzelf koos." : "Until she chose herself."}
        className="detailStorySection"
      >
        <div className="detailStory">
          <p>
            {language === "nl"
              ? "Ze was alleenstaande moeder van drie kinderen, en zorgde voor iedereen — ook voor haar ex, die de kinderen maar één keer per week zag. Als het hem niet uitkwam, was zij degene die haar agenda omgooide."
              : "She was a single mother of three and took care of everyone — including her ex, who saw the children only once a week. If the timing did not suit him, she was the one who rearranged her schedule."}
          </p>
          <p>
            {language === "nl"
              ? "Ze paste haar woonplek aan, haar werktijden, alles, om het voor hem zo makkelijk mogelijk te maken."
              : "She changed where she lived, her working hours, everything, to make life as easy as possible for him."}
          </p>
          <p>
            {language === "nl"
              ? "Toen maakte ze duidelijke afspraken — niet vanuit hardheid, maar vanuit zelfrespect. Er kwam rust: voor haar kinderen, voor de ex, voor haarzelf."
              : "Then she made clear agreements — not from harshness, but from self-respect. Calm returned: for her children, for her ex, and for herself."}
          </p>
          <p>
            {language === "nl"
              ? "Ze nam niet langer klakkeloos aan wat haar werd opgelegd. Ze kwam voor zichzelf op, en daarmee ook voor haar kinderen."
              : "She stopped simply accepting what was placed on her. She stood up for herself, and in doing so, for her children too."}
          </p>
          <p>
            {language === "nl"
              ? "Vandaag staat ze op het podium als fitnessmodel. Niet omdat ze harder ging werken, maar omdat ze ownership nam over haar eigen keuzes."
              : "Today she stands on stage as a fitness model. Not because she started working harder, but because she took ownership of her own choices."}
          </p>
          <blockquote>
            {language === "nl"
              ? "Ik bereik helemaal niks als ik voor iedereen zorg draag, behalve voor mijn dromen en mijn doelen."
              : "I achieve nothing if I take care of everyone except my own dreams and goals."}
          </blockquote>
        </div>
      </SectionShell>
    </>
  );
}

function BegeleidingBody({ language }: { language: Language }) {
  return (
    <section className="detailServicesSection">
      <div className="detailEditorialHeading">
        <p className="detailKicker">{language === "nl" ? "Mijn diensten" : "My services"}</p>
        <h2>{language === "nl" ? "Een vorm die past bij wat jij nu nodig hebt." : "A form of support that meets what you need now."}</h2>
      </div>

      <div className="detailServiceStack">
        <article className="detailServiceCard" id="een-op-een">
          <div className="detailServiceIndex">01</div>
          <div className="detailServiceContent">
            <p className="detailServiceScript">1:1</p>
            <h3>{language === "nl" ? "1:1 sessies" : "1:1 sessions"}</h3>
            <p>
              {language === "nl"
                ? "We beginnen gewoon met praten. Ik wil weten wie je bent, wat er speelt, en ik vertel je wat we gaan doen, zodat je niet in het onbekende stapt. Dan ga je liggen, en land je in je lijf."
                : "We simply start by talking. I want to know who you are and what is happening in your life, and I explain what we are going to do so you do not step into the unknown. Then you lie down and land in your body."}
            </p>
            <p>
              {language === "nl"
                ? "Dit is het moment waarop jij eens niet degene bent die iets voor een ander doet. Je hoeft hier niks op te lossen, niks te regelen. Je lichaam geeft je wat je op dat moment nodig hebt — soms is het stil, soms komt er iets los. Wat er ook gebeurt, het mag er zijn."
                : "This is the moment where you are not the one doing something for someone else. You do not need to solve or organise anything. Your body gives you what you need in that moment — sometimes it is quiet, sometimes something releases. Whatever happens is allowed to be there."}
            </p>
            <p>
              {language === "nl"
                ? "Wat bijna iedereen achteraf zegt: haar schouders zijn eindelijk gezakt. Het overprikkelde gevoel, dat je normaal niet eens meer opmerkt omdat het er altijd is, is voor even weg."
                : "What almost everyone says afterwards: their shoulders finally dropped. That overstimulated feeling, which you barely notice anymore because it is always there, is gone for a while."}
            </p>
            <p>
              {language === "nl"
                ? "Voor de meeste vrouwen is één sessie een begin, geen eindpunt. Een patroon dat je jarenlang met je meedraagt, gaat niet in negentig minuten weg. Daarom kies je vaak voor een bundel van 3 of 6, met ruimte ertussen om te laten landen."
                : "For most women, one session is a beginning, not an end point. A pattern you have carried for years does not disappear in ninety minutes. That is why women often choose a bundle of 3 or 6 sessions, with space in between to let things settle."}
            </p>
            <div className="detailServiceMeta">
              {language === "nl" ? "Losse sessie €188 · Bundel van 3 of 6" : "Single session €188 · Bundle of 3 or 6"}
            </div>
          </div>
        </article>

        <article className="detailServiceCard" id="the-feminine-way">
          <div className="detailServiceIndex">02</div>
          <div className="detailServiceContent">
            <p className="detailServiceScript">The Feminine Way</p>
            <h3>{language === "nl" ? "The Feminine Way — 6 maanden" : "The Feminine Way — 6 months"}</h3>
            <p>
              {language === "nl"
                ? "Dit traject volgt je chakra's, niet als idee maar als een route door je lichaam. De ene maand werk je aan je basis — grond onder je voeten. Dan je hart — voelen zonder het weg te duwen. Dan je keel — zeggen wat je denkt. Uiteindelijk je kroon — weten wie je bent, zonder het te hoeven bewijzen."
                : "This journey follows your chakras, not as an idea but as a route through your body. One month focuses on your foundation — ground beneath your feet. Then your heart — feeling without pushing it away. Then your throat — saying what you think. Eventually your crown — knowing who you are without having to prove it."}
            </p>
            <p className="detailServiceMantra">
              {language === "nl"
                ? "Van hoofd naar hart. Van doen naar zijn. Van controle naar overgave."
                : "From head to heart. From doing to being. From control to surrender."}
            </p>
            <p>
              {language === "nl"
                ? "Dit is waar het schuldgevoel plaatsmaakt voor iets anders. Waar je leert ontvangen in plaats van alleen maar geven — niet als iets wat je erbij moet doen, maar als iets wat je stap voor stap weer aanleert. Je zenuwstelsel gaat mee in die verandering: het leert dat het niet altijd op scherp hoeft te staan."
                : "This is where guilt begins to make room for something else. Where you learn to receive instead of only giving — not as another task, but as something you gradually relearn. Your nervous system moves with that change: it learns that it does not always have to stay on high alert."}
            </p>
            <p>
              {language === "nl"
                ? "In de praktijk merk je het klein: een nee die makkelijker komt. Iets voelen zonder het meteen weg te stoppen. Jezelf uitspreken zonder het achteraf terug te nemen."
                : "In daily life you notice it in small ways: saying no more easily. Feeling something without immediately pushing it away. Speaking your truth without taking it back afterwards."}
            </p>
            <div className="detailFourWords">
              {(language === "nl"
                ? ["Grenzen", "Voelen", "Uitspreken", "Kiezen"]
                : ["Boundaries", "Feeling", "Speaking", "Choosing"]
              ).map((word) => <span key={word}>{word}</span>)}
            </div>
          </div>
        </article>

        <article className="detailServiceCard" id="retreats">
          <div className="detailServiceIndex">03</div>
          <div className="detailServiceContent">
            <p className="detailServiceScript">Retreats</p>
            <h3>{language === "nl" ? "Even helemaal niets hoeven regelen." : "Not having to organise anything for a while."}</h3>
            <p>
              {language === "nl"
                ? "Meerdaags, met andere vrouwen die hetzelfde dragen als jij. Hier hoef je even helemaal niks te regelen — je wordt verzorgd, in plaats van dat jij voor iedereen zorgt."
                : "Several days with other women who carry many of the same things you do. Here you do not have to organise anything — you are cared for instead of being the one who takes care of everyone."}
            </p>
            <p>
              {language === "nl"
                ? "Je ziet jezelf terug in een ander, en beseft dat je nooit de enige was."
                : "You recognise yourself in another woman and realise you were never the only one."}
            </p>
            <div className="detailServiceMeta">
              {language === "nl"
                ? "Eerstvolgende retreat: eind september 2027 · deuren open vanaf 1 november"
                : "Next retreat: late September 2027 · doors open from 1 November"}
            </div>
          </div>
        </article>

        <article className="detailServiceCard detailServiceCardMinimal" id="ceremonies">
          <div className="detailServiceIndex">04</div>
          <div className="detailServiceContent">
            <p className="detailServiceScript">Ceremonies</p>
            <h3>Soul Unbound</h3>
          </div>
        </article>
      </div>
    </section>
  );
}

function WerkwijzeBody({ language }: { language: Language }) {
  const steps =
    language === "nl"
      ? [
          {
            title: "We beginnen gewoon met praten.",
            text: "Ik wil weten wie je bent, wat er speelt, en ik vertel je wat we gaan doen, zodat je niet in het onbekende stapt.",
          },
          {
            title: "Dan land je in je lijf.",
            text: "Je gaat liggen. Je hoeft even niet degene te zijn die iets voor een ander doet. Je hoeft niets op te lossen en niets te regelen.",
          },
          {
            title: "Je lichaam geeft aan wat er nodig is.",
            text: "Soms is het stil, soms komt er iets los. Wat er ook gebeurt, het mag er zijn. Ik werk niet volgens een protocol dat ik al honderd keer heb gedraaid.",
          },
          {
            title: "Daarna mag het landen.",
            text: "Voor de meeste vrouwen is één sessie een begin, geen eindpunt. Een patroon dat je jarenlang met je meedraagt, gaat niet in negentig minuten weg. Daarom zit er ruimte tussen sessies.",
          },
        ]
      : [
          {
            title: "We simply start by talking.",
            text: "I want to know who you are and what is happening, and I explain what we are going to do so you do not step into the unknown.",
          },
          {
            title: "Then you land in your body.",
            text: "You lie down. For a moment, you are not the one doing something for someone else. You do not need to solve or organise anything.",
          },
          {
            title: "Your body shows what is needed.",
            text: "Sometimes it is quiet, sometimes something releases. Whatever happens is allowed to be there. I do not work from a protocol I have repeated a hundred times.",
          },
          {
            title: "Afterwards, it gets space to settle.",
            text: "For most women one session is a beginning, not an end point. A pattern carried for years does not disappear in ninety minutes. That is why there is space between sessions.",
          },
        ];

  return (
    <>
      <SectionShell
        kicker={language === "nl" ? "Geen vast protocol" : "No fixed protocol"}
        title={
          language === "nl"
            ? "Ik begin niet bij een methode. Ik begin bij jou."
            : "I do not begin with a method. I begin with you."
        }
      >
        <div className="detailLongform">
          <p>
            {language === "nl"
              ? "De vrouwen die bij mij komen, herken ik meteen. Werkende vrouwen met een gezin. Vrouwen die het fundament zijn — voor hun kinderen, hun partner, soms hun ex, hun werk, hun hele omgeving."
              : "I recognise the women who come to me immediately. Working women with families. Women who are the foundation — for their children, their partner, sometimes their ex, their work, their entire environment."}
          </p>
          <p>
            {language === "nl"
              ? "En die zelf al zo lang niet meer gedragen worden, dat ze het niet eens meer merken."
              : "And who have gone without being supported themselves for so long that they barely notice it anymore."}
          </p>
          <p className="detailEmphasis">
            {language === "nl"
              ? "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders. Dus elke sessie begint bij waar jij vandaag werkelijk staat."
              : "I do not believe in one fixed approach that is the same for everyone. Every story is different. So every session starts with where you truly are today."}
          </p>
        </div>
      </SectionShell>

      <section className="detailMethodSection">
        <div className="detailEditorialHeading">
          <p className="detailKicker">{language === "nl" ? "Een sessie" : "A session"}</p>
          <h2>{language === "nl" ? "Zo ontstaat er ruimte." : "This is how space begins to open."}</h2>
        </div>
        <div className="detailMethodSteps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="detailStatement">
        <p>
          {language === "nl"
            ? "Je lichaam geeft je wat je op dat moment nodig hebt."
            : "Your body gives you what you need in that moment."}
        </p>
      </section>
    </>
  );
}

function OverMijBody({ language }: { language: Language }) {
  return (
    <>
      <SectionShell
        kicker={language === "nl" ? "Mijn verhaal" : "My story"}
        title={
          language === "nl"
            ? "Ik dacht dat ik gewoon sterk was."
            : "I thought I was simply strong."
        }
      >
        <div className="detailLongform">
          <p>
            {language === "nl"
              ? "Jarenlang droeg ik een deel in mij dat mij beschermde tegen afwijzing en kritiek. Ik wist het zelf niet eens — ik dacht dat ik gewoon sterk was."
              : "For years I carried a part of me that protected me from rejection and criticism. I did not even realise it — I thought I was simply strong."}
          </p>
          <p>
            {language === "nl"
              ? "Ik zorgde voor iedereen, behalve voor mezelf, en noemde dat liefde. Pas toen ik mezelf volledig ging accepteren, in plaats van mezelf te blijven bewijzen, veranderde er iets fundamenteels. In mijn werk, in mijn relaties, in hoe ik door mijn dagen ga."
              : "I took care of everyone except myself and called it love. Only when I started fully accepting myself instead of constantly proving myself did something fundamental change. In my work, in my relationships, in the way I move through my days."}
          </p>
          <p>
            {language === "nl"
              ? "Dus als ik nu vrouwen begeleid, doe ik dat niet vanuit een boek dat ik gelezen heb. Ik ken de weg, omdat ik hem zelf gelopen heb. En nog steeds loop."
              : "So when I guide women now, I do not do that from a book I have read. I know the path because I have walked it myself. And I am still walking it."}
          </p>
          <p>
            {language === "nl"
              ? "De vrouwen die bij mij komen, herken ik meteen. Werkende vrouwen met een gezin. Vrouwen die het fundament zijn — voor hun kinderen, hun partner, soms hun ex, hun werk, hun hele omgeving. En die zelf al zo lang niet meer gedragen worden, dat ze het niet eens meer merken."
              : "I recognise the women who come to me immediately. Working women with families. Women who are the foundation — for their children, their partner, sometimes their ex, their work, their whole environment. Women who have gone without being supported themselves for so long that they barely notice it anymore."}
          </p>
          <p className="detailEmphasis">
            {language === "nl"
              ? "Ik geloof niet in een vaste aanpak die voor iedereen hetzelfde is. Elk verhaal is anders. Dus elke sessie begint bij waar jij vandaag werkelijk staat, niet bij een protocol dat ik al honderd keer heb gedraaid."
              : "I do not believe in one fixed approach that is the same for everyone. Every story is different. So every session begins with where you truly are today, not with a protocol I have already repeated a hundred times."}
          </p>
        </div>
      </SectionShell>

      <section className="detailStatsStrip" aria-label={language === "nl" ? "Ervaring" : "Experience"}>
        <div>
          <strong>2</strong>
          <span>{language === "nl" ? "jaar ervaring" : "years of experience"}</span>
        </div>
        <div>
          <strong>~500</strong>
          <span>{language === "nl" ? "vrouwen begeleid" : "women guided"}</span>
        </div>
        <div>
          <strong>15</strong>
          <span>{language === "nl" ? "ceremonies georganiseerd" : "ceremonies organised"}</span>
        </div>
      </section>

      <section className="detailStatement">
        <p>
          {language === "nl"
            ? "Ik ken de weg, omdat ik hem zelf gelopen heb. En nog steeds loop."
            : "I know the path because I have walked it myself. And I am still walking it."}
        </p>
      </section>
    </>
  );
}

function PageBody({ page, language }: { page: DetailKey; language: Language }) {
  if (page === "herkenning") return <HerkenningBody language={language} />;
  if (page === "thuiskomen") return <ThuiskomenBody language={language} />;
  if (page === "begeleiding") return <BegeleidingBody language={language} />;
  if (page === "werkwijze") return <WerkwijzeBody language={language} />;
  return <OverMijBody language={language} />;
}

const nextSteps: Record<DetailKey, { href: string; kicker: Record<Language, string>; title: Record<Language, string>; text: Record<Language, string>; label: Record<Language, string> }> = {
  herkenning: {
    href: "/thuiskomen",
    kicker: { nl: "Waar jij naar verlangt", en: "What you long for" },
    title: { nl: "Dus laat me je vertellen waar dit anders kan beginnen.", en: "Let me show you where things can begin to change." },
    text: { nl: "Niet nóg een manier om vol te houden. Wel weer leren wat echte rust is.", en: "Not another way to keep going. A way back to what real rest feels like." },
    label: { nl: "Naar Thuiskomen", en: "Go to Coming home" },
  },
  thuiskomen: {
    href: "/begeleiding",
    kicker: { nl: "Begeleiding", en: "Guidance" },
    title: { nl: "Welke vorm past bij waar jij nu bent?", en: "What kind of support fits where you are now?" },
    text: { nl: "Van een 1:1 sessie tot een langer traject of retreat.", en: "From a 1:1 session to a longer journey or retreat." },
    label: { nl: "Bekijk de begeleiding", en: "Explore guidance" },
  },
  begeleiding: {
    href: "/#uitnodiging",
    kicker: { nl: "Neem contact op", en: "Get in touch" },
    title: { nl: "Ieder verhaal is anders, dus laten we gewoon even praten.", en: "Every story is different, so let’s simply talk." },
    text: { nl: "App me, bel me, of vul het contactformulier in — dan kijken we samen wat bij jou past.", en: "Message me, call me, or fill in the contact form — then we can look together at what fits you." },
    label: { nl: "Neem contact op", en: "Get in touch" },
  },
  werkwijze: {
    href: "/begeleiding",
    kicker: { nl: "Begeleiding", en: "Guidance" },
    title: { nl: "Voel welke vorm bij jou past.", en: "Feel which form of support suits you." },
    text: { nl: "Je hoeft vooraf niet alles te weten. We beginnen bij waar jij bent.", en: "You do not need to know everything beforehand. We begin where you are." },
    label: { nl: "Bekijk de begeleiding", en: "Explore guidance" },
  },
  "over-mij": {
    href: "/#uitnodiging",
    kicker: { nl: "Een eerste stap", en: "A first step" },
    title: { nl: "Ieder verhaal is anders.", en: "Every story is different." },
    text: { nl: "Laten we gewoon even praten en samen kijken wat bij jou past.", en: "Let’s simply talk and look together at what fits you." },
    label: { nl: "Neem contact op", en: "Get in touch" },
  },
};

export default function DetailPage({ page }: { page: DetailKey }) {
  const [language, setLanguage] = useState<Language>("nl");
  const [menuOpen, setMenuOpen] = useState(false);
  const content = heroContent[page];
  const next = nextSteps[page];

  useEffect(() => {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "nl" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <main className={`detailPage detailPage-${page}`}>
      <header className={`detailHeader ${menuOpen ? "menuOpen" : ""}`}>
        <a className="detailBrand" href="/" onClick={() => setMenuOpen(false)}>CHERELLE ELISA</a>
        <nav className="detailNav" aria-label={language === "nl" ? "Hoofdnavigatie" : "Main navigation"}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item[language]}</a>
          ))}
        </nav>
        <div className="detailUtilities">
          <div className="detailLanguage" aria-label={language === "nl" ? "Taal kiezen" : "Choose language"}>
            <button type="button" className={language === "nl" ? "isActive" : ""} onClick={() => setLanguage("nl")} aria-label="Nederlands">🇳🇱</button>
            <button type="button" className={language === "en" ? "isActive" : ""} onClick={() => setLanguage("en")} aria-label="English">🇬🇧</button>
          </div>
          <AccountLink label={language === "nl" ? "Inloggen" : "Log in"} />
        </div>
        <button
          className="detailMenuButton"
          type="button"
          aria-label={menuOpen ? (language === "nl" ? "Menu sluiten" : "Close menu") : (language === "nl" ? "Menu openen" : "Open menu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <section className="detailHero detailHeroEditorial">
        <div className="detailHeroImage">
          <Image src={content.image} alt="" fill priority sizes="100vw" quality={84} />
          <div className="detailHeroFade" />
        </div>
        <div className="detailHeroCopy">
          <p className="detailKicker">{content.kicker[language]}</p>
          <h1>{content.title[language]}</h1>
          <p>{content.intro[language]}</p>
        </div>
      </section>

      <div className="detailEditorialFlow">
        <PageBody page={page} language={language} />
      </div>

      <section className="detailInvitation detailInvitationEditorial">
        <p className="detailKicker">{next.kicker[language]}</p>
        <h2>{next.title[language]}</h2>
        <p>{next.text[language]}</p>
        <a className="detailCta" href={next.href}>
          {next.label[language]} <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className="detailFooter">
        <a href="/">CHERELLE ELISA</a>
        <a href="/#uitnodiging">Contact</a>
      </footer>
    </main>
  );
}
