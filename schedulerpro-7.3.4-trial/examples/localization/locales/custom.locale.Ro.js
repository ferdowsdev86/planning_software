import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Ro.js';

const locale = {

    localeName : 'Ro',
    localeDesc : 'Română',
    localeCode : 'ro',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demonstrație de localizare'
    },

    Button : {
        'Add column'    : 'Adaugă coloană',
        'Display hints' : 'Afișează sugestii',
        'Remove column' : 'Elimină coloană',
        Apply           : 'Aplică',
        Learn           : 'Învățați',
        DownloadTrial   : 'Descarcă versiunea de încercare',
        upgradeGuide    : 'Ghid de actualizare',
        documentation   : 'Documentație',
        tabJS           : 'Afișează exemple JavaScript',
        tabReact        : 'Afișează exemple React',
        tabVue          : 'Afișează exemple Vue',
        tabAngular      : 'Afișează exemple Angular'
    },

    Column : {
        Company : 'Companie',
        Name    : 'Nume'
    },

    Checkbox : {
        'Auto apply'  : 'Aplicare automată',
        Automatically : 'Automat',
        runHints      : 'Rulați fluxul de sugestii la pornire'
    },

    CodeEditor : {
        'Code editor'   : 'Editor de cod',
        'Download code' : 'Descarcă cod'
    },

    Combo : {
        Theme    : 'Temă',
        Language : 'Limbă',
        Size     : 'Dimensiune',
        jumpTo   : 'Salt la'
    },

    Shared : {
        'Full size'      : 'Dimensiune completă',
        'Locale changed' : 'Limba a fost schimbată',
        'Phone size'     : 'Dimensiune telefon',
        primaryColor     : 'Culoare primară'
    },

    Tooltip : {
        infoButton       : 'Click pentru a afișa informații și a schimba tema sau limba',
        codeButton       : 'Click pentru a afișa editorul de cod încorporat',
        hintCheck        : 'Bifați pentru a afișa automat sugestiile la încărcarea exemplului',
        fullscreenButton : 'Ecran complet',
        openInCodePen    : 'Deschide în CodePen',
        toggleLightDark  : 'Comută între modul luminos / întunecat'
    },

    Popup : {
        UsedClasses : 'Clase utilizate în această demonstrație'
    },

    TextField : {
        Filter : 'Filtru'
    },

    FilterField : {
        typeToFilter : 'Tastează pentru a filtra'
    },

    SlideToggle : {
        newDemos : 'Noi și actualizate'
    }
};

export default LocaleHelper.publishLocale(locale);
