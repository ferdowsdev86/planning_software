import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Lv.js';

const locale = {

    localeName : 'Lv',
    localeDesc : 'Latviešu',
    localeCode : 'lv-LV',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalizācijas demonstrācija'
    },

    Button : {
        'Add column'    : 'Pievienot kolonnu',
        'Display hints' : 'Parādīt norādes',
        'Remove column' : 'Noņemt kolonnu',
        Apply           : 'Piemērot',
        Learn           : 'Mācīties',
        DownloadTrial   : 'Lejupielādēt izmēģinājuma versiju',
        upgradeGuide    : 'Atjaunināšanas ceļvedis',
        documentation   : 'Dokumentācija',
        tabJS           : 'Parādīt JavaScript piemērus',
        tabReact        : 'Parādīt React piemērus',
        tabVue          : 'Parādīt Vue piemērus',
        tabAngular      : 'Parādīt Angular piemērus'
    },

    Column : {
        Company : 'Uzņēmums',
        Name    : 'Vārds'
    },

    Checkbox : {
        'Auto apply'  : 'Automātiska piemērošana',
        Automatically : 'Automātiski',
        runHints      : 'Palaist norāžu plūsmu startēšanas laikā'
    },

    CodeEditor : {
        'Code editor'   : 'Koda redaktors',
        'Download code' : 'Lejupielādēt kodu'
    },

    Combo : {
        Theme    : 'Tēma',
        Language : 'Valoda',
        Size     : 'Izmērs',
        jumpTo   : 'Pāriet uz'
    },

    Shared : {
        'Full size'      : 'Pilna izmēra',
        'Locale changed' : 'Valoda mainīta',
        'Phone size'     : 'Tālruņa izmērs',
        primaryColor     : 'Primārā krāsa'
    },

    Tooltip : {
        infoButton       : 'Noklikšķiniet, lai parādītu informāciju un pārslēgtu tēmu vai valodu',
        codeButton       : 'Noklikšķiniet, lai parādītu iebūvēto koda redaktoru',
        hintCheck        : 'Atzīmējiet, lai automātiski parādītu norādes, ielādējot piemēru',
        fullscreenButton : 'Pilnekrāna režīms',
        openInCodePen    : 'Atvērt CodePen',
        toggleLightDark  : 'Pārslēgt gaišo / tumšo režīmu'
    },

    Popup : {
        UsedClasses : 'Šajā demonstrācijā izmantotās klases'
    },

    TextField : {
        Filter : 'Filtrs'
    },

    FilterField : {
        typeToFilter : 'Rakstiet, lai filtrētu'
    },

    SlideToggle : {
        newDemos : 'Jauni un atjaunināti'
    }
};

export default LocaleHelper.publishLocale(locale);
