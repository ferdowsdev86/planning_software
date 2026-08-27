import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/Sk.js';

const locale = {

    localeName : 'Sk',
    localeDesc : 'Slovenský',
    localeCode : 'sk',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demonštrácia lokalizácie'
    },

    Button : {
        'Add column'    : 'Pridať stĺpec',
        'Display hints' : 'Zobraziť tipy',
        'Remove column' : 'Odstrániť stĺpec',
        Apply           : 'Použiť',
        Learn           : 'Uč sa',
        DownloadTrial   : 'Stiahnuť skúšobnú verziu',
        upgradeGuide    : 'Sprievodca aktualizáciou',
        documentation   : 'Dokumentácia',
        tabJS           : 'Zobraziť príklady JavaScriptu',
        tabReact        : 'Zobraziť príklady Reactu',
        tabVue          : 'Zobraziť príklady Vue',
        tabAngular      : 'Zobraziť príklady Angularu'
    },

    Column : {
        Company : 'Spoločnosť',
        Name    : 'Meno'
    },

    Checkbox : {
        'Auto apply'  : 'Automaticky použiť',
        Automatically : 'Automaticky',
        runHints      : 'Spustiť tok nápovedy pri spustení'
    },

    CodeEditor : {
        'Code editor'   : 'Editor kódu',
        'Download code' : 'Stiahnuť kód'
    },

    Combo : {
        Theme    : 'Téma',
        Language : 'Jazyk',
        Size     : 'Veľkosť',
        jumpTo   : 'Preskočiť na'
    },

    Shared : {
        'Full size'      : 'Plná veľkosť',
        'Locale changed' : 'Jazykové nastavenie zmenené',
        'Phone size'     : 'Veľkosť telefónu',
        primaryColor     : 'Primárna farba'
    },

    Tooltip : {
        infoButton       : 'Kliknite pre zobrazenie informácií a zmenu témy alebo jazyka',
        codeButton       : 'Kliknite pre zobrazenie vstavaného editora kódu',
        hintCheck        : 'Zaškrtnite pre automatické zobrazenie tipov pri načítaní príkladu',
        fullscreenButton : 'Celá obrazovka',
        openInCodePen    : 'Otvoriť v CodePen',
        toggleLightDark  : 'Prepnúť svetlý / tmavý režim'
    },

    Popup : {
        UsedClasses : 'Triedy použité v tejto ukážke'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Napíšte na filtrovanie'
    },

    SlideToggle : {
        newDemos : 'Nové a aktualizované'
    }
};

export default LocaleHelper.publishLocale(locale);
