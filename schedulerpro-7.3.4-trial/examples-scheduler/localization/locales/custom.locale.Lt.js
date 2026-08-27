import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Lt.js';

const locale = {

    localeName : 'LT',
    localeDesc : 'Lietuvių',
    localeCode : 'lt-LT',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalizacijos demonstracija'
    },

    Button : {
        'Add column'    : 'Pridėti stulpelį',
        'Display hints' : 'Rodyti užuominas',
        'Remove column' : 'Pašalinti stulpelį',
        Apply           : 'Taikyti',
        Learn           : 'Sužinoti',
        DownloadTrial   : 'Atsisiųsti bandomąją versiją',
        upgradeGuide    : 'Atnaujinimo vadovas',
        documentation   : 'Dokumentacija',
        tabJS           : 'Rodyti JavaScript pavyzdžius',
        tabReact        : 'Rodyti React pavyzdžius',
        tabVue          : 'Rodyti Vue pavyzdžius',
        tabAngular      : 'Rodyti Angular pavyzdžius'
    },

    Column : {
        Company : 'Įmonė',
        Name    : 'Vardas'
    },

    Checkbox : {
        'Auto apply'  : 'Automatinis taikymas',
        Automatically : 'Automatiškai',
        runHints      : 'Paleisti užuominų srautą paleidžiant'
    },

    CodeEditor : {
        'Code editor'   : 'Kodo redaktorius',
        'Download code' : 'Atsisiųsti kodą'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Kalba',
        Size     : 'Dydis',
        jumpTo   : 'Pereiti į'
    },

    Shared : {
        'Full size'      : 'Visas dydis',
        'Locale changed' : 'Kalba pakeista',
        'Phone size'     : 'Telefono dydis',
        primaryColor     : 'Pagrindinė spalva'
    },

    Tooltip : {
        infoButton       : 'Spustelėkite, kad parodytumėte informaciją ir pakeistumėte temą arba kalbą',
        codeButton       : 'Spustelėkite, kad parodytumėte įmontuotą kodo redaktorių',
        hintCheck        : 'Pažymėkite, kad automatiškai rodytumėte užuominas įkeliant pavyzdį',
        fullscreenButton : 'Visas ekranas',
        openInCodePen    : 'Atidaryti CodePen',
        toggleLightDark  : 'Perjungti šviesų / tamsų režimą'
    },

    Popup : {
        UsedClasses : 'Klasės, naudojamos šiame demonstraciniame'
    },

    TextField : {
        Filter : 'Filtruoti'
    },

    FilterField : {
        typeToFilter : 'Įveskite filtravimui'
    },

    SlideToggle : {
        newDemos : 'Nauji ir atnaujinti'
    }
};

export default LocaleHelper.publishLocale(locale);
