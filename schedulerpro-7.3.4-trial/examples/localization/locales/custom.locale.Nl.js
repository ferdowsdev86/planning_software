import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Nl.js';

const locale = {

    localeName : 'Nl',
    localeDesc : 'Nederlands',
    localeCode : 'nl',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Lokalisatiedemo'
    },

    Button : {
        'Add column'    : 'Kolom toevoegen',
        'Display hints' : 'Hints weergeven',
        'Remove column' : 'Kolom verwijderen',
        Apply           : 'Еoepassen',
        Learn           : 'Leren',
        DownloadTrial   : 'Proefversie downloaden',
        upgradeGuide    : 'Upgradegids',
        documentation   : 'Documentatie',
        tabJS           : 'Toon JavaScript-voorbeelden',
        tabReact        : 'Toon React-voorbeelden',
        tabVue          : 'Toon Vue-voorbeelden',
        tabAngular      : 'Toon Angular-voorbeelden'
    },

    Column : {
        Company : 'Bedrijf',
        Name    : 'Naam'
    },

    Checkbox : {
        'Auto apply'  : 'Automatisch toepassen',
        Automatically : 'Automatisch',
        runHints      : 'Voer hintstroom uit bij opstarten'
    },

    CodeEditor : {
        'Code editor'   : 'Code editor',
        'Download code' : 'Download code'
    },

    Combo : {
        Theme    : 'Selecteer thema',
        Language : 'Selecteer landinstelling',
        Size     : 'Selecteer grootte',
        jumpTo   : 'Spring naar'
    },

    Shared : {
        'Full size'      : 'Volledige grootte',
        'Locale changed' : 'Taal is veranderd',
        'Phone size'     : 'Grootte telefoon',
        primaryColor     : 'Primaire kleur'
    },

    Tooltip : {
        infoButton       : 'Klik om informatie weer te geven en van thema of land te wisselen',
        codeButton       : 'Klik om de ingebouwde code-editor te tonen',
        hintCheck        : 'Vink deze optie aan om automatisch hints weer te geven bij het laden van het voorbeeld',
        fullscreenButton : 'Volledig scherm',
        openInCodePen    : 'Åpne i CodePen',
        toggleLightDark  : 'Schakel licht / donker modus'
    },

    Popup : {
        UsedClasses : 'Klassen gebruikt in deze demo'
    },

    TextField : {
        Filter : 'Filter'
    },

    FilterField : {
        typeToFilter : 'Typ om te filteren'
    },

    SlideToggle : {
        newDemos : 'Nieuw en bijgewerkt'
    }
};

export default LocaleHelper.publishLocale(locale);
