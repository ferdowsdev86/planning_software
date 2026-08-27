import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/ZhCn.js';

const locale = {

    localeName : 'ZhCn',
    localeDesc : '中文（中国）',
    localeCode : 'zh-CN',
    localeRtl  : false,

    App : {
        'Localization demo' : '本地化演示'
    },

    Button : {
        'Add column'    : '添加列',
        'Display hints' : '显示提示',
        'Remove column' : '移除列',
        Apply           : '应用',
        Learn           : '学习',
        DownloadTrial   : '下载试用',
        upgradeGuide    : '升级指南',
        documentation   : '文档',
        tabJS           : '显示 JavaScript 示例',
        tabReact        : '显示 React 示例',
        tabVue          : '显示 Vue 示例',
        tabAngular      : '显示 Angular 示例'
    },

    Column : {
        Company : '公司',
        Name    : '姓名'
    },

    Checkbox : {
        'Auto apply'  : '自动应用',
        Automatically : '自动',
        runHints      : '启动时运行提示流程'
    },

    CodeEditor : {
        'Code editor'   : '代码编辑器',
        'Download code' : '下载代码'
    },

    Combo : {
        Theme    : '主题',
        Language : '语言',
        Size     : '大小',
        jumpTo   : '跳转到'
    },

    Shared : {
        'Full size'      : '全尺寸',
        'Locale changed' : '语言环境已更改',
        'Phone size'     : '手机尺寸',
        primaryColor     : '主色'
    },

    Tooltip : {
        infoButton       : '点击以显示信息并切换主题或语言环境',
        codeButton       : '点击以显示内置代码编辑器',
        hintCheck        : '选中以在加载示例时自动显示提示',
        fullscreenButton : '全屏',
        openInCodePen    : '在 CodePen 中打开',
        toggleLightDark  : '切换明亮/暗黑模式'
    },

    Popup : {
        UsedClasses : '此演示中使用的类'
    },

    TextField : {
        Filter : '过滤'
    },

    FilterField : {
        typeToFilter : '输入以筛选'
    },

    SlideToggle : {
        newDemos : '新的和更新的'
    }
};

export default LocaleHelper.publishLocale(locale);
