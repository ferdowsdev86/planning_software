import { ResourceModel } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { projectData } from './AppData';
import './lib/VehicleConditionColumn';

class AppResourceModel extends ResourceModel {
    static get fileds() {
        return [
            { name : 'vehicleCondition', type : 'number' }
        ];
    }
}

export const schedulerProProps : BryntumSchedulerProProps = {
    startDate  : '2022-03-23',
    endDate    : '2022-03-24',
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
        //  // Custom application column
        // @ts-ignore
        { type : 'vehicleconditioncolumn' }
    ]
};

export const projectProps : BryntumSchedulerProProjectModelProps = {
    resourceModelClass : AppResourceModel,
    resources          : projectData.resources,
    events             : projectData.events,
    assignments        : projectData.assignments,
    dependencies       : projectData.dependencies
};
