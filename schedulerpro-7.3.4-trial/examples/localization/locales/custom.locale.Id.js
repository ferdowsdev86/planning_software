import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Id.js';

const locale = {

    localeName : 'Id',
    localeDesc : 'Bahasa Indonesia',
    localeCode : 'id',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demo Lokalisasi'
    },

    Button : {
        'Add column'    : 'Tambahkan kolom',
        'Display hints' : 'Tampilkan petunjuk',
        'Remove column' : 'Hapus kolom',
        Apply           : 'Terapkan',
        Learn           : 'Belajar',
        DownloadTrial   : 'Unduh Uji Coba',
        upgradeGuide    : 'Panduan Peningkatan',
        documentation   : 'Dokumentasi',
        tabJS           : 'Tampilkan contoh JavaScript',
        tabReact        : 'Tampilkan contoh React',
        tabVue          : 'Tampilkan contoh Vue',
        tabAngular      : 'Tampilkan contoh Angular'
    },

    Column : {
        Company : 'Perusahaan',
        Name    : 'Nama'
    },

    Checkbox : {
        'Auto apply'  : 'Terapkan otomatis',
        Automatically : 'Otomatis',
        runHints      : 'Jalankan alur petunjuk saat memulai'
    },

    CodeEditor : {
        'Code editor'   : 'Editor kode',
        'Download code' : 'Unduh kode'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Bahasa',
        Size     : 'Ukuran',
        jumpTo   : 'Lompat ke'
    },

    Shared : {
        'Full size'      : 'Ukuran penuh',
        'Locale changed' : 'Bahasa diubah',
        'Phone size'     : 'Ukuran ponsel',
        primaryColor     : 'Warna utama'
    },

    Tooltip : {
        infoButton       : 'Klik untuk menampilkan info dan mengganti tema atau bahasa',
        codeButton       : 'Klik untuk menampilkan editor kode bawaan',
        hintCheck        : 'Centang untuk menampilkan petunjuk secara otomatis saat memuat contoh',
        fullscreenButton : 'Layar penuh',
        openInCodePen    : 'Buka di CodePen',
        toggleLightDark  : 'Beralih mode terang / gelap'
    },

    Popup : {
        UsedClasses : 'Kelas yang digunakan dalam demo ini'
    },

    TextField : {
        Filter : 'Saring'
    },

    FilterField : {
        typeToFilter : 'Ketik untuk menyaring'
    },

    SlideToggle : {
        newDemos : 'Baru dan diperbarui'
    }
};

export default LocaleHelper.publishLocale(locale);
