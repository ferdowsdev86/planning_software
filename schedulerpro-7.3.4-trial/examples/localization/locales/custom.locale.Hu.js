import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Hu.js';

const locale = {

    localeName : 'Hu',
    localeDesc : 'Magyar',
    localeCode : 'hu',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalizációs bemutató'
    },

    Button : {
        'Add column'    : 'Oszlop hozzáadása',
        'Display hints' : 'Tippek megjelenítése',
        'Remove column' : 'Oszlop eltávolítása',
        Apply           : 'Alkalmaz',
        Learn           : 'Tanul',
        DownloadTrial   : 'Próbaverzió letöltése',
        upgradeGuide    : 'Frissítési útmutató',
        documentation   : 'Dokumentáció',
        tabJS           : 'JavaScript példák megjelenítése',
        tabReact        : 'React példák megjelenítése',
        tabVue          : 'Vue példák megjelenítése',
        tabAngular      : 'Angular példák megjelenítése'
    },

    Column : {
        Company : 'Cég',
        Name    : 'Név'
    },

    Checkbox : {
        'Auto apply'  : 'Automatikus alkalmazás',
        Automatically : 'Automatikusan',
        runHints      : 'Futtassa a tippfolyamatot indításkor'
    },

    CodeEditor : {
        'Code editor'   : 'Kódszerkesztő',
        'Download code' : 'Kód letöltése'
    },

    Combo : {
        Theme    : 'Téma',
        Language : 'Nyelv',
        Size     : 'Méret',
        jumpTo   : 'Ugrás ide'
    },

    Shared : {
        'Full size'      : 'Teljes méret',
        'Locale changed' : 'Helyi beállítás megváltozott',
        'Phone size'     : 'Telefon méret',
        primaryColor     : 'Elsődleges szín'
    },

    Tooltip : {
        infoButton       : 'Kattintson az információ megjelenítéséhez és a téma vagy a helyi beállítás váltásához',
        codeButton       : 'Kattintson a beépített kódszerkesztő megjelenítéséhez',
        hintCheck        : 'Jelölje be, hogy automatikusan megjelenjenek a tippek a példa betöltésekor',
        fullscreenButton : 'Teljes képernyő',
        openInCodePen    : 'Megnyitás a CodePenben',
        toggleLightDark  : 'Váltás világos / sötét mód között'
    },

    Popup : {
        UsedClasses : 'Az ebben a demóban használt osztályok'
    },

    TextField : {
        Filter : 'Szűrő'
    },

    FilterField : {
        typeToFilter : 'Szűréshez írjon be szöveget'
    },

    SlideToggle : {
        newDemos : 'Új és frissített'
    }
};

export default LocaleHelper.publishLocale(locale);
