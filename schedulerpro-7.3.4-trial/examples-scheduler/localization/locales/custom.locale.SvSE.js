import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/SvSE.js';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalisierungs-Demo'
    },

    Button : {
        'Add column'    : 'Lägg till kolumn',
        'Display hints' : 'Visa tips',
        'Remove column' : 'Ta bort kolumn',
        Apply           : 'Verkställ',
        Learn           : 'Lär',
        DownloadTrial   : 'Ladda ner testversion',
        upgradeGuide    : 'Uppgraderingsguide',
        documentation   : 'Dokumentation',
        tabJS           : 'Visa JavaScript-exempel',
        tabReact        : 'Visa React-exempel',
        tabVue          : 'Visa Vue-exempel',
        tabAngular      : 'Visa Angular-exempel'
    },

    Column : {
        Company : 'Företag',
        Name    : 'Namn'
    },

    Checkbox : {
        'Auto apply'  : 'Auto applicera',
        Automatically : 'Automatiskt',
        runHints      : 'Kör tipsflöde vid start'
    },

    CodeEditor : {
        'Code editor'   : 'Kodredigerare',
        'Download code' : 'Ladda ner kod'
    },

    Combo : {
        Theme    : 'Välj tema',
        Language : 'Välj språk',
        Size     : 'Välj storlek',
        jumpTo   : 'Hoppa till'
    },

    Shared : {
        'Full size'      : 'Full storlek',
        'Locale changed' : 'Språk ändrat',
        'Phone size'     : 'Telefonstorlek',
        primaryColor     : 'Primärfärg'
    },

    Tooltip : {
        infoButton       : 'Klicka för att visa information och byta tema eller språk',
        codeButton       : 'Klicka för att visa den inbyggda kodredigeraren',
        hintCheck        : 'Markera för att automatiskt visa tips när du laddar exemplet',
        fullscreenButton : 'Fullskärm',
        openInCodePen    : 'Öppna i CodePen',
        toggleLightDark  : 'Växla ljust / mörkt läge'
    },

    Popup : {
        UsedClasses : 'Klasser som används i denna demo'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Skriv för att filtrera'
    },

    SlideToggle : {
        newDemos : 'Nya och uppdaterade'
    }
};

export default LocaleHelper.publishLocale(locale);
