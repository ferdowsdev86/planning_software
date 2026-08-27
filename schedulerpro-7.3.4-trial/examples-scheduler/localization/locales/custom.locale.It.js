import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/It.js';

const locale = {

    localeName : 'It',
    localeDesc : 'Italiano',
    localeCode : 'it',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Dimostrazione di localizzazione'
    },

    Button : {
        'Add column'    : 'Aggiungi colonna',
        'Display hints' : 'Mostra suggerimenti',
        'Remove column' : 'Rimuovi colonna',
        Apply           : 'Applica',
        Learn           : 'Impara',
        DownloadTrial   : 'Scarica la versione di prova',
        upgradeGuide    : "Guida all'aggiornamento",
        documentation   : 'Documentazione',
        tabJS           : 'Mostra esempi JavaScript',
        tabReact        : 'Mostra esempi React',
        tabVue          : 'Mostra esempi Vue',
        tabAngular      : 'Mostra esempi Angular'
    },

    Column : {
        Company : 'Azienda',
        Name    : 'Nome'
    },

    Checkbox : {
        'Auto apply'  : 'Applica automaticamente',
        Automatically : 'Automaticamente',
        runHints      : "Esegui il flusso di suggerimenti all'avvio"
    },

    CodeEditor : {
        'Code editor'   : 'Editor di codice',
        'Download code' : 'Scarica codice'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Lingua',
        Size     : 'Dimensione',
        jumpTo   : 'Vai a'
    },

    Shared : {
        'Full size'      : 'Dimensione intera',
        'Locale changed' : 'Lingua cambiata',
        'Phone size'     : 'Dimensione telefono',
        primaryColor     : 'Colore primario'
    },

    Tooltip : {
        infoButton       : 'Clicca per mostrare informazioni e cambiare tema o lingua',
        codeButton       : "Clicca per mostrare l'editor di codice integrato",
        hintCheck        : "Seleziona per mostrare automaticamente i suggerimenti quando si carica l'esempio",
        fullscreenButton : 'Schermo intero',
        openInCodePen    : 'Apri in CodePen',
        toggleLightDark  : 'Attiva/disattiva modalità chiara/scura'
    },

    Popup : {
        UsedClasses : 'Classi utilizzate in questa demo'
    },

    TextField : {
        Filter : 'Filtro'
    },

    FilterField : {
        typeToFilter : 'Digita per filtrare'
    },

    SlideToggle : {
        newDemos : 'Nuovi e aggiornati'
    }
};

export default LocaleHelper.publishLocale(locale);
