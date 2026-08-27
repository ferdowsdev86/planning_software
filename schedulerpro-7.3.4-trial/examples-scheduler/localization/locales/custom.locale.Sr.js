import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Sr.js';

const locale = {

    localeName : 'Sr',
    localeDesc : 'Srpski',
    localeCode : 'sr',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Демонстрација локализације'
    },

    Button : {
        'Add column'    : 'Додај колону',
        'Display hints' : 'Prikaži savete',
        'Remove column' : 'Уклони колону',
        Apply           : 'Primeni',
        Learn           : 'Nauči',
        DownloadTrial   : 'Preuzmi probnu verziju',
        upgradeGuide    : 'Vodič za nadogradnju',
        documentation   : 'Dokumentacija',
        tabJS           : 'Prikaži primere JavaScript-a',
        tabReact        : 'Prikaži primere React-a',
        tabVue          : 'Prikaži primere Vue-a',
        tabAngular      : 'Prikaži primere Angular-a'
    },

    Column : {
        Company : 'Kompanija',
        Name    : 'Име'
    },

    Checkbox : {
        'Auto apply'  : 'Аутоматска примена',
        Automatically : 'Automatski',
        runHints      : 'Pokreni tok saveta pri pokretanju'
    },

    CodeEditor : {
        'Code editor'   : 'Уређивач кода',
        'Download code' : 'Преузми код'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Jezik',
        Size     : 'Veličina',
        jumpTo   : 'Idi na'
    },

    Shared : {
        'Full size'      : 'Puna veličina',
        'Locale changed' : 'Lokalizacija promenjena',
        'Phone size'     : 'Veličina telefona',
        primaryColor     : 'Primarna boja'
    },

    Tooltip : {
        infoButton       : 'Kliknite da prikažete informacije i promenite temu ili lokalizaciju',
        codeButton       : 'Kliknite da prikažete ugrađeni uređivač koda',
        hintCheck        : 'Označite da automatski prikažete savete prilikom učitavanja primera',
        fullscreenButton : 'Ceo ekran',
        openInCodePen    : 'Otvori u CodePen-u',
        toggleLightDark  : 'Prebaci svetli / tamni režim'
    },

    Popup : {
        UsedClasses : 'Klase korišćene u ovom demou'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Unesite za filtriranje'
    },

    SlideToggle : {
        newDemos : 'Novi i ažurirani'
    }
};

export default LocaleHelper.publishLocale(locale);
