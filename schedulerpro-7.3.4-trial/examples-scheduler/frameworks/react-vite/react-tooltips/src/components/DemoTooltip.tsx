import React from 'react';
import { type SchedulerResourceModel, type Column } from '@bryntum/schedulerpro';

interface DemoTooltipProps {
    record: SchedulerResourceModel;
    column: Column;
}

const DemoTooltip: React.FC<DemoTooltipProps> = ({ record, column }) => {
    // Get the hovered field from the column and then
    // retrieve the corresponding data from the resource record
    const value = record.getData(column.field);

    return (
        <div>
            React component: <b>{value as string}</b>
        </div>
    );
};

export default DemoTooltip;
