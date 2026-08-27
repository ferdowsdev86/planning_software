import { Fragment, useRef, useEffect } from 'react';

import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { BrowserHelper } from '@bryntum/schedulerpro';
import Toolbar from './component/Toolbar';
import { generateResources } from './lib/Generator';
import { schedulerProps } from './AppConfig';

import './App.scss';

function App() {
    const schedulerRef = useRef<BryntumScheduler>(null);
    const verticalMode = BrowserHelper.searchParam('mode') === 'vertical';
    const mode = verticalMode ? 'vertical' : 'horizontal';

    useEffect(() => {
        if (schedulerRef.current!.instance) {
            generateResources(200, 5, schedulerRef.current!.instance);
        }
    }, [schedulerRef]);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <Toolbar
                    schedulerRef={schedulerRef}
                    mode={mode}
                />
                <BryntumScheduler
                    ref={schedulerRef}
                    {...schedulerProps}
                    mode={mode}
                    narrowEventWidth= {verticalMode ? 500 : 20}
                />
            </div>
        </Fragment>
    );
}

export default App;
