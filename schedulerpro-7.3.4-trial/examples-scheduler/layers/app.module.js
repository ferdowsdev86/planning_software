import shared from '../_shared/shared.module.js';
import { Scheduler } from '../../build/schedulerpro.module.js';

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2023, 11, 31),
    endDate        : new Date(2024, 0, 30),
    visibleDate    : new Date(2023, 11, 31),
    resourceMargin : 30,
    rowHeight      : 95,
    eventColor     : 'light-green',
    eventStyle     : 'filled',

    resources : [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda' },
        { id : 'r3', name : 'Don' },
        { id : 'r4', name : 'Karen' },
        { id : 'r5', name : 'Doug' },
        { id : 'r6', name : 'Peter' },
        { id : 'r7', name : 'Sam' },
        { id : 'r8', name : 'Melissa' },
        { id : 'r9', name : 'John' },
        { id : 'r10', name : 'Ellen' }
    ],

    events : [
        {
            id           : 1,
            resourceId   : 'r1',
            startDate    : new Date(2024, 0, 1),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Meeting',
            iconCls      : 'fa fa-calendar'
        },
        {
            id           : 2,
            resourceId   : 'r2',
            startDate    : new Date(2024, 0, 1),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Appointment',
            iconCls      : 'fa fa-clock'
        },
        {
            id           : 3,
            resourceId   : 'r3',
            startDate    : new Date(2024, 0, 2),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Reminder',
            eventColor   : 'orange',
            iconCls      : 'fa fa-bell'
        },
        {
            id           : 4,
            resourceId   : 'r4',
            startDate    : new Date(2024, 0, 2),
            duration     : 5,
            durationUnit : 'd',
            name         : 'Conference',
            iconCls      : 'fa fa-users'
        },
        {
            id           : 5,
            resourceId   : 'r5',
            startDate    : new Date(2024, 0, 8),
            duration     : 4,
            durationUnit : 'd',
            name         : 'Convention',
            iconCls      : 'fa fa-user-astronaut'
        },
        {
            id           : 6,
            resourceId   : 'r6',
            startDate    : new Date(2024, 0, 6),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Summit',
            iconCls      : 'fa fa-calendar-days',
            eventColor   : 'orange'
        },
        {
            id           : 7,
            resourceId   : 'r6',
            startDate    : new Date(2024, 0, 4),
            duration     : 3,
            durationUnit : 'd',
            name         : 'Conclave',
            iconCls      : 'fa fa-calendar-day'
        },
        {
            id           : 8,
            resourceId   : 'r7',
            startDate    : new Date(2024, 0, 3),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Consultation',
            iconCls      : 'fa fa-user-secret'
        },
        {
            id           : 9,
            resourceId   : 'r1',
            startDate    : new Date(2024, 0, 22),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Consultation',
            iconCls      : 'fa fa-user-secret'
        },
        {
            id           : 10,
            resourceId   : 'r2',
            startDate    : new Date(2024, 0, 18),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Conclave',
            iconCls      : 'fa fa-calendar-days'
        },
        {
            id           : 11,
            resourceId   : 'r1',
            startDate    : new Date(2024, 0, 8),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Conference',
            iconCls      : 'fa fa-users'
        }
    ],

    timeRanges : [
        {
            id           : 1,
            startDate    : new Date(2024, 0, 3),
            duration     : 2,
            durationUnit : 'd',
            cls          : 'audit',
            name         : 'Time Range'
        },
        {
            id        : 2,
            startDate : new Date(2024, 0, 6),
            name      : 'Line'
        }
    ],

    resourceTimeRanges : [
        {
            id           : 1,
            resourceId   : 'r4',
            startDate    : new Date(2024, 0, 1),
            duration     : 2,
            durationUnit : 'd',
            name         : 'Resource Time Range'
        },
        {
            id           : 2,
            resourceId   : 'r5',
            startDate    : new Date(2024, 0, 5),
            duration     : 1,
            durationUnit : 'd',
            name         : 'Time Off'
        }
    ],

    dependencies : [
        { id : 1, from : 1, to : 3 },
        { id : 2, from : 4, to : 6 },
        { id : 3, from : 3, to : 4 }
    ],

    columns : [
        { field : 'name', text : 'Name', width : 250 }
    ],

    viewPreset : 'weekAndDay',

    features : {
        dependencies       : true,
        nonWorkingTime     : true,
        resourceTimeRanges : true,
        timeRanges         : {
            enableResizing : true
        },
        scrollButtons : {
            labelRenderer({ nbrEvents }) {
                return nbrEvents;
            }
        }
    },

    strips : {
        right : {
            type        : 'panel',
            title       : 'Layers',
            dock        : 'right',
            collapsible : true,
            width       : '22em',
            cls         : 'b-sidebar',
            scrollable  : { overflowY : true },
            defaults    : {
                labelPosition : 'above',
                width         : '15em'
            },
            items : {
                list : {
                    type        : 'list',
                    flex        : 1,
                    multiSelect : true,
                    itemTpl     : record => `<span>${record.text}</span><i class="fa fa-chevron-up" data-noselect></i><i class="fa fa-chevron-down" data-noselect></i>`,
                    selected    : [1, 2, 3, 4, 5, 6, 7, 8],
                    items       : [
                        { id : 1, text : 'Time range lines', selector : '.b-sch-time-ranges-canvas .b-sch-line' },
                        { id : 2, text : 'Task bars', selector : '.b-sch-foreground-canvas' },
                        { id : 3, text : 'Dependency lines', selector : '.b-sch-dependencies-canvas' },
                        { id : 4, text : 'Resource ranges', selector : '.b-resource-time-range-canvas' },
                        { id : 5, text : 'Time ranges', selector : '.b-sch-time-ranges-canvas .b-sch-time-range:not(.b-sch-line)' },
                        { id : 6, text : 'Row elements', selector : '.b-time-axis-sub-grid .b-grid-row' },
                        { id : 7, text : 'Nonworking time', selector : '.b-sch-non-working-time' },
                        { id : 8, text : 'Time axis tick lines', selector : '.b-column-lines-canvas' }
                    ],
                    onItem            : 'up.onListItemClick',
                    onSelectionChange : 'up.onListSelectionChange'
                }
            }
        }
    },

    onListItemClick({ source : list, index, record, event }) {
        const { store } = list;

        if (event.target.matches('.fa-chevron-up')) {
            if (index > 0) {
                store.move(record, store.getAt(index - 1));
                this.applyZIndexes(store);
            }
        }
        else if (event.target.matches('.fa-chevron-down')) {
            if (index < store.count - 1) {
                store.move(record, store.getAt(index + 2));
                this.applyZIndexes(store);
            }
        }
    },

    onListSelectionChange({ source : list, selected }) {
        if (this.element) {
            // Highlight selected canvas
            this.element.querySelectorAll('.b-disabled').forEach(el => el.classList.remove('b-disabled'));

            list.store.forEach(item => {
                if (!list.selected.includes(item)) {
                    this.element.querySelectorAll(item.selector).forEach(el => el.classList.add('b-disabled'));
                }
            });
        }
    },

    applyZIndexes(store) {
        store.forEach((record, index) => {
            this.element.querySelectorAll(record.selector).forEach(el => el.style.zIndex = 1000 - index);
        });
    }
});
