import React from 'react';
import { BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import Content from './containers/Content';
import './App.scss';

const App = () => {
    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <Content />
        </>
    );
};

export default App;
