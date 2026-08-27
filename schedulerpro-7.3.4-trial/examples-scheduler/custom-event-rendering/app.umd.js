var {
    Scheduler,
    AvatarRendering,
    SchedulerEventModel,
    SchedulerResourceModel
} = window.bryntum.schedulerpro;
//region "lib/events.js"

const events = [{
    id          : 1,
    resourceIds : [5, 8, 3, 2],
    startDate   : '2023-01-01T14:00:00',
    endDate     : '2023-01-01T16:00:00',
    progress    : 0,
    type        : 'meeting',
    name        : 'Meeting'
}, {
    id          : 2,
    resourceIds : [1],
    startDate   : '2023-01-01T11:00:00',
    endDate     : '2023-01-01T13:00:00',
    progress    : 30,
    name        : 'Presentation'
}, {
    id          : 3,
    resourceIds : [9],
    startDate   : '2023-01-01T12:00:00',
    endDate     : '2023-01-01T14:00:00',
    progress    : 40,
    type        : 'timeoff',
    name        : 'Dentist'
}, {
    id          : 4,
    resourceIds : [5, 10],
    startDate   : '2023-01-01T11:00:00',
    endDate     : '2023-01-01T13:00:00',
    progress    : 50,
    name        : 'Workshop'
}, {
    id          : 5,
    resourceIds : [3, 8, 2],
    startDate   : '2023-01-01T09:30:00',
    endDate     : '2023-01-01T11:00:00',
    progress    : 60,
    name        : 'Discussion Panel'
}, {
    id          : 6,
    resourceIds : [4, 1, 6],
    startDate   : '2023-01-01T15:00:00',
    endDate     : '2023-01-01T17:00:00',
    progress    : 70,
    name        : 'Hackathon'
}, {
    id          : 7,
    resourceIds : [5, 10, 2],
    startDate   : '2023-01-01T16:00:00',
    endDate     : '2023-01-01T18:00:00',
    progress    : 80,
    name        : 'Demo Day'
}, {
    id          : 8,
    resourceIds : [8, 7, 4],
    startDate   : '2023-01-01T17:00:00',
    endDate     : '2023-01-01T19:00:00',
    progress    : 90,
    name        : 'Product Launch'
}, {
    id          : 9,
    resourceIds : [3],
    startDate   : '2023-01-01T18:00:00',
    endDate     : '2023-01-01T20:00:00',
    progress    : 100,
    type        : 'timeoff',
    name        : 'Car maintenance'
}, {
    id          : 10,
    resourceIds : [1, 5, 9],
    startDate   : '2023-01-01T19:00:00',
    endDate     : '2023-01-01T21:00:00',
    progress    : 20,
    name        : 'Meeting'
}, {
    id          : 11,
    resourceIds : [4, 8, 3],
    startDate   : '2023-01-01T20:00:00',
    endDate     : '2023-01-01T22:00:00',
    progress    : 30,
    name        : 'Presentation'
}, {
    id          : 12,
    resourceIds : [7, 6, 2],
    startDate   : '2023-01-01T21:00:00',
    endDate     : '2023-01-01T23:00:00',
    progress    : 40,
    name        : 'Training Session'
}, {
    id          : 13,
    resourceIds : [10, 1, 5],
    startDate   : '2023-01-01T22:00:00',
    endDate     : '2023-01-02T00:00:00',
    progress    : 50,
    name        : 'Workshop'
}, {
    id          : 14,
    resourceIds : [3, 9, 4],
    startDate   : '2023-01-01T23:00:00',
    endDate     : '2023-01-02T01:00:00',
    progress    : 60,
    name        : 'Discussion Panel'
}, {
    id          : 15,
    resourceIds : [2, 5, 8],
    startDate   : '2023-01-02T00:00:00',
    endDate     : '2023-01-02T02:00:00',
    progress    : 70,
    name        : 'Hackathon'
}, {
    id          : 16,
    resourceIds : [1, 7, 6],
    startDate   : '2023-01-02T01:00:00',
    endDate     : '2023-01-02T03:00:00',
    progress    : 80,
    name        : 'Demo Day'
}, {
    id          : 17,
    resourceIds : [4, 3, 9],
    startDate   : '2023-01-02T02:00:00',
    endDate     : '2023-01-02T04:00:00',
    progress    : 90,
    name        : 'Product Launch'
}, {
    id          : 18,
    resourceIds : [2, 5],
    startDate   : '2023-01-02T03:00:00',
    endDate     : '2023-01-02T05:00:00',
    progress    : 100,
    name        : 'Conference'
}, {
    id          : 19,
    resourceIds : [1, 2, 3],
    startDate   : '2023-01-02T04:00:00',
    endDate     : '2023-01-02T06:00:00',
    progress    : 20,
    name        : 'Meeting'
}, {
    id          : 20,
    resourceIds : [9, 3],
    startDate   : '2023-01-02T05:00:00',
    endDate     : '2023-01-02T07:00:00',
    progress    : 30,
    name        : 'Presentation'
}];

//endregion

class CustomEventModel extends SchedulerEventModel {
    static $name = 'CustomEventModel';
    static fields = [{
        name    : 'resourceIds',
        persist : true
    }, {
        name         : 'type',
        defaultValue : 'task'
    }, {
        name         : 'progress',
        defaultValue : 0
    }];
}
class CustomResourceModel extends SchedulerResourceModel {
    static $name = 'CustomResourceModel';
    get imageUrl() {
        return `../_shared/images/transparent-users/${this.name.toLowerCase()}.png`;
    }
}
const avatarRenderer = new AvatarRendering({
        size : '2em'
    }),
    resources = [{
        id   : 1,
        name : 'Mike'
    }, {
        id   : 2,
        name : 'Linda'
    }, {
        id   : 3,
        name : 'Emilia'
    }, {
        id   : 5,
        name : 'Hitomi'
    }, {
        id   : 6,
        name : 'Amit'
    }, {
        id   : 7,
        name : 'Lee'
    }, {
        id   : 8,
        name : 'Macy'
    }, {
        id   : 9,
        name : 'Steve'
    }, {
        id   : 10,
        name : 'Rob'
    }];
const scheduler = new Scheduler({
    appendTo      : 'container',
    resourceStore : {
        modelClass : CustomResourceModel,
        data       : resources
    },
    eventStore : {
        modelClass : CustomEventModel,
        data       : events
    },
    startDate                 : new Date(2023, 0, 1, 9),
    endDate                   : new Date(2023, 0, 1, 20),
    rowHeight                 : 80,
    barMargin                 : 5,
    eventColor                : null,
    eventStyle                : null,
    rowLines                  : false,
    zoomOnMouseWheel          : false,
    zoomOnTimeAxisDoubleClick : false,
    columns                   : [{
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 130
    }],
    viewPreset : {
        base    : 'hourAndDay',
        headers : [{
            unit       : 'minute',
            increment  : 30,
            dateFormat : 'HH:mm'
        }]
    },
    features : {
        eventMenu : {
            // We want to trigger the event menu to show when clicking our ellipsis icon
            clickTriggerSelector : '.b-sch-event .fa-ellipsis'
        },
        eventEdit : {
            items : {
                typeField : {
                    weight : 110,
                    type   : 'container',
                    cls    : 'b-widget b-field b-label-above b-has-label b-custom-buttongroup-container',
                    items  : {
                        label : {
                            tag  : 'label',
                            cls  : 'b-label b-align-start',
                            html : 'Type'
                        },
                        typeButtons : {
                            type        : 'buttongroup',
                            name        : 'type',
                            toggleGroup : true,
                            rendition   : 'padded',
                            items       : [{
                                text  : 'Meeting',
                                value : 'meeting'
                            }, {
                                text  : 'Task',
                                value : 'task'
                            }, {
                                text  : 'Time off',
                                value : 'timeoff'
                            }]
                        }
                    }
                },
                // Using this ref hooks dynamic toggling of fields per eventType up
                progressField : {
                    text  : 'Progress',
                    type  : 'slider',
                    name  : 'progress',
                    label : 'Progress',
                    flex  : '1 1 auto'
                },
                resourceField : {
                    label : 'Resources'
                }
            },
            // Use slide-in overlay editor
            editorConfig : {
                drawer   : true,
                defaults : {
                    labelPosition : 'above'
                }
            }
        },
        // Event contents fills the entire event bar, which leaves nothing to stick
        stickyEvents : false
    },
    // Define the DOM markup rendered inside the events bar using simple DOMConfig objects
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        renderData.cls[`b-type-${eventRecord.type}`] = 1;
        return [{
            class    : 'header',
            children : [{
                class    : 'progress-outer',
                children : [{
                    class : 'progress-fill',
                    style : {
                        width : (eventRecord.progress || 0) + '%'
                    }
                }]
            }, {
                class : 'fa fa-ellipsis'
            }]
        }, {
            class    : 'footer',
            children : [eventRecord.type === 'meeting' ? {
                class : 'fa fa-people-group'
            } : null, {
                tag  : 'span',
                text : eventRecord.name
            }, ...avatarRenderer.getResourceAvatar(eventRecord.resources)]
        }];
    }
});