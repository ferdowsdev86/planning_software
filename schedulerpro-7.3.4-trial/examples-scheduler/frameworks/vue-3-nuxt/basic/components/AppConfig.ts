import { type BryntumSchedulerProps } from "@bryntum/schedulerpro-vue-3";

export const schedulerProps : BryntumSchedulerProps = {
    startDate        : new Date(2024, 0, 1, 0),
    endDate          : new Date(2024, 0, 1, 20),
    viewPreset       : 'hourAndDay',
    multiEventSelect : true,
    columns          : [{ text : 'Name', field : 'name', width : 130 }],
    // Project arranges loading and syncing of data in JSON form from/to a web service
    crudManager      : {
        loadUrl  : 'data/data.json',
        autoLoad : true
    }
};
