import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Ar.js';

const locale = {

    localeName : 'Ar',
    localeDesc : 'اللغة العربية',
    localeCode : 'ar',
    localeRtl  : true,

    App : {
        'Localization demo' : 'عرض التوطين'
    },

    Button : {
        'Add column'    : 'إضافة عمود',
        'Display hints' : 'عرض التلميحات',
        'Remove column' : 'إزالة عمود',
        Apply           : 'تطبيق',
        Learn           : 'تعلم',
        DownloadTrial   : 'تحميل النسخة التجريبية',
        upgradeGuide    : 'دليل الترقية',
        documentation   : 'التوثيق',
        tabJS           : 'عرض أمثلة JavaScript',
        tabReact        : 'عرض أمثلة React',
        tabVue          : 'عرض أمثلة Vue',
        tabAngular      : 'عرض أمثلة Angular'
    },

    Column : {
        Company : 'الشركة',
        Name    : 'الاسم'
    },

    Checkbox : {
        'Auto apply'  : 'تطبيق تلقائي',
        Automatically : 'تلقائيًا',
        runHints      : 'تشغيل تدفق التلميحات عند بدء التشغيل'
    },

    CodeEditor : {
        'Code editor'   : 'محرر الشيفرة',
        'Download code' : 'تنزيل الشيفرة'
    },

    Combo : {
        Theme    : 'السمة',
        Language : 'اللغة',
        Size     : 'الحجم',
        jumpTo   : 'الانتقال إلى'
    },

    Shared : {
        'Full size'      : 'الحجم الكامل',
        'Locale changed' : 'تم تغيير اللغة',
        'Phone size'     : 'حجم الهاتف',
        primaryColor     : 'اللون الأساسي'
    },

    Tooltip : {
        infoButton       : 'انقر لعرض المعلومات وتغيير السمة أو اللغة',
        codeButton       : 'انقر لعرض محرر الشيفرة المدمج',
        hintCheck        : 'حدد لعرض التلميحات تلقائيًا عند تحميل المثال',
        fullscreenButton : 'شاشة كاملة',
        openInCodePen    : 'افتح في CodePen',
        toggleLightDark  : 'تبديل وضع الضوء / الظلام'
    },

    Popup : {
        UsedClasses : 'الفئات المستخدمة في هذا العرض'
    },

    TextField : {
        Filter : 'تصفية'
    },

    FilterField : {
        typeToFilter : 'اكتب للتصفية'
    },

    SlideToggle : {
        newDemos : 'جديد ومحدث'
    }
};

export default LocaleHelper.publishLocale(locale);
