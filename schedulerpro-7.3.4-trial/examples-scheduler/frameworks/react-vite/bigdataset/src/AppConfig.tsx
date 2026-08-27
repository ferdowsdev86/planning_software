import { Model, SchedulerEventModel, SchedulerResourceModel, SchedulerAssignmentModel } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import ProgressBar from './component/ProgressBar';
import DemoEvent from './component/DemoEvent';

// Event renderer returns JSX with DemoEvent component
const eventRenderer = ({ eventRecord, assignmentRecord } : { eventRecord : SchedulerEventModel; assignmentRecord: SchedulerAssignmentModel }) => {
    return <DemoEvent
        key={assignmentRecord.id}
        eventRecord={eventRecord}
    ></DemoEvent>;
};

export const schedulerProps: BryntumSchedulerProps = {
    eventRenderer,
    // Enables smoother wheel and pinch zooming
    smoothZoom                : true,
    rowHeight                 : 70,
    eventStyle                : 'tonal',
    resourceImagePath         : './users',
    dependenciesFeature       : { disabled : true },
    resourceTimeRangesFeature : { disabled : true },
    timeRangesFeature         : {
        disabled       : true,
        enableResizing : true
    },
    nonWorkingTimeFeature      : { disabled : true },
    eventNonWorkingTimeFeature : { disabled : true },
    columns                    : [
        {
            text                 : 'Staff',
            field                : 'name',
            type                 : 'resourceInfo',
            htmlEncodeHeaderText : false,
            width                : 200
        },
        {
            text                 : 'Progress<div class="small-text">(React component)</div>',
            htmlEncodeHeaderText : false,
            width                : 220,
            align                : 'center',
            editor               : false,
            // Using custom React component
            renderer             : ({ record } : { record : Model }) => (
                <ProgressBar
                    backgroundColor={(record as SchedulerResourceModel).eventColor!}
                    completed={Math.ceil(Math.random() * 100)}
                />
            )
        }
    ]

};
