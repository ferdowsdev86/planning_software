import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/EnGb.js';

const locale = {

    localeName : 'EnGb',
    localeDesc : 'English (GB)',
    localeCode : 'en-GB',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Localization demo'
    },

    Button : {
        'Add column'    : 'Add column',
        'Display hints' : 'Display hints',
        'Remove column' : 'Remove column',
        Apply           : 'Apply',
        Learn           : 'Learn',
        DownloadTrial   : 'Download Trial',
        upgradeGuide    : 'Upgrade Guide',
        documentation   : 'Documentation',
        tabJS           : 'Show JavaScript examples',
        tabReact        : 'Show React examples',
        tabVue          : 'Show Vue examples',
        tabAngular      : 'Show Angular examples'
    },

    Column : {
        Company : 'Company',
        Name    : 'Name'
    },

    Checkbox : {
        'Auto apply'  : 'Auto apply',
        Automatically : 'Automatically',
        runHints      : 'Run hint flow on start-up'
    },

    CodeEditor : {
        'Code editor'   : 'Code editor',
        'Download code' : 'Download code'
    },

    Combo : {
        Theme    : 'Theme',
        Language : 'Language',
        Size     : 'Size',
        jumpTo   : 'Jump to'
    },

    Shared : {
        'Full size'      : 'Full size',
        'Locale changed' : 'Locale changed',
        'Phone size'     : 'Phone size',
        primaryColor     : 'Primary colour'
    },

    Tooltip : {
        infoButton       : 'Click to show info and switch theme or locale',
        codeButton       : 'Click to show the built-in code editor',
        hintCheck        : 'Check to automatically display hints when loading the example',
        fullscreenButton : 'Full screen',
        openInCodePen    : 'Open in CodePen',
        toggleLightDark  : 'Toggle light / dark mode'
    },

    Popup : {
        UsedClasses : 'Classes used in this demo'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Type to filter'
    },

    SlideToggle : {
        newDemos : 'New and updated'
    }
};

export default LocaleHelper.publishLocale(locale);
