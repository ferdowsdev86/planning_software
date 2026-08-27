import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/De.js';

const locale = {

    localeName : 'De',
    localeDesc : 'Deutsch',
    localeCode : 'de-DE',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalisierungs-Demo'
    },

    Button : {
        'Add column'    : 'Spalte hinzufügen',
        'Display hints' : 'Hinweise anzeigen',
        'Remove column' : 'Spalte entfernen',
        Apply           : 'Anwenden',
        Learn           : 'Lernen',
        DownloadTrial   : 'Testversion herunterladen',
        upgradeGuide    : 'Upgrade-Anleitung',
        documentation   : 'Dokumentation',
        tabJS           : 'JavaScript-Beispiele anzeigen',
        tabReact        : 'React-Beispiele anzeigen',
        tabVue          : 'Vue-Beispiele anzeigen',
        tabAngular      : 'Angular-Beispiele anzeigen'
    },

    Column : {
        Company : 'Firma',
        Name    : 'Name'
    },

    Checkbox : {
        'Auto apply'  : 'Automatisch anwenden',
        Automatically : 'Automatisch',
        runHints      : 'Hinweisfluss beim Start ausführen'
    },

    CodeEditor : {
        'Code editor'   : 'Code-Editor',
        'Download code' : 'Code herunterladen'
    },

    Combo : {
        Theme    : 'Thema',
        Language : 'Sprache',
        Size     : 'Größe',
        jumpTo   : 'Springen zu'
    },

    Shared : {
        'Full size'      : 'Volle Größe',
        'Locale changed' : 'Gebietsschema geändert',
        'Phone size'     : 'Telefongröße',
        primaryColor     : 'Primärfarbe'
    },

    Tooltip : {
        infoButton       : 'Klicken, um Informationen anzuzeigen und das Thema oder Gebietsschema zu wechseln',
        codeButton       : 'Klicken, um den integrierten Code-Editor anzuzeigen',
        hintCheck        : 'Aktivieren, um beim Laden des Beispiels automatisch Hinweise anzuzeigen',
        fullscreenButton : 'Vollbild',
        openInCodePen    : 'In CodePen öffnen',
        toggleLightDark  : 'Zwischen hellem und dunklem Modus wechseln'
    },

    Popup : {
        UsedClasses : 'In diesem Demo verwendete Klassen'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Zum Filtern eingeben'
    },

    SlideToggle : {
        newDemos : 'Neu und aktualisiert'
    }
};

export default LocaleHelper.publishLocale(locale);
