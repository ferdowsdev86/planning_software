/**
 * Page header container component
 *
 * It contains also controls (tools).
 * It is implemented as a functional component using React hooks that
 * were introduced in React 16.8.0. If you cannot upgrade to that or
 * later version of React then you must convert this component to class.
 */
// libraries
import React from 'react';
import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/schedulerpro-react';
import { useTranslation } from 'react-i18next';

// our stuff
import LocaleCombo from './LocaleCombo.js';

const Header = () => {
    const { t } = useTranslation();
    return (
        // BryntumDemoHeader component is used for Bryntum example styling only and can be removed
        <BryntumDemoHeader title={t('title')} themeCombo={false}>
            <LocaleCombo/>
            <BryntumThemeCombo
                label={t('selectTheme')}
            />
        </BryntumDemoHeader>
    );
};

export default Header;
