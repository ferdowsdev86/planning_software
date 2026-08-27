import { Fragment, useRef } from 'react';

import { BryntumDemoHeader, BryntumTimelineHistogram } from '@bryntum/schedulerpro-react';
import { histogramProps } from './AppConfig';

import './App.scss';

function App() {
    const histogramRef = useRef<BryntumTimelineHistogram>(null);

    return (
        <Fragment>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <BryntumTimelineHistogram
                ref={histogramRef}
                {...histogramProps}
            />
        </Fragment>
    );
}

export default App;
