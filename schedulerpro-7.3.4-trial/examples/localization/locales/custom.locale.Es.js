import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Es.js';

const locale = {

    localeName : 'Es',
    localeDesc : 'Español',
    localeCode : 'es',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demostración de localización'
    },

    Button : {
        'Add column'    : 'Agregar columna',
        'Display hints' : 'Mostrar sugerencias',
        'Remove column' : 'Eliminar columna',
        Apply           : 'Aplicar',
        Learn           : 'Aprender',
        DownloadTrial   : 'Descargar prueba',
        upgradeGuide    : 'Guía de actualización',
        documentation   : 'Documentación',
        tabJS           : 'Mostrar ejemplos de JavaScript',
        tabReact        : 'Mostrar ejemplos de React',
        tabVue          : 'Mostrar ejemplos de Vue',
        tabAngular      : 'Mostrar ejemplos de Angular'
    },

    Column : {
        Company : 'Empresa',
        Name    : 'Nombre'
    },

    Checkbox : {
        'Auto apply'  : 'Aplicar automáticamente',
        Automatically : 'Automáticamente',
        runHints      : 'Ejecutar el flujo de sugerencias al iniciar'
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
        'Locale changed' : 'Configuración regional cambiada',
        'Phone size'     : 'Tamaño de teléfono',
        primaryColor     : 'Color primario'
    },

    Tooltip : {
        infoButton       : 'Haga clic para mostrar información y cambiar el tema o la configuración regional',
        codeButton       : 'Haga clic para mostrar el editor de código integrado',
        hintCheck        : 'Marque para mostrar automáticamente sugerencias al cargar el ejemplo',
        fullscreenButton : 'Pantalla completa',
        openInCodePen    : 'Abrir en CodePen',
        toggleLightDark  : 'Alternar modo claro / oscuro'
    },

    Popup : {
        UsedClasses : 'Clases utilizadas en esta demostración'
    },

    TextField : {
        Filter : 'Filtrar'
    },

    FilterField : {
        typeToFilter : 'Escriba para filtrar'
    },

    SlideToggle : {
        newDemos : 'Nuevos y actualizados'
    }
};

export default LocaleHelper.publishLocale(locale);
