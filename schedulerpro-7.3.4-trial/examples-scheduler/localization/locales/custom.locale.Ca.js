import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Ca.js';

const locale = {

    localeName : 'Ca',
    localeDesc : 'Català',
    localeCode : 'ca-ES',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demostració de localització'
    },

    Button : {
        'Add column'    : 'Afegeix columna',
        'Display hints' : 'Mostra suggeriments',
        'Remove column' : 'Elimina columna',
        Apply           : 'Aplica',
        Learn           : 'Aprendre',
        DownloadTrial   : 'Descarregar prova',
        upgradeGuide    : "Guia d'actualització",
        documentation   : 'Documentació',
        tabJS           : 'Mostra exemples de JavaScript',
        tabReact        : 'Mostra exemples de React',
        tabVue          : 'Mostra exemples de Vue',
        tabAngular      : "Mostra exemples d'Angular"
    },

    Column : {
        Company : 'Empresa',
        Name    : 'Nom'
    },

    Checkbox : {
        'Auto apply'  : 'Aplica automàticament',
        Automatically : 'Automàticament',
        runHints      : 'Executa el flux de suggeriments en iniciar'
    },

    CodeEditor : {
        'Code editor'   : 'Editor de codi',
        'Download code' : 'Descarrega codi'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Idioma',
        Size     : 'Mida',
        jumpTo   : 'Salta a'
    },

    Shared : {
        'Full size'      : 'Mida completa',
        'Locale changed' : 'Idioma canviat',
        'Phone size'     : 'Mida del telèfon',
        primaryColor     : 'Color primari'
    },

    Tooltip : {
        infoButton       : "Fes clic per mostrar informació i canviar el tema o l'idioma",
        codeButton       : "Fes clic per mostrar l'editor de codi integrat",
        hintCheck        : "Marca per mostrar automàticament els suggeriments en carregar l'exemple",
        fullscreenButton : 'Pantalla completa',
        openInCodePen    : 'Obre a CodePen',
        toggleLightDark  : 'Canvia el mode clar / fosc'
    },

    Popup : {
        UsedClasses : 'Classes utilitzades en aquesta demostració'
    },

    TextField : {
        Filter : 'Filtre'
    },

    FilterField : {
        typeToFilter : 'Escriu per filtrar'
    },

    SlideToggle : {
        newDemos : 'Nous i actualitzats'
    }
};

export default LocaleHelper.publishLocale(locale);
