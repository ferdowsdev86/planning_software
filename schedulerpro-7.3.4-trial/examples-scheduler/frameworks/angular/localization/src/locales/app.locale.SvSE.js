import { LocaleHelper } from '@bryntum/schedulerpro';

const locale = {

    localeName : 'SvSE',
    localeDesc : 'Svenska',
    localeCode : 'sv-SE',

    Column : {
        Staff        : 'Personal',
        'Task color' : 'Uppgiftsfärg'
    }

};

export default LocaleHelper.publishLocale(locale);
