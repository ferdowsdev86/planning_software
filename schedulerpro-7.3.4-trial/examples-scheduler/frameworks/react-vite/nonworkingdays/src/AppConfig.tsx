import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { SchedulerResourceModel } from '@bryntum/schedulerpro';

class Property extends SchedulerResourceModel {
    static fields = [
        // Using icons for resources
        {
            name         : 'image',
            defaultValue : false
        }
    ];
}

export const useSchedulerProps = (handleToolbarToggle: any): BryntumSchedulerProps => {
    return {
        // Enables smoother wheel and pinch zooming
        smoothZoom : true,
        startDate  : new Date(2022, 11, 1),
        endDate    : new Date(2022, 11, 20),
        barMargin  : 10,
        rowHeight  : 60,

        cls : 'custom-style',

        viewPreset : 'weekAndDayLetter',

        sortFeature : 'name',

        // Shade non-working days
        nonWorkingTimeFeature : true,

        eventNonWorkingTimeFeature : {
            disabled : true
        },

        scheduleTooltipFeature : {
            // Hide schedule tooltip when hovering non-working days
            hideForNonWorkingTime : true
        },

        // CrudManager loads all data from a single source
        crudManager : {
            resourceStore : {
                modelClass : Property
            },

            autoLoad : true,

            loadUrl : 'data/data.json'
        },

        columns : [
            {
                type          : 'resourceInfo',
                width         : 200,
                text          : 'Properties',
                headerWidgets : [
                    {
                        ref       : 'toolbarToggleButton',
                        type      : 'button',
                        icon      : 'fa fa-cog',
                        rendition : 'text',
                        tooltip   : 'Toggle settings toolbar',
                        onClick   : handleToolbarToggle
                    }
                ]
            }
        ]
    };
};

