import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Ja.js';

const locale = {

    localeName : 'Ja',
    localeDesc : '日本語',
    localeCode : 'ja',
    localeRtl  : false,

    App : {
        'Localization demo' : 'ローカリゼーションデモ'
    },

    Button : {
        'Add column'    : '列を追加',
        'Display hints' : 'ヒントを表示',
        'Remove column' : '列を削除',
        Apply           : '適用',
        Learn           : '学ぶ',
        DownloadTrial   : 'トライアルをダウンロード',
        upgradeGuide    : 'アップグレードガイド',
        documentation   : 'ドキュメント',
        tabJS           : 'JavaScriptの例を表示',
        tabReact        : 'Reactの例を表示',
        tabVue          : 'Vueの例を表示',
        tabAngular      : 'Angularの例を表示'
    },

    Column : {
        Company : '会社',
        Name    : '名前'
    },

    Checkbox : {
        'Auto apply'  : '自動適用',
        Automatically : '自動的に',
        runHints      : '起動時にヒントフローを実行'
    },

    CodeEditor : {
        'Code editor'   : 'コードエディタ',
        'Download code' : 'コードをダウンロード'
    },

    Combo : {
        Theme    : 'テーマ',
        Language : '言語',
        Size     : 'サイズ',
        jumpTo   : 'ジャンプ先'
    },

    Shared : {
        'Full size'      : 'フルサイズ',
        'Locale changed' : 'ロケールが変更されました',
        'Phone size'     : '電話サイズ',
        primaryColor     : '基本色'
    },

    Tooltip : {
        infoButton       : '情報を表示し、テーマまたはロケールを切り替えるにはクリック',
        codeButton       : '組み込みコードエディタを表示するにはクリック',
        hintCheck        : '例を読み込むときにヒントを自動的に表示するにはチェック',
        fullscreenButton : '全画面',
        openInCodePen    : 'CodePenで開く',
        toggleLightDark  : 'ライトモード / ダークモードを切り替える'
    },

    Popup : {
        UsedClasses : 'このデモで使用されるクラス'
    },

    TextField : {
        Filter : 'フィルター'
    },

    FilterField : {
        typeToFilter : 'フィルターするために入力'
    },

    SlideToggle : {
        newDemos : '新規および更新済み'
    }
};

export default LocaleHelper.publishLocale(locale);
