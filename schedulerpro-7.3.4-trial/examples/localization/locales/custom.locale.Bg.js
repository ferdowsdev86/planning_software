import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Bg.js';

const locale = {

    localeName : 'Bg',
    localeDesc : 'Български',
    localeCode : 'bg',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Демонстрация на локализация'
    },

    Button : {
        'Add column'    : 'Добавяне на колона',
        'Display hints' : 'Показване на подсказки',
        'Remove column' : 'Премахване на колона',
        Apply           : 'Приложи',
        Learn           : 'Научи',
        DownloadTrial   : 'Изтегли пробна версия',
        upgradeGuide    : 'Ръководство за надграждане',
        documentation   : 'Документация',
        tabJS           : 'Показване на примери за JavaScript',
        tabReact        : 'Показване на примери за React',
        tabVue          : 'Показване на примери за Vue',
        tabAngular      : 'Показване на примери за Angular'
    },

    Column : {
        Company : 'Компания',
        Name    : 'Име'
    },

    Checkbox : {
        'Auto apply'  : 'Автоматично прилагане',
        Automatically : 'Автоматично',
        runHints      : 'Стартиране на потока с подсказки при стартиране'
    },

    CodeEditor : {
        'Code editor'   : 'Редактор на код',
        'Download code' : 'Изтегляне на код'
    },

    Combo : {
        Theme    : 'Тема',
        Language : 'Език',
        Size     : 'Размер',
        jumpTo   : 'Прескачане към'
    },

    Shared : {
        'Full size'      : 'Пълен размер',
        'Locale changed' : 'Локалът е променен',
        'Phone size'     : 'Размер за телефон',
        primaryColor     : 'Основен цвят'
    },

    Tooltip : {
        infoButton       : 'Кликнете, за да покажете информация и да смените темата или локала',
        codeButton       : 'Кликнете, за да покажете вградения редактор на код',
        hintCheck        : 'Отметнете, за да показвате автоматично подсказки при зареждане на примера',
        fullscreenButton : 'Цял екран',
        openInCodePen    : 'Отвори в CodePen',
        toggleLightDark  : 'Превключване на светъл / тъмен режим'
    },

    Popup : {
        UsedClasses : 'Класове, използвани в тази демонстрация'
    },

    TextField : {
        Filter : 'Филтър'
    },

    FilterField : {
        typeToFilter : 'Въведете за филтриране'
    },

    SlideToggle : {
        newDemos : 'Нови и актуализирани'
    }
};

export default LocaleHelper.publishLocale(locale);
