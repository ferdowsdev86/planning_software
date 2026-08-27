import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Eu.js';

const locale = {

    localeName : 'Eu',
    localeDesc : 'Euskara',
    localeCode : 'eu-ES',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalizazio demo'
    },

    Button : {
        'Add column'    : 'Gehitu zutabea',
        'Display hints' : 'Aholkuak bistaratu',
        'Remove column' : 'Kendu zutabea',
        Apply           : 'Aplikatu',
        Learn           : 'Ikasi',
        DownloadTrial   : 'Deskargatu Proba',
        upgradeGuide    : 'Eguneratzeko Gida',
        documentation   : 'Dokumentazioa',
        tabJS           : 'Erakutsi JavaScript adibideak',
        tabReact        : 'Erakutsi React adibideak',
        tabVue          : 'Erakutsi Vue adibideak',
        tabAngular      : 'Erakutsi Angular adibideak'
    },

    Column : {
        Company : 'Enpresa',
        Name    : 'Izena'
    },

    Checkbox : {
        'Auto apply'  : 'Aplikatu automatikoki',
        Automatically : 'Automatikoki',
        runHints      : 'Exekutatu pista-fluxua hasieran'
    },

    CodeEditor : {
        'Code editor'   : 'Kode editorea',
        'Download code' : 'Deskargatu kodea'
    },

    Combo : {
        Theme    : 'Gaia',
        Language : 'Hizkuntza',
        Size     : 'Tamaina',
        jumpTo   : 'Joan hona'
    },

    Shared : {
        'Full size'      : 'Tamaina osoa',
        'Locale changed' : 'Tokiko hizkuntza aldatu da',
        'Phone size'     : 'Telefono tamaina',
        primaryColor     : 'Lehen kolorea'
    },

    Tooltip : {
        infoButton       : 'Klik egin informazioa erakusteko eta gaia edo tokiko hizkuntza aldatzeko',
        codeButton       : 'Klik egin barneko kode editorea erakusteko',
        hintCheck        : 'Markatu adibidea kargatzean aholkuak automatikoki bistaratzeko',
        fullscreenButton : 'Pantaila osoa',
        openInCodePen    : 'Ireki CodePen-en',
        toggleLightDark  : 'Aldatu argi / ilun modua'
    },

    Popup : {
        UsedClasses : 'Demo honetan erabilitako klaseak'
    },

    TextField : {
        Filter : 'Iragazi'
    },

    FilterField : {
        typeToFilter : 'Idatzi iragazteko'
    },

    SlideToggle : {
        newDemos : 'Berriak eta eguneratuak'
    }
};

export default LocaleHelper.publishLocale(locale);
