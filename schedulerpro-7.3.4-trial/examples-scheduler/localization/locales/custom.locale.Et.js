import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Et.js';

const locale = {

    localeName : 'Et',
    localeDesc : 'Eesti keel',
    localeCode : 'et',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokaliseerimise demo'
    },

    Button : {
        'Add column'    : 'Lisa veerg',
        'Display hints' : 'Kuva vihjed',
        'Remove column' : 'Eemalda veerg',
        Apply           : 'Rakenda',
        Learn           : 'Õpi',
        DownloadTrial   : 'Laadi alla prooviversioon',
        upgradeGuide    : 'Uuendamise juhend',
        documentation   : 'Dokumentatsioon',
        tabJS           : 'Näita JavaScripti näiteid',
        tabReact        : 'Näita Reacti näiteid',
        tabVue          : 'Näita Vue näiteid',
        tabAngular      : 'Näita Angulari näiteid'
    },

    Column : {
        Company : 'Ettevõte',
        Name    : 'Nimi'
    },

    Checkbox : {
        'Auto apply'  : 'Automaatne rakendamine',
        Automatically : 'Automaatselt',
        runHints      : 'Käivita vihjete voog käivitamisel'
    },

    CodeEditor : {
        'Code editor'   : 'Koodiredaktor',
        'Download code' : 'Laadi kood alla'
    },

    Combo : {
        Theme    : 'Teema',
        Language : 'Keel',
        Size     : 'Suurus',
        jumpTo   : 'Hüppa juurde'
    },

    Shared : {
        'Full size'      : 'Täissuurus',
        'Locale changed' : 'Keel muutus',
        'Phone size'     : 'Telefonisuurus',
        primaryColor     : 'Peamine värv'
    },

    Tooltip : {
        infoButton       : 'Klõpsake, et näidata infot ja vahetada teemat või keelt',
        codeButton       : 'Klõpsake, et näidata sisseehitatud koodiredaktorit',
        hintCheck        : 'Märkige, et automaatselt kuvada vihjeid näite laadimisel',
        fullscreenButton : 'Täisekraan',
        openInCodePen    : 'Ava CodePenis',
        toggleLightDark  : 'Vaheta heleda / tumeda režiimi vahel'
    },

    Popup : {
        UsedClasses : 'Selles demos kasutatud klassid'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Sisesta filtreerimiseks'
    },

    SlideToggle : {
        newDemos : 'Uued ja uuendatud'
    }
};

export default LocaleHelper.publishLocale(locale);
