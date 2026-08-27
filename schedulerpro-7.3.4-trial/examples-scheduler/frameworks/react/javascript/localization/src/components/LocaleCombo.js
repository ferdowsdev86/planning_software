/**
 * Select language component
 */
// libraries
import React, { useRef, useEffect } from 'react';
import { Combo } from '@bryntum/schedulerpro';
import { useTranslation } from 'react-i18next';

import SettingsContext from '../context/SettingsContext.js';

const LocaleCombo = props => {

    const
        elRef = useRef(),
        inputRef = useRef(),
        { t, i18n } = useTranslation();

    // this will hold SettingContext function setLocale eventually
    let changeLocale = null;

    const combo = inputRef.current = inputRef.current || new Combo({
        label      : 'Select Language:',
        cls        : 'locale-combo',
        inputWidth : '9em',
        editable   : false,
        onChange   : ({ value : locale }) => {
            changeLocale(locale);
        },
        store : [
            { id : 'en', text : 'English' },
            { id : 'se', text : 'Swedish' },
            { id : 'ru', text : 'Russian' }
        ]
    });

    // initial combo rendering
    useEffect(() => {
        combo.insertFirst = props.container || elRef.current;
        combo.render();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // update label when language changes
    useEffect(() => {
        combo.label = t('selectLanguage');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language]);

    return (
        <SettingsContext.Consumer>
            {context => {
                // save the locale setter
                changeLocale = changeLocale || context.setLocale;

                // silently set the combo initial value
                combo.suspendEvents();
                combo.value = context.locale;
                combo.resumeEvents();

                return (
                    props.container ? null : <div ref={elRef}></div>
                );
            }}
        </SettingsContext.Consumer>
    );

};

export default LocaleCombo;
