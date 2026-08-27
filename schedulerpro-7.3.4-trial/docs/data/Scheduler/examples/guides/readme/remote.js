const scheduler = new Scheduler({
    appendTo : targetElement,

    height : 493,

    startDate  : new Date(2024, 0, 1, 6),
    endDate    : new Date(2024, 0, 1, 20),
    viewPreset : 'hourAndDay',

    columns : [
        { text : 'Name', field : 'name', width : 140, locked : true }
    ],

    // CrudManager arranges loading and syncing of data in JSON form from/to a web service
    crudManager : {
        transport : {
            load : {
                url : 'data/Scheduler/examples/guides/readme/remote.json' // link to .json data file
            }
        },
        autoLoad : true // auto load on initialization
    },

    features : {
        cellEdit     : true,
        filter       : true,
        //group        : 'city',
        quickFind    : true,
        regionResize : true,
        stripe       : true
    }
});
