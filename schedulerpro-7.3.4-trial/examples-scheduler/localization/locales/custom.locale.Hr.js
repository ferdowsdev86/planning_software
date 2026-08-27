import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Hr.js';

const locale = {

    localeName : 'Hr',
    localeDesc : 'Hrvatski',
    localeCode : 'hr',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demonstracija lokalizacije'
    },

    Button : {
        'Add column'    : 'Dodaj stupac',
        'Display hints' : 'Prikaži savjete',
        'Remove column' : 'Ukloni stupac',
        Apply           : 'Primijeni',
        Learn           : 'Uči',
        DownloadTrial   : 'Preuzmi probnu verziju',
        upgradeGuide    : 'Vodič za nadogradnju',
        documentation   : 'Dokumentacija',
        tabJS           : 'Prikaži primjere JavaScripta',
        tabReact        : 'Prikaži primjere Reacta',
        tabVue          : 'Prikaži primjere Vuea',
        tabAngular      : 'Prikaži primjere Angulara'
    },

    Column : {
        Company : 'Tvrtka',
        Name    : 'Ime'
    },

    Checkbox : {
        'Auto apply'  : 'Automatski primijeni',
        Automatically : 'Automatski',
        runHints      : 'Pokreni tijek savjeta pri pokretanju'
    },

    CodeEditor : {
        'Code editor'   : 'Uređivač koda',
        'Download code' : 'Preuzmi kod'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Jezik',
        Size     : 'Veličina',
        jumpTo   : 'Skoči na'
    },

    Shared : {
        'Full size'      : 'Puna veličina',
        'Locale changed' : 'Lokalitet promijenjen',
        'Phone size'     : 'Veličina telefona',
        primaryColor     : 'Primarna boja'
    },

    Tooltip : {
        infoButton       : 'Kliknite za prikaz informacija i promjenu teme ili lokaliteta',
        codeButton       : 'Kliknite za prikaz ugrađenog uređivača koda',
        hintCheck        : 'Označite za automatski prikaz savjeta prilikom učitavanja primjera',
        fullscreenButton : 'Cijeli ekran',
        openInCodePen    : 'Otvori u CodePen-u',
        toggleLightDark  : 'Prebaci svijetli / tamni način rada'
    },

    Popup : {
        UsedClasses : 'Klase korištene u ovom demou'
    },

    TextField : {
        Filter : 'Filtriraj'
    },

    FilterField : {
        typeToFilter : 'Upišite za filtriranje'
    },

    SlideToggle : {
        newDemos : 'Novi i ažurirani'
    }
};

export default LocaleHelper.publishLocale(locale);
