/**
 * The App file. It should stay as simple as possible
 */
import React, { Fragment } from 'react';

import { BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import { Toast } from '@bryntum/schedulerpro';
import Content from './components/Content.js';
import './App.scss';

const App = props => {
    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <Content />
        </Fragment>
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
