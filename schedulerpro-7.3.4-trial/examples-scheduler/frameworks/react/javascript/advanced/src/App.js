/**
 * Main App script
 */
// libraries
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// styles
import './App.scss';

// locales
import './locales';
import { LocaleManager, Toast } from '@bryntum/schedulerpro';

// our stuff
import Scheduler from './components/Scheduler';
import Toolbar from './components/Toolbar';
import { BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import { useSelector } from 'react-redux';

const App = props => {
    const { t, i18n } = useTranslation();
    const locale = useSelector(state => state.locale.locale);

    // Handles locale changes
    useEffect(() => {
        const { language } = i18n;

        // Change language in i18next library
        if (locale !== language) {
            i18n.changeLanguage(locale);
        }

        // Change Bryntum Scheduler locale
        switch (locale) {
            case 'se':
                LocaleManager.applyLocale('SvSE');
                break;

            case 'ru':
                LocaleManager.applyLocale('Ru');
                break;

            default:
                LocaleManager.applyLocale('En');
                break;
        }
    }, [i18n, locale, t]);

    // error handler
    useEffect(() => {
        if (props.err) {
            Toast.show(t(props.err.message));
            props.clearError();
        }
    }, [props, props.err, t]);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
            <Toolbar />
            <Scheduler />
            </div>
        </>
    );
};

export default App;


Toast.show({
    color : 'b-orange',
    html  : `
        <p>This demo was created with <strong>Create React App</strong> (CRA).</p>
        <p>Since CRA is deprecated, we recommend you to check out our React Vite demos.</p>
    `,
    timeout : 10000
});
