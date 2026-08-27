import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Pl.js';

const locale = {

    localeName : 'Pl',
    localeDesc : 'Polski',
    localeCode : 'pl',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demo lokalizacji'
    },

    Button : {
        'Add column'    : 'Dodaj kolumnę',
        'Display hints' : 'Wyświetl wskazówki',
        'Remove column' : 'Usuń kolumnę',
        Apply           : 'Zastosuj',
        Learn           : 'Ucz się',
        DownloadTrial   : 'Pobierz wersję próbną',
        upgradeGuide    : 'Przewodnik aktualizacji',
        documentation   : 'Dokumentacja',
        tabJS           : 'Pokaż przykłady JavaScript',
        tabReact        : 'Pokaż przykłady React',
        tabVue          : 'Pokaż przykłady Vue',
        tabAngular      : 'Pokaż przykłady Angular'
    },

    Column : {
        Company : 'Firma',
        Name    : 'Imię'
    },

    Checkbox : {
        'Auto apply'  : 'Automatyczne zastosowanie',
        Automatically : 'Automatycznie',
        runHints      : 'Uruchom przepływ wskazówek przy starcie'
    },

    CodeEditor : {
        'Code editor'   : 'Edytor kodu',
        'Download code' : 'Pobierz kod'
    },

    Combo : {
        Theme    : 'Motyw',
        Language : 'Język',
        Size     : 'Rozmiar',
        jumpTo   : 'Przejdź do'
    },

    Shared : {
        'Full size'      : 'Pełny rozmiar',
        'Locale changed' : 'Zmieniono ustawienia regionalne',
        'Phone size'     : 'Rozmiar telefonu',
        primaryColor     : 'Podstawowy kolor'
    },

    Tooltip : {
        infoButton       : 'Kliknij, aby wyświetlić informacje i zmienić motyw lub ustawienia regionalne',
        codeButton       : 'Kliknij, aby wyświetlić wbudowany edytor kodu',
        hintCheck        : 'Zaznacz, aby automatycznie wyświetlać wskazówki podczas ładowania przykładu',
        fullscreenButton : 'Pełny ekran',
        openInCodePen    : 'Otwórz w CodePen',
        toggleLightDark  : 'Przełącz tryb jasny / ciemny'
    },

    Popup : {
        UsedClasses : 'Klasy używane w tym demo'
    },

    TextField : {
        Filter : 'Filtr'
    },

    FilterField : {
        typeToFilter : 'Wpisz, aby filtrować'
    },

    SlideToggle : {
        newDemos : 'Nowe i zaktualizowane'
    }
};

export default LocaleHelper.publishLocale(locale);
