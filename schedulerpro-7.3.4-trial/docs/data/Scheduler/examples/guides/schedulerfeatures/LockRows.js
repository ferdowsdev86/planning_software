const resources = ArrayHelper.populate(50, i => ({ id : i, name : `Resource ${i}` }), true);
resources[0].inactive = true;

const scheduler = new Scheduler({
    appendTo : targetElement,

    height : 400,

    startDate : new Date(2023, 4, 22),
    endDate   : new Date(2023, 5, 30),

    features : {
        lockRows : {
            fieldName : 'inactive'
        }
    },

    columns : [
        { field : 'name', text : 'Name', width : 100 },
        { field : 'inactive', text : 'Inactive', type : 'check' }
    ],

    resources,

    events : ArrayHelper.populate(200, i => ({ id : i, name : `Event ${i}`, resourceId : i % 50, startDate : new Date(2023, 4, 22, i * 12), duration : 4 }), true)
});
