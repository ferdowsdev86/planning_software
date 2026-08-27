import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/SrRs.js';

const locale = {

    localeName : 'SrRs',
    localeDesc : 'Српски (ћирилица)',
    localeCode : 'sr-RS',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Демонстрација локализације'
    },

    Button : {
        'Add column'    : 'Додај колону',
        'Display hints' : 'Прикажи савете',
        'Remove column' : 'Уклони колону',
        Apply           : 'Примени',
        Learn           : 'Учи',
        DownloadTrial   : 'Преузми пробну верзију',
        upgradeGuide    : 'Водич за надоградњу',
        documentation   : 'Документација',
        tabJS           : 'Прикажи примере за JavaScript',
        tabReact        : 'Прикажи примере за React',
        tabVue          : 'Прикажи примере за Vue',
        tabAngular      : 'Прикажи примере за Angular'
    },

    Column : {
        Company : 'Компанија',
        Name    : 'Име'
    },

    Checkbox : {
        'Auto apply'  : 'Аутоматска примена',
        Automatically : 'Аутоматски',
        runHints      : 'Покрени ток савета при покретању'
    },

    CodeEditor : {
        'Code editor'   : 'Уређивач кода',
        'Download code' : 'Преузми код'
    },

    Combo : {
        Theme    : 'Тема',
        Language : 'Језик',
        Size     : 'Величина',
        jumpTo   : 'Прескочи на'
    },

    Shared : {
        'Full size'      : 'Пуна величина',
        'Locale changed' : 'Локал је промењен',
        'Phone size'     : 'Величина телефона',
        primaryColor     : 'Примарна боја'
    },

    Tooltip : {
        infoButton       : 'Кликни да прикажеш информације и промениш тему или локал',
        codeButton       : 'Кликни да прикажеш уграђени уређивач кода',
        hintCheck        : 'Означи да аутоматски прикажеш савете при учитавању примера',
        fullscreenButton : 'Цео екран',
        openInCodePen    : 'Отвори у CodePen',
        toggleLightDark  : 'Пребаци режим светло / тамно'
    },

    Popup : {
        UsedClasses : 'Класе коришћене у овом демо-у'
    },

    TextField : {
        Filter : 'Филтер'
    },

    FilterField : {
        typeToFilter : 'Унесите за филтрирање'
    },

    SlideToggle : {
        newDemos : 'Нови и ажурирани'
    }
};

export default LocaleHelper.publishLocale(locale);
