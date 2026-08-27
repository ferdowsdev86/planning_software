const scheduler = new Scheduler({
    appendTo   : targetElement,
    autoHeight : true,
    rowHeight  : 50,

    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],

    crudManager : {
        transport : {
            load : {
                url : '/mockUrl'
            }
        },
        autoLoad : true
    },

    startDate : new Date(2025, 1, 1),
    endDate   : new Date(2025, 1, 15)
});

// AJAX URL Mocking
AjaxHelper.mockUrl('/mockUrl', () => {
    return {
        responseText : JSON.stringify(schedulerData())
    };
});

function schedulerData() {
    return {
        resources : {
            rows : [
                {
                    id   : 'r1',
                    name : 'Mike'
                },
                {
                    id   : 'r2',
                    name : 'Linda'
                },
                {
                    id   : 'r3',
                    name : 'Don'
                },
                {
                    id   : 'r4',
                    name : 'Karen'
                },
                {
                    id   : 'r5',
                    name : 'Doug'
                },
                {
                    id   : 'r6',
                    name : 'Peter'
                },
                {
                    id   : 'r7',
                    name : 'Sam'
                }
            ]
        },
        events : {
            rows : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2025, 1, 1, 10),
                    endDate    : new Date(2025, 1, 2, 12),
                    name       : 'Click me',
                    iconCls    : 'b-fa b-fa-mouse-pointer'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : new Date(2025, 1, 1, 12),
                    endDate    : new Date(2025, 1, 3, 13, 30),
                    name       : 'Drag me',
                    iconCls    : 'b-fa b-fa-arrows-alt'
                },
                {
                    id         : 3,
                    resourceId : 'r3',
                    startDate  : new Date(2025, 1, 1, 14),
                    endDate    : new Date(2025, 1, 7, 14),
                    name       : 'Double click me',
                    eventColor : 'purple',
                    iconCls    : 'b-fa b-fa-mouse-pointer'
                },
                {
                    id         : 4,
                    resourceId : 'r4',
                    startDate  : new Date(2025, 1, 1, 8),
                    endDate    : new Date(2025, 1, 5, 11),
                    name       : 'Right click me',
                    iconCls    : 'b-fa b-fa-mouse-pointer'
                },
                {
                    id         : 5,
                    resourceId : 'r5',
                    startDate  : new Date(2025, 1, 1, 15),
                    endDate    : new Date(2025, 1, 2, 17),
                    name       : 'Resize me',
                    iconCls    : 'b-fa b-fa-arrows-alt-h'
                },
                {
                    id         : 6,
                    resourceId : 'r6',
                    startDate  : new Date(2025, 1, 1, 16),
                    endDate    : new Date(2025, 1, 3, 19),
                    name       : 'Important meeting (read-only)',
                    iconCls    : 'b-fa b-fa-exclamation-triangle',
                    eventColor : 'red',
                    readOnly   : true
                },
                {
                    id         : 7,
                    resourceId : 'r6',
                    startDate  : new Date(2025, 1, 4, 6),
                    endDate    : new Date(2025, 1, 6, 8),
                    name       : 'Sports event',
                    iconCls    : 'b-fa b-fa-basketball-ball'
                },
                {
                    id         : 8,
                    resourceId : 'r7',
                    startDate  : new Date(2025, 1, 7, 9),
                    endDate    : new Date(2025, 1, 9, 11, 30),
                    name       : 'Dad\'s birthday!',
                    iconCls    : 'b-fa b-fa-birthday-cake',
                    // Custom styling from data
                    style      : 'background-color : teal; color : white; font-size: 18px;',
                    // Prevent default styling
                    eventStyle : 'none'
                }
            ]
        }
    };
}
