import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/FrFr.js';

const locale = {

    localeName : 'FrFr',
    localeDesc : 'Français (France)',
    localeCode : 'fr-FR',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Démonstration de localisation'
    },

    Button : {
        'Add column'    : 'Ajouter une colonne',
        'Display hints' : 'Afficher les indices',
        'Remove column' : 'Supprimer une colonne',
        Apply           : 'Appliquer',
        Learn           : 'Apprendre',
        DownloadTrial   : "Télécharger l'essai",
        upgradeGuide    : 'Guide de mise à niveau',
        documentation   : 'Documentation',
        tabJS           : 'Afficher des exemples JavaScript',
        tabReact        : 'Afficher des exemples React',
        tabVue          : 'Afficher des exemples Vue',
        tabAngular      : 'Afficher des exemples Angular'
    },

    Column : {
        Company : 'Entreprise',
        Name    : 'Nom'
    },

    Checkbox : {
        'Auto apply'  : 'Application automatique',
        Automatically : 'Automatiquement',
        runHints      : "Exécuter le flux d'indices au démarrage"
    },

    CodeEditor : {
        'Code editor'   : 'Éditeur de code',
        'Download code' : 'Télécharger le code'
    },

    Combo : {
        Theme    : 'Thème',
        Language : 'Langue',
        Size     : 'Taille',
        jumpTo   : 'Aller à'
    },

    Shared : {
        'Full size'      : 'Taille complète',
        'Locale changed' : 'Paramètres régionaux modifiés',
        'Phone size'     : 'Taille téléphone',
        primaryColor     : 'Couleur principale'
    },

    Tooltip : {
        infoButton       : 'Cliquez pour afficher les infos et changer le thème ou la langue',
        codeButton       : "Cliquez pour afficher l'éditeur de code intégré",
        hintCheck        : "Cochez pour afficher automatiquement les indices lors du chargement de l'exemple",
        fullscreenButton : 'Plein écran',
        openInCodePen    : 'Ouvrir dans CodePen',
        toggleLightDark  : 'Basculer entre le mode clair et sombre'
    },

    Popup : {
        UsedClasses : 'Classes utilisées dans cette démo'
    },

    TextField : {
        Filter : 'Filtrer'
    },

    FilterField : {
        typeToFilter : 'Tapez pour filtrer'
    },

    SlideToggle : {
        newDemos : 'Nouveaux et mis à jour'
    }
};

export default LocaleHelper.publishLocale(locale);
