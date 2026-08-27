import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Da.js';

const locale = {

    localeName : 'Da',
    localeDesc : 'Dansk',
    localeCode : 'da',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokaliseringsdemo'
    },

    Button : {
        'Add column'    : 'Tilføj kolonne',
        'Display hints' : 'Vis hints',
        'Remove column' : 'Fjern kolonne',
        Apply           : 'Anvend',
        Learn           : 'Lær',
        DownloadTrial   : 'Download prøveversion',
        upgradeGuide    : 'Opgraderingsvejledning',
        documentation   : 'Dokumentation',
        tabJS           : 'Vis JavaScript eksempler',
        tabReact        : 'Vis React eksempler',
        tabVue          : 'Vis Vue eksempler',
        tabAngular      : 'Vis Angular eksempler'
    },

    Column : {
        Company : 'Virksomhed',
        Name    : 'Navn'
    },

    Checkbox : {
        'Auto apply'  : 'Automatisk anvend',
        Automatically : 'Automatisk',
        runHints      : 'Kør hintflow ved opstart'
    },

    CodeEditor : {
        'Code editor'   : 'Kodeeditor',
        'Download code' : 'Download kode'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Sprog',
        Size     : 'Størrelse',
        jumpTo   : 'Spring til'
    },

    Shared : {
        'Full size'      : 'Fuld størrelse',
        'Locale changed' : 'Lokalitet ændret',
        'Phone size'     : 'Telefonstørrelse',
        primaryColor     : 'Primær farve'
    },

    Tooltip : {
        infoButton       : 'Klik for at vise info og skifte tema eller lokalitet',
        codeButton       : 'Klik for at vise den indbyggede kodeeditor',
        hintCheck        : 'Marker for automatisk at vise hints ved indlæsning af eksemplet',
        fullscreenButton : 'Fuld skærm',
        openInCodePen    : 'Åbn i CodePen',
        toggleLightDark  : 'Skift lys / mørk tilstand'
    },

    Popup : {
        UsedClasses : 'Klasser brugt i denne demo'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Skriv for at filtrere'
    },

    SlideToggle : {
        newDemos : 'Nye og opdaterede'
    }
};

export default LocaleHelper.publishLocale(locale);
