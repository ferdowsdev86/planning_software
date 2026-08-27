let accessGranted = false;

const scheduler = new Scheduler({
    appendTo   : targetElement,
    autoHeight : true,
    rowHeight  : 40,
    barMargin  : 4,
    flex       : 1,

    startDate : new Date(2018, 4, 6),
    endDate   : new Date(2018, 4, 13),

    viewPreset : {
        base            : 'dayAndWeek',
        timeColumnWidth : 30
    },

    columns : [
        { field : 'name', text : 'Name', width : 100 }
    ],

    resources : [
        { id : 1, name : 'Bernard' },
        { id : 2, name : 'Bianca' }
    ],

    events : [
        {
            id         : 1,
            resourceId : 1,
            name       : 'Right click me and the area behind me',
            startDate  : '2018-05-07',
            endDate    : '2018-05-12'
        }
    ],

    features : {
        eventMenu : {
            // Process event items before showing the menu
            processItems({ items, column, record }) {
                // Not possible to edit, delete, or change event assignments if there are no rights for it
                if (!accessGranted) {
                    items.editEvent     = false;
                    items.deleteEvent   = false;
                    items.unassignEvent = false;
                }
            }
        },
        scheduleMenu : {
            // Process schedule zone items before showing the menu
            processItems({ items }) {
                // Not possible to add new events if there are no rights for it
                if (!accessGranted) {
                    items.addEvent = false;
                }
            }
        }
    },

    tbar : [
        {
            text        : 'Limited rights',
            toggleable  : true,
            pressed     : !accessGranted,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            onToggle({ pressed }) {
                accessGranted = !pressed;
            }
        }
    ]
});
