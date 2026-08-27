import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-angular';
import './lib/VehicleConditionColumn';
import { projectData } from './app.data';
import { AppResourceModel } from './lib/AppResource';

export const schedulerProProps: BryntumSchedulerProProps = {
    startDate  : '2025-03-24',
    endDate    : '2025-03-25',
    viewPreset : 'hourAndDay',
    forceFit   : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    columns    : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            field          : 'name',
            showEventCount : false,
            width          : 150
        },
        // Custom application column
        // @ts-ignore
        { type : 'vehicleconditioncolumn' }
    ]
};

export const projectProps: BryntumSchedulerProProjectModelProps = {
    resourceModelClass : AppResourceModel,
    resources          : projectData.resources,
    events             : projectData.events,
    assignments        : projectData.assignments,
    dependencies       : projectData.dependencies
};
