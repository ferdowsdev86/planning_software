import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/No.js';

const locale = {

    localeName : 'No',
    localeDesc : 'Norsk',
    localeCode : 'no',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokaliseringsdemo'
    },

    Button : {
        'Add column'    : 'Legg til kolonne',
        'Display hints' : 'Vis hint',
        'Remove column' : 'Fjern kolonne',
        Apply           : 'Bruk',
        Learn           : 'Lær',
        DownloadTrial   : 'Last ned prøveversjon',
        upgradeGuide    : 'Oppgraderingsveiledning',
        documentation   : 'Dokumentasjon',
        tabJS           : 'Vis JavaScript-eksempler',
        tabReact        : 'Vis React-eksempler',
        tabVue          : 'Vis Vue-eksempler',
        tabAngular      : 'Vis Angular-eksempler'
    },

    Column : {
        Company : 'Firma',
        Name    : 'Navn'
    },

    Checkbox : {
        'Auto apply'  : 'Automatisk bruk',
        Automatically : 'Automatisk',
        runHints      : 'Kjør hintflyt ved oppstart'
    },

    CodeEditor : {
        'Code editor'   : 'Kodeeditor',
        'Download code' : 'Last ned kode'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Språk',
        Size     : 'Størrelse',
        jumpTo   : 'Hopp til'
    },

    Shared : {
        'Full size'      : 'Full størrelse',
        'Locale changed' : 'Språk endret',
        'Phone size'     : 'Telefonstørrelse',
        primaryColor     : 'Primærfarge'
    },

    Tooltip : {
        infoButton       : 'Klikk for å vise info og bytte tema eller språk',
        codeButton       : 'Klikk for å vise den innebygde kodeeditoren',
        hintCheck        : 'Merk for å automatisk vise hint når eksempelet lastes',
        fullscreenButton : 'Fullskjerm',
        openInCodePen    : 'Åpne i CodePen',
        toggleLightDark  : 'Bytt lys / mørk modus'
    },

    Popup : {
        UsedClasses : 'Klasser brukt i denne demoen'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Skriv for å filtrere'
    },

    SlideToggle : {
        newDemos : 'Nye og oppdaterte'
    }
};

export default LocaleHelper.publishLocale(locale);
