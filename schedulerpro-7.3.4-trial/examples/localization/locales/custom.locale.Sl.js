import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Sl.js';

const locale = {

    localeName : 'Sl',
    localeDesc : 'Slovensko',
    localeCode : 'sl',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalizacijska predstavitev'
    },

    Button : {
        'Add column'    : 'Dodaj stolpec',
        'Display hints' : 'Prikaži namige',
        'Remove column' : 'Odstrani stolpec',
        Apply           : 'Uporabi',
        Learn           : 'Nauči se',
        DownloadTrial   : 'Prenesi preizkusno različico',
        upgradeGuide    : 'Vodnik za nadgradnjo',
        documentation   : 'Dokumentacija',
        tabJS           : 'Prikaži primere JavaScript',
        tabReact        : 'Prikaži primere React',
        tabVue          : 'Prikaži primere Vue',
        tabAngular      : 'Prikaži primere Angular'
    },

    Column : {
        Company : 'Podjetje',
        Name    : 'Ime'
    },

    Checkbox : {
        'Auto apply'  : 'Samodejna uporaba',
        Automatically : 'Samodejno',
        runHints      : 'Zaženi tok namigov ob zagonu'
    },

    CodeEditor : {
        'Code editor'   : 'Urejevalnik kode',
        'Download code' : 'Prenesi kodo'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Jezik',
        Size     : 'Velikost',
        jumpTo   : 'Pojdi na'
    },

    Shared : {
        'Full size'      : 'Polna velikost',
        'Locale changed' : 'Lokalizacija spremenjena',
        'Phone size'     : 'Velikost telefona',
        primaryColor     : 'Primarna barva'
    },

    Tooltip : {
        infoButton       : 'Kliknite za prikaz informacij in preklop teme ali lokalizacije',
        codeButton       : 'Kliknite za prikaz vgrajenega urejevalnika kode',
        hintCheck        : 'Označite za samodejni prikaz namigov ob nalaganju primera',
        fullscreenButton : 'Celoten zaslon',
        openInCodePen    : 'Odpri v CodePen',
        toggleLightDark  : 'Preklopi med svetlim in temnim načinom'
    },

    Popup : {
        UsedClasses : 'Razredi uporabljeni v tej predstavitvi'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Vnesite za filtriranje'
    },

    SlideToggle : {
        newDemos : 'Novi in posodobljeni'
    }
};

export default LocaleHelper.publishLocale(locale);
