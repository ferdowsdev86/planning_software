import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Uk.js';

const locale = {

    localeName : 'Uk',
    localeDesc : 'Українська',
    localeCode : 'uk-UA',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Демонстрація локалізації'
    },

    Button : {
        'Add column'    : 'Додати стовпець',
        'Display hints' : 'Показати підказки',
        'Remove column' : 'Видалити стовпець',
        Apply           : 'Застосувати',
        Learn           : 'Вивчити',
        DownloadTrial   : 'Завантажити пробну версію',
        upgradeGuide    : 'Посібник з оновлення',
        documentation   : 'Документація',
        tabJS           : 'Показати приклади JavaScript',
        tabReact        : 'Показати приклади React',
        tabVue          : 'Показати приклади Vue',
        tabAngular      : 'Показати приклади Angular'
    },

    Column : {
        Company : 'Компанія',
        Name    : "Ім'я"
    },

    Checkbox : {
        'Auto apply'  : 'Автоматичне застосування',
        Automatically : 'Автоматично',
        runHints      : 'Запустити підказки при запуску'
    },

    CodeEditor : {
        'Code editor'   : 'Редактор коду',
        'Download code' : 'Завантажити код'
    },

    Combo : {
        Theme    : 'Тема',
        Language : 'Мова',
        Size     : 'Розмір',
        jumpTo   : 'Перейти до'
    },

    Shared : {
        'Full size'      : 'Повний розмір',
        'Locale changed' : 'Локаль змінено',
        'Phone size'     : 'Розмір телефону',
        primaryColor     : 'Основний колір'
    },

    Tooltip : {
        infoButton       : 'Натисніть, щоб показати інформацію та змінити тему або локаль',
        codeButton       : 'Натисніть, щоб показати вбудований редактор коду',
        hintCheck        : 'Позначте, щоб автоматично показувати підказки при завантаженні прикладу',
        fullscreenButton : 'На весь екран',
        openInCodePen    : 'Відкрити в CodePen',
        toggleLightDark  : 'Перемкнути світлий / темний режим'
    },

    Popup : {
        UsedClasses : 'Класи, використані в цій демонстрації'
    },

    TextField : {
        Filter : 'Фільтр'
    },

    FilterField : {
        typeToFilter : 'Введіть для фільтрації'
    },

    SlideToggle : {
        newDemos : 'Нові та оновлені'
    }
};

export default LocaleHelper.publishLocale(locale);
