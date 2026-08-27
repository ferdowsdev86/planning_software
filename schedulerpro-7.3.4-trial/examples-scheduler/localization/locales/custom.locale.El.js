import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/Scheduler/localization/El.js';

const locale = {

    localeName : 'El',
    localeDesc : 'Ελληνικά',
    localeCode : 'el',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Επίδειξη τοπικοποίησης'
    },

    Button : {
        'Add column'    : 'Προσθήκη στήλης',
        'Display hints' : 'Εμφάνιση υποδείξεων',
        'Remove column' : 'Αφαίρεση στήλης',
        Apply           : 'Εφαρμογή',
        Learn           : 'Μάθετε',
        DownloadTrial   : 'Λήψη δοκιμής',
        upgradeGuide    : 'Οδηγός Αναβάθμισης',
        documentation   : 'Τεκμηρίωση',
        tabJS           : 'Εμφάνιση παραδειγμάτων JavaScript',
        tabReact        : 'Εμφάνιση παραδειγμάτων React',
        tabVue          : 'Εμφάνιση παραδειγμάτων Vue',
        tabAngular      : 'Εμφάνιση παραδειγμάτων Angular'
    },

    Column : {
        Company : 'Εταιρεία',
        Name    : 'Όνομα'
    },

    Checkbox : {
        'Auto apply'  : 'Αυτόματη εφαρμογή',
        Automatically : 'Αυτόματα',
        runHints      : 'Εκτέλεση ροής υποδείξεων κατά την εκκίνηση'
    },

    CodeEditor : {
        'Code editor'   : 'Επεξεργαστής κώδικα',
        'Download code' : 'Λήψη κώδικα'
    },

    Combo : {
        Theme    : 'Θέμα',
        Language : 'Γλώσσα',
        Size     : 'Μέγεθος',
        jumpTo   : 'Μετάβαση σε'
    },

    Shared : {
        'Full size'      : 'Πλήρες μέγεθος',
        'Locale changed' : 'Η τοπική ρύθμιση άλλαξε',
        'Phone size'     : 'Μέγεθος τηλεφώνου',
        primaryColor     : 'Κύριο χρώμα'
    },

    Tooltip : {
        infoButton       : 'Κάντε κλικ για να εμφανίσετε πληροφορίες και να αλλάξετε θέμα ή τοπική ρύθμιση',
        codeButton       : 'Κάντε κλικ για να εμφανίσετε τον ενσωματωμένο επεξεργαστή κώδικα',
        hintCheck        : 'Επιλέξτε για να εμφανίζονται αυτόματα υποδείξεις κατά τη φόρτωση του παραδείγματος',
        fullscreenButton : 'Πλήρης οθόνη',
        openInCodePen    : 'Άνοιγμα στο CodePen',
        toggleLightDark  : 'Εναλλαγή λειτουργίας φωτεινού / σκοτεινού θέματος'
    },

    Popup : {
        UsedClasses : 'Κλάσεις που χρησιμοποιούνται σε αυτή την επίδειξη'
    },

    TextField : {
        Filter : 'Φίλτρο'
    },

    FilterField : {
        typeToFilter : 'Πληκτρολογήστε για φιλτράρισμα'
    },

    SlideToggle : {
        newDemos : 'Νέα και ενημερωμένα'
    }
};

export default LocaleHelper.publishLocale(locale);
