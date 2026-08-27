import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Ms.js';

const locale = {

    localeName : 'Ms',
    localeDesc : 'Melayu',
    localeCode : 'ms',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demo Penyetempatan'
    },

    Button : {
        'Add column'    : 'Tambah lajur',
        'Display hints' : 'Papar petunjuk',
        'Remove column' : 'Buang lajur',
        Apply           : 'Guna',
        Learn           : 'Belajar',
        DownloadTrial   : 'Muat Turun Percubaan',
        upgradeGuide    : 'Panduan Peningkatan',
        documentation   : 'Dokumentasi',
        tabJS           : 'Tunjukkan contoh JavaScript',
        tabReact        : 'Tunjukkan contoh React',
        tabVue          : 'Tunjukkan contoh Vue',
        tabAngular      : 'Tunjukkan contoh Angular'
    },

    Column : {
        Company : 'Syarikat',
        Name    : 'Nama'
    },

    Checkbox : {
        'Auto apply'  : 'Guna automatik',
        Automatically : 'Secara automatik',
        runHints      : 'Jalankan aliran petunjuk semasa permulaan'
    },

    CodeEditor : {
        'Code editor'   : 'Penyunting kod',
        'Download code' : 'Muat turun kod'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Bahasa',
        Size     : 'Saiz',
        jumpTo   : 'Lompat ke'
    },

    Shared : {
        'Full size'      : 'Saiz penuh',
        'Locale changed' : 'Lokasi ditukar',
        'Phone size'     : 'Saiz telefon',
        primaryColor     : 'Warna utama'
    },

    Tooltip : {
        infoButton       : 'Klik untuk menunjukkan info dan menukar tema atau lokasi',
        codeButton       : 'Klik untuk menunjukkan editor kod terbina dalam',
        hintCheck        : 'Tandakan untuk memaparkan petunjuk secara automatik apabila memuatkan contoh',
        fullscreenButton : 'Skrin penuh',
        openInCodePen    : 'Buka di CodePen',
        toggleLightDark  : 'Tukar mod cerah / gelap'
    },

    Popup : {
        UsedClasses : 'Kelas yang digunakan dalam demo ini'
    },

    TextField : {
        Filter : 'Tapis'
    },

    FilterField : {
        typeToFilter : 'Taip untuk menapis'
    },

    SlideToggle : {
        newDemos : 'Baru dan dikemas kini'
    }
};

export default LocaleHelper.publishLocale(locale);
