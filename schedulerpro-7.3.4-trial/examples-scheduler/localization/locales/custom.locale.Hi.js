import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Hi.js';

const locale = {

    localeName : 'Hi',
    localeDesc : 'हिन्दी',
    localeCode : 'hi',
    localeRtl  : false,

    App : {
        'Localization demo' : 'स्थानीयकरण डेमो'
    },

    Button : {
        'Add column'    : 'स्तंभ जोड़ें',
        'Display hints' : 'संकेत दिखाएं',
        'Remove column' : 'स्तंभ हटाएँ',
        Apply           : 'लागू करें',
        Learn           : 'सीखें',
        DownloadTrial   : 'ट्रायल डाउनलोड करें',
        upgradeGuide    : 'अपग्रेड गाइड',
        documentation   : 'दस्तावेज़ीकरण',
        tabJS           : 'जावास्क्रिप्ट उदाहरण दिखाएँ',
        tabReact        : 'React उदाहरण दिखाएँ',
        tabVue          : 'Vue उदाहरण दिखाएँ',
        tabAngular      : 'Angular उदाहरण दिखाएँ'
    },

    Column : {
        Company : 'कंपनी',
        Name    : 'नाम'
    },

    Checkbox : {
        'Auto apply'  : 'स्वचालित लागू करें',
        Automatically : 'स्वचालित रूप से',
        runHints      : 'स्टार्टअप पर संकेत प्रवाह चलाएं'
    },

    CodeEditor : {
        'Code editor'   : 'कोड संपादक',
        'Download code' : 'कोड डाउनलोड करें'
    },

    Combo : {
        Theme    : 'थीम',
        Language : 'भाषा',
        Size     : 'आकार',
        jumpTo   : 'पर जाएँ'
    },

    Shared : {
        'Full size'      : 'पूर्ण आकार',
        'Locale changed' : 'स्थान बदला गया',
        'Phone size'     : 'फ़ोन आकार',
        primaryColor     : 'प्राथमिक रंग'
    },

    Tooltip : {
        infoButton       : 'जानकारी दिखाने और थीम या स्थान बदलने के लिए क्लिक करें',
        codeButton       : 'बिल्ट-इन कोड संपादक दिखाने के लिए क्लिक करें',
        hintCheck        : 'उदाहरण लोड करते समय संकेत स्वचालित रूप से दिखाने के लिए चेक करें',
        fullscreenButton : 'पूर्ण स्क्रीन',
        openInCodePen    : 'CodePen में खोलें',
        toggleLightDark  : 'लाइट / डार्क मोड टॉगल करें'
    },

    Popup : {
        UsedClasses : 'इस डेमो में उपयोग की गई कक्षाएं'
    },

    TextField : {
        Filter : 'फ़िल्टर'
    },

    FilterField : {
        typeToFilter : 'फ़िल्टर करने के लिए टाइप करें'
    },

    SlideToggle : {
        newDemos : 'नए और अपडेटेड'
    }
};

export default LocaleHelper.publishLocale(locale);
