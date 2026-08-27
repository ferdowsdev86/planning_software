import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerProProps } from './AppConfig';
import './App.scss';

function App() {

    return (
        <>
            <BryntumDemoHeader/>
            <BryntumSchedulerPro {...schedulerProProps} />
        </>
    );
}

export default App;
