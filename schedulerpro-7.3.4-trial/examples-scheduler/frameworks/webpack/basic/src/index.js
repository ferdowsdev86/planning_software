// SchedulerBase is a thinner version of Scheduler, that do not include any features disabled by default.
// Using it makes it easier to get a smaller build
// Check webpack.config.js for @bryntum path aliasing

import DemoHeader from '@bryntum/lib/Core/widget/DemoHeader.js';

import SchedulerBase from '@bryntum/lib/Scheduler/view/SchedulerBase.js';

// Import the features you need
import '@bryntum/lib/Scheduler/feature/EventTooltip.js';
import '@bryntum/lib/Scheduler/feature/EventEdit.js';
import '@bryntum/lib/Scheduler/feature/EventDrag.js';
import '@bryntum/lib/Scheduler/feature/EventResize.js';

// Import styling
import './index.scss';

new SchedulerBase({
    adopt : 'demo-component',

    startDate  : '2024-12-01T06:00:00',
    endDate    : '2024-12-01T20:00:00',
    viewPreset : 'hourAndDay',

    features : {
        eventTooltip : true,
        eventEdit    : true,
        eventDrag    : true,
        eventResize  : true
    },

    columns : [
        {
            field : 'name',
            text  : 'Name',
            width : 150
        }
    ],

    crudManager : {
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        autoLoad : true
    }

});

// Demo header is used for Bryntum styling and not required for your application
new DemoHeader();
