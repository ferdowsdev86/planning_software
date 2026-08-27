import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Kk.js';

const locale = {

    localeName : 'Kk',
    localeDesc : 'Қазақ тілі (KZ)',
    localeCode : 'kk-KZ',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Локализация демосы'
    },

    Button : {
        'Add column'    : 'Баған қосу',
        'Display hints' : 'Кеңестерді көрсету',
        'Remove column' : 'Бағанды жою',
        Apply           : 'Қолдану',
        Learn           : 'Үйрену',
        DownloadTrial   : 'Сынақ нұсқасын жүктеу',
        upgradeGuide    : 'Жаңарту нұсқаулығы',
        documentation   : 'Құжаттама',
        tabJS           : 'JavaScript мысалдарын көрсету',
        tabReact        : 'React мысалдарын көрсету',
        tabVue          : 'Vue мысалдарын көрсету',
        tabAngular      : 'Angular мысалдарын көрсету'
    },

    Column : {
        Company : 'Компания',
        Name    : 'Аты'
    },

    Checkbox : {
        'Auto apply'  : 'Автоматты қолдану',
        Automatically : 'Автоматты түрде',
        runHints      : 'Жұмыс кеңестерін іске қосу'
    },

    CodeEditor : {
        'Code editor'   : 'Код редакторы',
        'Download code' : 'Кодты жүктеу'
    },

    Combo : {
        Theme    : 'Тақырып',
        Language : 'Тіл',
        Size     : 'Өлшем',
        jumpTo   : 'Өту'
    },

    Shared : {
        'Full size'      : 'Толық өлшем',
        'Locale changed' : 'Локаль өзгертілді',
        'Phone size'     : 'Телефон өлшемі',
        primaryColor     : 'Басты түс'
    },

    Tooltip : {
        infoButton       : 'Ақпаратты көрсету және тақырыпты немесе локальді ауыстыру үшін басыңыз',
        codeButton       : 'Кірістірілген код редакторын көрсету үшін басыңыз',
        hintCheck        : 'Мысалды жүктегенде кеңестерді автоматты түрде көрсету үшін белгілеңіз',
        fullscreenButton : 'Толық экран',
        openInCodePen    : 'CodePen-де ашу',
        toggleLightDark  : 'Жарық / қараңғы режимін ауыстыру'
    },

    Popup : {
        UsedClasses : 'Бұл демода қолданылған сыныптар'
    },

    TextField : {
        Filter : 'Сүзгі'
    },

    FilterField : {
        typeToFilter : 'Сүзу үшін теріңіз'
    },

    SlideToggle : {
        newDemos : 'Жаңа және жаңартылған'
    }
};

export default LocaleHelper.publishLocale(locale);
