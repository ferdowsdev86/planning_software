import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Gl.js';

const locale = {

    localeName : 'Gl',
    localeDesc : 'Galego',
    localeCode : 'gl-ES',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demostración de localización'
    },

    Button : {
        'Add column'    : 'Engadir columna',
        'Display hints' : 'Mostrar suxestións',
        'Remove column' : 'Eliminar columna',
        Apply           : 'Aplicar',
        Learn           : 'Aprender',
        DownloadTrial   : 'Descargar proba',
        upgradeGuide    : 'Guía de actualización',
        documentation   : 'Documentación',
        tabJS           : 'Mostrar exemplos de JavaScript',
        tabReact        : 'Mostrar exemplos de React',
        tabVue          : 'Mostrar exemplos de Vue',
        tabAngular      : 'Mostrar exemplos de Angular'
    },

    Column : {
        Company : 'Empresa',
        Name    : 'Nome'
    },

    Checkbox : {
        'Auto apply'  : 'Aplicar automaticamente',
        Automatically : 'Automáticamente',
        runHints      : 'Executar o fluxo de suxestión ao iniciar'
    },

    CodeEditor : {
        'Code editor'   : 'Editor de código',
        'Download code' : 'Descargar código'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Idioma',
        Size     : 'Tamaño',
        jumpTo   : 'Saltar a'
    },

    Shared : {
        'Full size'      : 'Tamaño completo',
        'Locale changed' : 'Idioma cambiado',
        'Phone size'     : 'Tamaño de teléfono',
        primaryColor     : 'Cor primaria'
    },

    Tooltip : {
        infoButton       : 'Fai clic para mostrar información e cambiar o tema ou o idioma',
        codeButton       : 'Fai clic para mostrar o editor de código integrado',
        hintCheck        : 'Marcar para mostrar automaticamente as suxestións ao cargar o exemplo',
        fullscreenButton : 'Pantalla completa',
        openInCodePen    : 'Abrir en CodePen',
        toggleLightDark  : 'Alternar modo claro / escuro'
    },

    Popup : {
        UsedClasses : 'Clases usadas nesta demostración'
    },

    TextField : {
        Filter : 'Filtro'
    },

    FilterField : {
        typeToFilter : 'Escribe para filtrar'
    },

    SlideToggle : {
        newDemos : 'Novos e actualizados'
    }
};

export default LocaleHelper.publishLocale(locale);
