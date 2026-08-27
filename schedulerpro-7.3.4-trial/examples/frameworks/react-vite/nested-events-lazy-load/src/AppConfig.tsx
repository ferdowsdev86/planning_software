import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { getAssignments, getEvents, getResources } from './lib/Data';

export const schedulerProProps: BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    resourceImagePath : './users/',
    startDate         : new Date(2025, 0, 24, 7),
    endDate           : new Date(2025, 0, 24, 23),
    viewPreset        : 'hourAndDay',
    rowHeight         : 90,
    barMargin         : 10,
    columns           : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 },
        { type : 'rating', text : 'Speaker rating', field : 'rating' }
    ],
    nestedEventsFeature : {
        // Don't allow dragging nested events out of their parents
        constrainDragToParent : true
    }
};

export const projectProps: BryntumSchedulerProProjectModelProps = {
    resourceStore : {
        autoLoad    : true,
        lazyLoad    : { chunkSize : 30 },
        requestData : getResources
    },
    eventStore : {
        tree        : true,
        lazyLoad    : true,
        requestData : getEvents
    },
    assignmentStore : {
        lazyLoad    : true,
        requestData : getAssignments
    }
};
