import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { schedulerProps } from './AppConfig';
import './App.scss';

const App = () => {
    return (
        <>
            <BryntumDemoHeader />
            <BryntumScheduler
                {...schedulerProps}
            />
        </>
    );
};

export default App;
