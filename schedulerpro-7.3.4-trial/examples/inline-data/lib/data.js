export const data = {

    resources : [
        { id : 1, name : 'Truck 1', iconCls : 'fa fa-truck', image : false, vehicleCondition : 0 },
        { id : 2, name : 'Truck 2', iconCls : 'fa fa-truck', image : false, vehicleCondition : 1 },
        { id : 3, name : 'Truck 3', iconCls : 'fa fa-truck', image : false, vehicleCondition : 1 },
        { id : 4, name : 'Train 1', iconCls : 'fa fa-train', image : false, vehicleCondition : 2 },
        { id : 5, name : 'Train 2', iconCls : 'fa fa-train', image : false, vehicleCondition : 2 },
        { id : 6, name : 'Pickup 1', iconCls : 'fa fa-truck-pickup', image : false, vehicleCondition : 3 },
        { id : 7, name : 'Pickup 2', iconCls : 'fa fa-truck-pickup', image : false, vehicleCondition : 3 },
        { id : 8, name : 'Pickup 3', iconCls : 'fa fa-truck-pickup', image : false, vehicleCondition : 3 },
        { id : 9, name : 'Plane 1', iconCls : 'fa fa-plane', image : false, vehicleCondition : 2 },
        { id : 10, name : 'Plane 2', iconCls : 'fa fa-plane', image : false, vehicleCondition : 2 },
        { id : 11, name : 'Helicopter 1', iconCls : 'fa fa-helicopter', image : false, vehicleCondition : 1 },
        { id : 12, name : 'Rocket 1', iconCls : 'fa fa-rocket', image : false, vehicleCondition : 0 },
        { id : 13, name : 'Rocket 2', iconCls : 'fa fa-rocket', image : false, vehicleCondition : 3 },
        { id : 14, name : 'Horse', iconCls : 'fa fa-horse', image : false, vehicleCondition : 0 }
    ],

    events : [
        {
            id         : 1,
            name       : 'Arrive',
            startDate  : '2022-03-23T03:00',
            endDate    : '2022-03-23T05:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 2,
            name       : 'Unload',
            startDate  : '2022-03-23T06:00',
            endDate    : '2022-03-23T09:00',
            iconCls    : 'fa fa-snowplow',
            eventColor : 'orange'
        },
        {
            id         : 3,
            name       : 'Load',
            startDate  : '2022-03-23T10:00',
            endDate    : '2022-03-23T12:00',
            iconCls    : 'fa fa-truck-loading',
            eventColor : 'green'
        },
        {
            id         : 4,
            name       : 'Depart',
            startDate  : '2022-03-23T13:00',
            endDate    : '2022-03-23T14:30',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 5,
            name       : 'Arrive 2',
            startDate  : '2022-03-23T07:00',
            endDate    : '2022-03-23T09:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 6,
            name       : 'Unload 2',
            startDate  : '2022-03-23T10:00',
            endDate    : '2022-03-23T13:30',
            iconCls    : 'fa fa-snowplow',
            eventColor : 'orange'
        },
        {
            id         : 7,
            name       : 'Load 2',
            startDate  : '2022-03-23T14:30',
            endDate    : '2022-03-23T16:00',
            iconCls    : 'fa fa-truck-loading',
            eventColor : 'green'
        },
        {
            id         : 8,
            name       : 'Depart 2',
            startDate  : '2022-03-23T17:00',
            endDate    : '2022-03-23T19:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 9,
            name       : 'Arrive 3',
            startDate  : '2022-03-23T01:00',
            endDate    : '2022-03-23T05:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 10,
            name       : 'Unload 3',
            startDate  : '2022-03-23T06:00',
            endDate    : '2022-03-23T09:00',
            iconCls    : 'fa fa-hand-paper',
            eventColor : 'orange'
        },
        {
            id         : 11,
            name       : 'Load 3',
            startDate  : '2022-03-23T10:00',
            endDate    : '2022-03-23T15:00',
            iconCls    : 'fa fa-user-astronaut',
            eventColor : 'green'
        },
        {
            id         : 12,
            name       : 'Depart 3',
            startDate  : '2022-03-23T16:00',
            endDate    : '2022-03-23T21:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 13,
            name       : 'Arrive 4',
            startDate  : '2022-03-23T05:00',
            endDate    : '2022-03-23T09:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 14,
            name       : 'Reload 4',
            startDate  : '2022-03-23T11:00',
            endDate    : '2022-03-23T16:00',
            iconCls    : 'fa fa-snowplow',
            eventColor : 'orange'
        },
        {
            id         : 15,
            name       : 'Depart 4',
            startDate  : '2022-03-23T18:00',
            endDate    : '2022-03-23T22:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 16,
            name       : 'Yearly maintenance',
            startDate  : '2022-03-23T05:00',
            endDate    : '2022-03-23T13:00',
            iconCls    : 'fa fa-wrench',
            eventColor : 'gray'
        },
        {
            id         : 17,
            name       : 'Arrive 5',
            startDate  : '2022-03-23T01:00',
            endDate    : '2022-03-23T03:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 18,
            name       : 'Unload 5',
            startDate  : '2022-03-23T04:00',
            endDate    : '2022-03-23T06:00',
            iconCls    : 'fa fa-snowplow',
            eventColor : 'orange'
        },
        {
            id         : 19,
            name       : 'Load 5',
            startDate  : '2022-03-23T08:00',
            endDate    : '2022-03-23T11:00',
            iconCls    : 'fa fa-truck-loading',
            eventColor : 'green'
        },
        {
            id         : 20,
            name       : 'Depart 5',
            startDate  : '2022-03-23T14:00',
            endDate    : '2022-03-23T16:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 21,
            name       : 'Arrive 6',
            startDate  : '2022-03-23T02:00',
            endDate    : '2022-03-23T07:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        },
        {
            id         : 22,
            name       : 'Reload 6',
            startDate  : '2022-03-23T10:00',
            endDate    : '2022-03-23T16:00',
            iconCls    : 'fa fa-snowplow',
            eventColor : 'orange'
        },
        {
            id         : 23,
            name       : 'Depart 6',
            startDate  : '2022-03-23T19:00',
            endDate    : '2022-03-23T23:00',
            iconCls    : 'fa fa-arrow-right',
            eventColor : 'blue'
        }
    ],
    assignments : [
        { id : 1, resourceId : 1, eventId : 1 },
        { id : 2, resourceId : 1, eventId : 2 },
        { id : 3, resourceId : 4, eventId : 3 },
        { id : 4, resourceId : 4, eventId : 4 },
        { id : 5, resourceId : 7, eventId : 5 },
        { id : 6, resourceId : 7, eventId : 6 },
        { id : 7, resourceId : 8, eventId : 7 },
        { id : 8, resourceId : 8, eventId : 8 },
        { id : 9, resourceId : 14, eventId : 9 },
        { id : 10, resourceId : 14, eventId : 10 },
        { id : 11, resourceId : 13, eventId : 11 },
        { id : 12, resourceId : 13, eventId : 12 },
        { id : 13, resourceId : 10, eventId : 13 },
        { id : 14, resourceId : 10, eventId : 14 },
        { id : 15, resourceId : 10, eventId : 15 },
        { id : 16, resourceId : 2, eventId : 16 },
        { id : 17, resourceId : 3, eventId : 16 },
        { id : 18, resourceId : 6, eventId : 16 },
        { id : 19, resourceId : 2, eventId : 17 },
        { id : 20, resourceId : 2, eventId : 18 },
        { id : 21, resourceId : 5, eventId : 19 },
        { id : 22, resourceId : 5, eventId : 20 },
        { id : 23, resourceId : 11, eventId : 21 },
        { id : 24, resourceId : 11, eventId : 22 },
        { id : 25, resourceId : 11, eventId : 23 }
    ],
    dependencies : [
        { id : 1, from : 1, to : 2, lag : 1, lagUnit : 'hour' },
        { id : 2, from : 2, to : 3, lag : 1, lagUnit : 'hour' },
        { id : 3, from : 3, to : 4, lag : 1, lagUnit : 'hour' },
        { id : 4, from : 5, to : 6, lag : 1, lagUnit : 'hour' },
        { id : 5, from : 6, to : 7, lag : 1, lagUnit : 'hour' },
        { id : 6, from : 7, to : 8, lag : 1, lagUnit : 'hour' },
        { id : 7, from : 9, to : 10, lag : 1, lagUnit : 'hour' },
        { id : 8, from : 10, to : 11, lag : 1, lagUnit : 'hour' },
        { id : 9, from : 11, to : 12, lag : 1, lagUnit : 'hour' },
        { id : 10, from : 13, to : 14, lag : 2, lagUnit : 'hour' },
        { id : 11, from : 14, to : 15, lag : 2, lagUnit : 'hour' },
        { id : 12, from : 17, to : 18, lag : 1, lagUnit : 'hour' },
        { id : 13, from : 18, to : 19, lag : 2, lagUnit : 'hour' },
        { id : 14, from : 19, to : 20, lag : 3, lagUnit : 'hour' },
        { id : 15, from : 21, to : 22, lag : 3, lagUnit : 'hour' },
        { id : 16, from : 22, to : 23, lag : 3, lagUnit : 'hour' }
    ]

};
