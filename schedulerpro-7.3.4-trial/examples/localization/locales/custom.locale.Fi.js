import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Fi.js';

const locale = {

    localeName : 'Fi',
    localeDesc : 'Suomi',
    localeCode : 'fi',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalisointiesittely'
    },

    Button : {
        'Add column'    : 'Lisää sarake',
        'Display hints' : 'Näytä vihjeet',
        'Remove column' : 'Poista sarake',
        Apply           : 'Käytä',
        Learn           : 'Opi',
        DownloadTrial   : 'Lataa kokeiluversio',
        upgradeGuide    : 'Päivitysopas',
        documentation   : 'Dokumentaatio',
        tabJS           : 'Näytä JavaScript-esimerkit',
        tabReact        : 'Näytä React-esimerkit',
        tabVue          : 'Näytä Vue-esimerkit',
        tabAngular      : 'Näytä Angular-esimerkit'
    },

    Column : {
        Company : 'Yritys',
        Name    : 'Nimi'
    },

    Checkbox : {
        'Auto apply'  : 'Automaattinen sovellus',
        Automatically : 'Automaattisesti',
        runHints      : 'Suorita vihjevirta käynnistyksen yhteydessä'
    },

    CodeEditor : {
        'Code editor'   : 'Koodieditori',
        'Download code' : 'Lataa koodi'
    },

    Combo : {
        Theme    : 'Teema',
        Language : 'Kieli',
        Size     : 'Koko',
        jumpTo   : 'Siirry kohtaan'
    },

    Shared : {
        'Full size'      : 'Täysi koko',
        'Locale changed' : 'Kieli muuttui',
        'Phone size'     : 'Puhelinkoko',
        primaryColor     : 'Ensisijainen väri'
    },

    Tooltip : {
        infoButton       : 'Napsauta näyttääksesi tiedot ja vaihtaaksesi teeman tai kielen',
        codeButton       : 'Napsauta näyttääksesi sisäänrakennetun koodieditorin',
        hintCheck        : 'Valitse näyttääksesi vihjeet automaattisesti esimerkkiä ladattaessa',
        fullscreenButton : 'Koko näyttö',
        openInCodePen    : 'Avaa CodePenissä',
        toggleLightDark  : 'Vaihda vaalea / tumma tila'
    },

    Popup : {
        UsedClasses : 'Tässä demossa käytetyt luokat'
    },

    TextField : {
        Filter : 'Suodata'
    },

    FilterField : {
        typeToFilter : 'Kirjoita suodattaaksesi'
    },

    SlideToggle : {
        newDemos : 'Uudet ja päivitetyt'
    }
};

export default LocaleHelper.publishLocale(locale);
