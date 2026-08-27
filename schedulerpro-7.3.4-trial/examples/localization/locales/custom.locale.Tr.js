import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Tr.js';

const locale = {

    localeName : 'Tr',
    localeDesc : 'Türkçe',
    localeCode : 'tr',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Yerelleştirme demosu'
    },

    Button : {
        'Add column'    : 'Sütun ekle',
        'Display hints' : 'İpuçlarını göster',
        'Remove column' : 'Sütun kaldır',
        Apply           : 'Uygula',
        Learn           : 'Öğren',
        DownloadTrial   : 'Deneme Sürümünü İndir',
        upgradeGuide    : 'Yükseltme Kılavuzu',
        documentation   : 'Belgeler',
        tabJS           : 'JavaScript örneklerini göster',
        tabReact        : 'React örneklerini göster',
        tabVue          : 'Vue örneklerini göster',
        tabAngular      : 'Angular örneklerini göster'
    },

    Column : {
        Company : 'Şirket',
        Name    : 'İsim'
    },

    Checkbox : {
        'Auto apply'  : 'Otomatik uygula',
        Automatically : 'Otomatik olarak',
        runHints      : 'Başlangıçta ipucu akışını çalıştır'
    },

    CodeEditor : {
        'Code editor'   : 'Kod düzenleyici',
        'Download code' : 'Kodu indir'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Dil',
        Size     : 'Boyut',
        jumpTo   : 'Git'
    },

    Shared : {
        'Full size'      : 'Tam boyut',
        'Locale changed' : 'Yerel ayar değiştirildi',
        'Phone size'     : 'Telefon boyutu',
        primaryColor     : 'Birincil renk'
    },

    Tooltip : {
        infoButton       : 'Bilgiyi göstermek ve temayı veya yerel ayarı değiştirmek için tıklayın',
        codeButton       : 'Yerleşik kod düzenleyiciyi göstermek için tıklayın',
        hintCheck        : 'Örneği yüklerken ipuçlarını otomatik olarak göstermek için işaretleyin',
        fullscreenButton : 'Tam ekran',
        openInCodePen    : "CodePen'de Aç",
        toggleLightDark  : 'Açık / koyu modu değiştir'
    },

    Popup : {
        UsedClasses : 'Bu demoda kullanılan sınıflar'
    },

    TextField : {
        Filter : 'Filtre'
    },

    FilterField : {
        typeToFilter : 'Filtrelemek için yazın'
    },

    SlideToggle : {
        newDemos : 'Yeni ve güncellenmiş'
    }
};

export default LocaleHelper.publishLocale(locale);
