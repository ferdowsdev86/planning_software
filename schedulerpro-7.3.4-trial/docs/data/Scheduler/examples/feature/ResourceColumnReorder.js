const scheduler = new Scheduler({
    appendTo : targetElement,

    height : '22em',

    startDate : new Date(2022, 4, 1),
    endDate   : new Date(2022, 4, 7),
    mode      : 'vertical',

    resources : [
        { id : 1, name : 'Greta' },
        { id : 2, name : 'Ingrid' },
        { id : 3, name : 'John' },
        { id : 4, name : 'Kate' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Interview', startDate : '2022-05-02', endDate : '2022-05-03' },
        { id : 2, resourceId : 2, name : 'Press meeting', startDate : '2022-05-03', endDate : '2022-05-04' },
        { id : 3, resourceId : 3, name : 'Audition', startDate : '2022-05-02', endDate : '2022-05-05' },
        { id : 4, resourceId : 4, name : 'Meeting', startDate : '2022-05-04', endDate : '2022-05-06' }
    ],

    features : {
        resourceColumnReorder : true
    }
});
