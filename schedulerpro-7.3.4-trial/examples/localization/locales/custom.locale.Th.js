import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Th.js';

const locale = {

    localeName : 'Th',
    localeDesc : 'ไทย',
    localeCode : 'th',
    localeRtl  : false,

    App : {
        'Localization demo' : 'การสาธิตการแปลภาษา'
    },

    Button : {
        'Add column'    : 'เพิ่มคอลัมน์',
        'Display hints' : 'แสดงคำแนะนำ',
        'Remove column' : 'ลบคอลัมน์',
        Apply           : 'ใช้',
        Learn           : 'เรียนรู้',
        DownloadTrial   : 'ดาวน์โหลดรุ่นทดลอง',
        upgradeGuide    : 'คู่มือการอัปเกรด',
        documentation   : 'เอกสารประกอบ',
        tabJS           : 'แสดงตัวอย่าง JavaScript',
        tabReact        : 'แสดงตัวอย่าง React',
        tabVue          : 'แสดงตัวอย่าง Vue',
        tabAngular      : 'แสดงตัวอย่าง Angular'
    },

    Column : {
        Company : 'บริษัท',
        Name    : 'ชื่อ'
    },

    Checkbox : {
        'Auto apply'  : 'ใช้โดยอัตโนมัติ',
        Automatically : 'อัตโนมัติ',
        runHints      : 'เรียกใช้กระบวนการคำแนะนำเมื่อเริ่มต้น'
    },

    CodeEditor : {
        'Code editor'   : 'ตัวแก้ไขโค้ด',
        'Download code' : 'ดาวน์โหลดโค้ด'
    },

    Combo : {
        Theme    : 'ธีม',
        Language : 'ภาษา',
        Size     : 'ขนาด',
        jumpTo   : 'ไปยัง'
    },

    Shared : {
        'Full size'      : 'ขนาดเต็ม',
        'Locale changed' : 'เปลี่ยนภาษาแล้ว',
        'Phone size'     : 'ขนาดโทรศัพท์',
        primaryColor     : 'สีหลัก'
    },

    Tooltip : {
        infoButton       : 'คลิกเพื่อแสดงข้อมูลและเปลี่ยนธีมหรือภาษา',
        codeButton       : 'คลิกเพื่อแสดงตัวแก้ไขโค้ดในตัว',
        hintCheck        : 'เลือกเพื่อแสดงคำแนะนำโดยอัตโนมัติเมื่อโหลดตัวอย่าง',
        fullscreenButton : 'เต็มจอ',
        openInCodePen    : 'เปิดใน CodePen',
        toggleLightDark  : 'สลับโหมดสว่าง / มืด'
    },

    Popup : {
        UsedClasses : 'คลาสที่ใช้ในเดโมนี้'
    },

    TextField : {
        Filter : 'กรอง'
    },

    FilterField : {
        typeToFilter : 'พิมพ์เพื่อกรอง'
    },

    SlideToggle : {
        newDemos : 'ใหม่และอัปเดต'
    }
};

export default LocaleHelper.publishLocale(locale);
