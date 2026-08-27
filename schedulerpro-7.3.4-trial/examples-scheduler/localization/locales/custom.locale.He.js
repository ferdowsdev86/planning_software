import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/He.js';

const locale = {

    localeName : 'He',
    localeDesc : 'עִברִית',
    localeCode : 'he',
    localeRtl  : true,

    App : {
        'Localization demo' : 'הדגמת לוקליזציה'
    },

    Button : {
        'Add column'    : 'הוסף עמודה',
        'Display hints' : 'הצג רמזים',
        'Remove column' : 'הסר עמודה',
        Apply           : 'החל',
        Learn           : 'למד',
        DownloadTrial   : 'הורד גרסת ניסיון',
        upgradeGuide    : 'מדריך שדרוג',
        documentation   : 'תיעוד',
        tabJS           : 'הצג דוגמאות JavaScript',
        tabReact        : 'הצג דוגמאות React',
        tabVue          : 'הצג דוגמאות Vue',
        tabAngular      : 'הצג דוגמאות Angular'
    },

    Column : {
        Company : 'חברה',
        Name    : 'שם'
    },

    Checkbox : {
        'Auto apply'  : 'החל אוטומטית',
        Automatically : 'אוטומטית',
        runHints      : 'הפעל זרימת רמזים בעת ההפעלה'
    },

    CodeEditor : {
        'Code editor'   : 'עורך קוד',
        'Download code' : 'הורד קוד'
    },

    Combo : {
        Theme    : 'ערכת נושא',
        Language : 'שפה',
        Size     : 'גודל',
        jumpTo   : 'עבור אל'
    },

    Shared : {
        'Full size'      : 'גודל מלא',
        'Locale changed' : 'השפה שונתה',
        'Phone size'     : 'גודל טלפון',
        primaryColor     : 'צבע ראשי'
    },

    Tooltip : {
        infoButton       : 'לחץ כדי להציג מידע ולהחליף ערכת נושא או שפה',
        codeButton       : 'לחץ כדי להציג את עורך הקוד המובנה',
        hintCheck        : 'סמן כדי להציג רמזים אוטומטית בעת טעינת הדוגמה',
        fullscreenButton : 'מסך מלא',
        openInCodePen    : 'פתח ב-CodePen',
        toggleLightDark  : 'החלף בין מצב בהיר / כהה'
    },

    Popup : {
        UsedClasses : 'מחלקות בשימוש בהדגמה זו'
    },

    TextField : {
        Filter : 'סינון'
    },

    FilterField : {
        typeToFilter : 'הקלד לסינון'
    },

    SlideToggle : {
        newDemos : 'חדש ומעודכן'
    }
};

export default LocaleHelper.publishLocale(locale);
