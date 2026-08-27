import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { schedulerProps } from './app.config';

const BryntumClient = () => {
    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <BryntumScheduler
                {...schedulerProps}
            />
        </>
    );
};

export default BryntumClient;
