import { LocaleHelper } from '@bryntum/schedulerpro';

const locale = {

    localeName : 'En',
    localeDesc : 'English (US)',
    localeCode : 'en-US',

    Column : {
        Name    : 'Name',
        Company : 'Company'
    }

};

export default LocaleHelper.publishLocale(locale);
