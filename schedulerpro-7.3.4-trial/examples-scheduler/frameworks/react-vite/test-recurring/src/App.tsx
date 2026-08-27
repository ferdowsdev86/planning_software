import React, { useState } from 'react';
import { BryntumButton, BryntumScheduler, BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import { schedulerProps } from './AppConfig';

import './App.scss';

const App = () => {

    const [usePlainHTML, setUsePlainHTML] = useState(true);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            {/* Also required for sanity checks for this test example*/}
            <BryntumDemoHeader/>
            <div className="demo-toolbar align-right">
                <BryntumButton onClick={() => {
                    setUsePlainHTML(!usePlainHTML);
                }} text='Change Template'/>
            </div>
            <BryntumScheduler
                {...schedulerProps}
                eventTooltipFeature={usePlainHTML ? { template : () => 'Simple html' } : { template : () =>  <div className='jsx'>JSX</div> }}
            />
        </>
    );
};

export default App;
