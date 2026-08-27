// SchedulerProBase is a thinner version of SchedulerPro, that do not include any features disabled by default.
// Using it makes it easier to get a smaller build
// Check webpack.config.js for @bryntum path aliasing

import DemoHeader from '@bryntum/lib/Core/widget/DemoHeader.js';

import SchedulerProBase from '@bryntum/lib/SchedulerPro/view/SchedulerProBase.js';

// Import the features you need
import '@bryntum/lib/SchedulerPro/feature/TaskEdit.js';

// Import styling
import './index.scss';

new SchedulerProBase({
    adopt : 'demo-component',

    startDate  : '2024-12-01T06:00:00',
    endDate    : '2024-12-01T20:00:00',
    viewPreset : 'hourAndDay',

    features : {
        taskEdit : true
    },

    columns : [
        {
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ],

    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    project : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
});

// Demo header is used for Bryntum styling and not required for your application
new DemoHeader();
