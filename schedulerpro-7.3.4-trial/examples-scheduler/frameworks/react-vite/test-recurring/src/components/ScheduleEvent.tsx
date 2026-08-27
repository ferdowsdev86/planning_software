import React from 'react';
import { SchedulerEventModel } from '@bryntum/schedulerpro';

type ScheduleEventProps = {
    eventRecord: SchedulerEventModel
}

export const ScheduleEvent = (props : ScheduleEventProps) => {
    return <div>{props.eventRecord.name}</div>;
};
