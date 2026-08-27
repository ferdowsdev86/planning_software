import { LocaleHelper } from '@bryntum/schedulerpro';

const locale = {

    localeName : 'Ru',
    localeDesc : 'Русский',
    localeCode : 'ru',

    Column : {
        Staff        : 'Персонал',
        'Task color' : 'Цвет задачи'
    }

};

export default LocaleHelper.publishLocale(locale);
