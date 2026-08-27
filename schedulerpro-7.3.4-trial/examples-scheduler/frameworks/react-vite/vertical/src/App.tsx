import { FunctionComponent } from 'react';
import { BryntumDemoHeader } from '@bryntum/schedulerpro-react';
import VerticalScheduler from './component/VerticalScheduler';
import './App.scss';

const App: FunctionComponent = () => {
    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <VerticalScheduler/>
        </>
    );
};

export default App;
