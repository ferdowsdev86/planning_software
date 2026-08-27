import { BryntumDemoHeader, BryntumSchedulerPro } from '@bryntum/schedulerpro-react';
import { schedulerproProps } from './app.config';

const BryntumClient = () => {
    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader/>
            <BryntumSchedulerPro
                {...schedulerproProps}
            />
        </>
    );
};

export default BryntumClient;
