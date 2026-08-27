import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Ru.js';

const locale = {

    localeName : 'Ru',
    localeDesc : 'Русский',
    localeCode : 'ru',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Демо локализации'
    },

    Button : {
        'Add column'    : 'Добавить колонку',
        'Display hints' : 'Показать подсказки',
        'Remove column' : 'Удалить колонку',
        Apply           : 'Применить',
        Learn           : 'Изучить',
        DownloadTrial   : 'Скачать пробную версию',
        upgradeGuide    : 'Руководство по обновлению',
        documentation   : 'Документация',
        tabJS           : 'Показать примеры JavaScript',
        tabReact        : 'Показать примеры React',
        tabVue          : 'Показать примеры Vue',
        tabAngular      : 'Показать примеры Angular'
    },

    Column : {
        Company : 'Компания',
        Name    : 'Имя'
    },

    Checkbox : {
        'Auto apply'  : 'Применять сразу',
        Automatically : 'Автоматически',
        runHints      : 'Запустить подсказку при запуске'
    },

    CodeEditor : {
        'Code editor'   : 'Редактор кода',
        'Download code' : 'Скачать код'
    },

    Combo : {
        Theme    : 'Выбрать тему',
        Language : 'Выбрать язык',
        Size     : 'Выбрать размер',
        jumpTo   : 'Перейти к'
    },

    Shared : {
        'Full size'      : 'Полный размер',
        'Locale changed' : 'Язык изменен',
        'Phone size'     : 'Экран смартфона',
        primaryColor     : 'Основной цвет'
    },

    Tooltip : {
        infoButton       : 'Показать редактор кода',
        codeButton       : 'Показать информацию, переключить тему или язык',
        hintCheck        : 'Автоматически показывать подсказки при загрузке примера',
        fullscreenButton : 'На весь экран',
        openInCodePen    : 'Открыть в CodePen',
        toggleLightDark  : 'Переключить светлый / тёмный режим'
    },

    Popup : {
        UsedClasses : 'Классы, используемые в этом демо'
    },

    TextField : {
        Filter : 'Фильтр'
    },

    FilterField : {
        typeToFilter : 'Введите для фильтрации'
    },

    SlideToggle : {
        newDemos : 'Новые и обновленные'
    }
};

export default LocaleHelper.publishLocale(locale);
