import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import '../../../lib/SchedulerPro/localization/Pt.js';

const locale = {

    localeName : 'Pt',
    localeDesc : 'Português',
    localeCode : 'pt',
    localeRtl  : false,

    App : {
        'Localization demo' : 'Demonstração de Localização'
    },

    Button : {
        'Add column'    : 'Adicionar coluna',
        'Display hints' : 'Exibir dicas',
        'Remove column' : 'Remover coluna',
        Apply           : 'Aplicar',
        Learn           : 'Aprender',
        DownloadTrial   : 'Baixar Versão de Avaliação',
        upgradeGuide    : 'Guia de Atualização',
        documentation   : 'Documentação',
        tabJS           : 'Mostrar exemplos de JavaScript',
        tabReact        : 'Mostrar exemplos de React',
        tabVue          : 'Mostrar exemplos de Vue',
        tabAngular      : 'Mostrar exemplos de Angular'
    },

    Column : {
        Company : 'Empresa',
        Name    : 'Nome'
    },

    Checkbox : {
        'Auto apply'  : 'Aplicação automática',
        Automatically : 'Automaticamente',
        runHints      : 'Executar fluxo de dicas na inicialização'
    },

    CodeEditor : {
        'Code editor'   : 'Editor de código',
        'Download code' : 'Baixar código'
    },

    Combo : {
        Theme    : 'Tema',
        Language : 'Idioma',
        Size     : 'Tamanho',
        jumpTo   : 'Ir para'
    },

    Shared : {
        'Full size'      : 'Tamanho completo',
        'Locale changed' : 'Localidade alterada',
        'Phone size'     : 'Tamanho do telefone',
        primaryColor     : 'Cor primária'
    },

    Tooltip : {
        infoButton       : 'Clique para mostrar informações e alternar tema ou localidade',
        codeButton       : 'Clique para mostrar o editor de código embutido',
        hintCheck        : 'Marque para exibir automaticamente dicas ao carregar o exemplo',
        fullscreenButton : 'Tela cheia',
        openInCodePen    : 'Abrir no CodePen',
        toggleLightDark  : 'Alternar modo claro / escuro'
    },

    Popup : {
        UsedClasses : 'Classes usadas nesta demonstração'
    },

    TextField : {
        Filter : 'Filtrar'
    },

    FilterField : {
        typeToFilter : 'Digite para filtrar'
    },

    SlideToggle : {
        newDemos : 'Novos e atualizados'
    }
};

export default LocaleHelper.publishLocale(locale);
