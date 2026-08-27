import { LocaleHelper } from '@bryntum/schedulerpro';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',

    Column : {
        Name    : 'Namn',
        Company : 'Företag'
    }

};

export default LocaleHelper.publishLocale(locale);
