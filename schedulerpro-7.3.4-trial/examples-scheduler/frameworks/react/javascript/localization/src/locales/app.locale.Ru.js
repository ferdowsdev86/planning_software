import { LocaleHelper } from '@bryntum/schedulerpro';

const locale = {

    localeName : 'Ru',
    localeDesc : 'Русский',
    localeCode : 'ru',

    Column : {
        Name    : 'Имя',
        Company : 'Компания'
    }

};

export default LocaleHelper.publishLocale(locale);
