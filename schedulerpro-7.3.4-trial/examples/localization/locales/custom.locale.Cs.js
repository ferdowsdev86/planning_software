import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Cs.js';

const locale = {

    localeName : 'Cs',
    localeDesc : 'Česky',
    localeCode : 'cs',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Ukázka lokalizace'
    },

    Button : {
        'Add column'    : 'Přidat sloupec',
        'Display hints' : 'Zobrazit nápovědy',
        'Remove column' : 'Odebrat sloupec',
        Apply           : 'Použít',
        Learn           : 'Učit se',
        DownloadTrial   : 'Stáhnout zkušební verzi',
        upgradeGuide    : 'Průvodce upgradem',
        documentation   : 'Dokumentace',
        tabJS           : 'Zobrazit příklady JavaScriptu',
        tabReact        : 'Zobrazit příklady Reactu',
        tabVue          : 'Zobrazit příklady Vue',
        tabAngular      : 'Zobrazit příklady Angularu'
    },

    Column : {
        Company : 'Společnost',
        Name    : 'Jméno'
    },

    Checkbox : {
        'Auto apply'  : 'Automaticky použít',
        Automatically : 'Automaticky',
        runHints      : 'Spustit tok nápovědy při spuštění'
    },

    CodeEditor : {
        'Code editor'   : 'Editor kódu',
        'Download code' : 'Stáhnout kód'
    },

    Combo : {
        Theme    : 'Téma',
        Language : 'Jazyk',
        Size     : 'Velikost',
        jumpTo   : 'Přejít na'
    },

    Shared : {
        'Full size'      : 'Plná velikost',
        'Locale changed' : 'Jazyková verze změněna',
        'Phone size'     : 'Velikost telefonu',
        primaryColor     : 'Primární barva'
    },

    Tooltip : {
        infoButton       : 'Klikněte pro zobrazení informací a změnu tématu nebo jazyka',
        codeButton       : 'Klikněte pro zobrazení vestavěného editoru kódu',
        hintCheck        : 'Zaškrtněte pro automatické zobrazení nápověd při načítání příkladu',
        fullscreenButton : 'Celá obrazovka',
        openInCodePen    : 'Otevřít v CodePen',
        toggleLightDark  : 'Přepnout světlý / tmavý režim'
    },

    Popup : {
        UsedClasses : 'Třídy použité v této ukázce'
    },

    TextField : {
        Filter : 'Filtr'
    },

    FilterField : {
        typeToFilter : 'Napište pro filtrování'
    },

    SlideToggle : {
        newDemos : 'Nové a aktualizované'
    }
};

export default LocaleHelper.publishLocale(locale);
