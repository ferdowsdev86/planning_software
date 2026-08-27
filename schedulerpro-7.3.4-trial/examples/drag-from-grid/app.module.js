import shared from '../_shared/shared.module.js';
import { DateHelper, DomHelper, DragHelper, StringHelper, ResourceModel, SchedulerPro, EventModel, Grid, Splitter } from '../../build/schedulerpro.module.js';
//region "lib/Drag.js"

// Handles dragging unscheduled session from the grid onto the schedule
class Drag extends DragHelper {
    static get configurable() {
        return {
            callOnFunctions      : true,
            // Don't drag the actual row element, clone it
            cloneTarget          : true,
            autoSizeClonedTarget : false,
            // Only allow drops on the schedule area
            dropTargetSelector   : '.b-timeline-sub-grid',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector       : '.b-grid-row:not(.b-group-row)'
        };
    }

    afterConstruct(config) {
        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }

    createProxy(element) {
        const
            { schedule }                  = this,
            proxy                         = document.createElement('div'),
            session                       = this.grid.getRecordFromElement(element),
            { rowHeight, resourceMargin } = schedule,
            newSize                       = schedule.timeAxisViewModel.getDistanceForDuration(session.durationMS);

        // Make the drag proxy element look like an event bar
        proxy.classList.add('b-sch-event-wrap', 'b-style-tonal', 'b-unassigned-class', 'b-colorize');
        proxy.innerHTML = StringHelper.xss`
            <div class="b-sch-event b-has-content b-sch-event-with-icon">
                <div class="b-sch-event-content">
                    <i></i>
                    <span class="b-event-text-wrap">
                        <div>${session.name}</div>
                        <span>Required capacity: ${session.participants}</span>
                    </span>
                </div>
            </div>
        `;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (schedule.isHorizontal) {
            proxy.style.width  = `${newSize}px`;
            proxy.style.height = `${rowHeight - 2 * resourceMargin}px`;
        }
        else {
            proxy.style.height = `${newSize}px`;
            proxy.style.width  = `${schedule.resourceColumnWidth}px`;
        }
        return proxy;
    }

    onDragStart({ context }) {
        const
            { schedule } = this,
            session      = this.grid.getRecordFromElement(context.grabbed);

        // save a reference to the session being dragged so we can access it later
        context.session = session;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // Prevent tooltips from showing while dragging
        schedule.features.eventTooltip.disabled = true;
    }

    onDrag({ event, context }) {
        const
            { schedule }        = this,
            { session, target } = context,
            coordinate          = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            startDate           = schedule.getDateFromCoordinate(coordinate, 'round', false),
            endDate             = startDate && DateHelper.add(startDate, session.duration, session.durationUnit),
            validationIndicator = context.element.querySelector('i'),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            room                = context.room = schedule.resolveResourceRecord(target, [event.offsetX, event.offsetY]);

        // Don't allow drops everywhere, only allow drops if the drop is on the timeaxis and on top of a room
        if (startDate && room && room.capacity >= session.participants) {
            context.valid &= schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, room);
            validationIndicator.className = 'fa fa-fw fa-check';
        }
        else {
            context.valid                 = false;
            validationIndicator.className = 'fa fa-fw fa-times';
        }

        context.startDate = startDate;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned session to the real EventStore (if it's valid)
    async onDrop({ context }) {
        const
            me           = this,
            { schedule } = me,
            { session }  = context;

        schedule.disableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const targetSession = schedule.resolveEventRecord(context.target);

            // Dropped on a scheduled event, create a dependency between them
            if (targetSession) {
                schedule.dependencyStore.add({
                    fromEvent : targetSession,
                    toEvent   : session,
                    lag       : 30,
                    lagUnit   : 'minutes'
                });

                // Color them to signal they are linked
                targetSession.eventColor = 'orange';
                session.eventColor = 'orange';
            }

            // We hand over the data + existing element to the Scheduler so it do the scheduling
            await schedule.scheduleEvent({
                eventRecord    : session,
                startDate      : context.startDate,
                // Assign to the room (resource) it was dropped on
                resourceRecord : context.room
            });
        }

        schedule.features.eventTooltip.disabled = false;
    }
}

//endregion

//region "lib/Room.js"

// Custom Room model, based on ResourceModel with additional fields
class Room extends ResourceModel {
    static get fields() {
        return [
            'capacity',
            'equipment'
        ];
    }
}

//endregion

//region "lib/Schedule.js"

// Customized scheduler displaying sessions per room
class Schedule extends SchedulerPro {
    static $name = 'Schedule';

    static configurable = {
        features : {
            stripe       : true,
            stickyEvents : false,
            eventMenu    : {
                items : {
                    deleteEvent : {
                        text : 'Delete session'
                    },
                    unassignEvent : {
                        text : 'Unschedule session'
                    }
                }
            },
            taskEdit : {
                editorConfig : {
                    title : 'Session'
                },

                items : {
                    generalTab : {
                        title : 'Booking',
                        items : {
                            endDateField     : false,
                            percentDoneField : false,
                            resourcesField   : {
                                label : 'Room'
                            },
                            durationField : {
                                cls : ''
                            },
                            participantsField : {
                                type  : 'number',
                                label : 'Attending',
                                name  : 'participants'
                            },
                            clientField : {
                                type   : 'text',
                                label  : 'Client',
                                name   : 'client',
                                weight : 1
                            }
                        }
                    }
                }
            }
        },

        rowHeight  : 65,
        barMargin  : 5,
        eventStyle : 'tonal',

        columns : [
            {
                text  : 'Conference room',
                field : 'name',
                width : 170
            },
            {
                type    : 'number',
                text    : 'Capacity',
                field   : 'capacity',
                align   : 'right',
                width   : 95,
                step    : 1,
                bigStep : 10
            },
            {
                text       : 'Equipment',
                editor     : false,
                sortable   : false,
                groupable  : false,
                field      : 'equipment',
                width      : 120,
                htmlEncode : false,
                renderer({ record : room }) {
                    return room.equipment.map(item => ({
                        tag       : 'i',
                        className : `fa fa-${item}`,
                        dataset   : {
                            btip : {
                                microphone : 'Microphone',
                                headset    : 'Wireless headset',
                                video      : 'Video recording',
                                headphones : 'Headphones',
                                chalkboard : 'Whiteboard',
                                film       : 'Projector with HDMI',
                                tv         : 'TV with HDMI',
                                cat        : '?'
                            }[item]
                        }
                    }));
                }
            },
            {
                text     : 'Sessions',
                editor   : false,
                sortable : false,
                field    : 'events.length',
                align    : 'center',
                width    : 100
            }
        ],

        // Custom view preset with header configuration
        viewPreset : {
            base           : 'hourAndDay',
            columnLinesFor : 0,
            headers        : [
                {
                    unit       : 'd',
                    align      : 'center',
                    dateFormat : 'dddd'
                },
                {
                    unit       : 'h',
                    align      : 'center',
                    dateFormat : 'HH'
                }
            ]
        }
    };

    eventRenderer({ eventRecord : session, resourceRecord : room, renderData }) {
        // Icon depending on number of participants
        let icon = 'user';

        if (session.participants >= 100) {
            icon = 'users';
        }
        else if (session.participants >= 50) {
            icon = 'user-friends';
        }

        renderData.iconCls = `fa fa-${icon}`;

        // Flag with red if assigned to a room with to low capacity
        if (session.participants > room.capacity) {
            renderData.eventColor = 'red';
        }

        // Event contents
        return StringHelper.xss`<div>${session.name}</div><span>${session.client} - ${session.participants}p - ${
            session.duration} hours</span>`;
    }
}

//endregion

//region "lib/Session.js"

// Custom Session model, based on EventModel with additional fields and changed defaults
class Session extends EventModel {
    static get fields() {
        return [
            { name : 'participants', defaultValue : 0 },
            { name : 'client', defaultValue : '' }
        ];
    }

    static get defaults() {
        return {
            // In this demo, default duration for sessions will be hours (instead of days)
            durationUnit : 'h'
        };
    }
}

//endregion

//region "lib/UnplannedGrid.js"

// Custom grid that holds unassigned sessions
class UnplannedGrid extends Grid {
    static configurable = {
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [{
            text       : 'Unscheduled sessions',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            renderer   : ({ record : session }) => {
                let icon = 'user';

                if (session.participants >= 100) {
                    icon = 'users';
                }
                else if (session.participants >= 50) {
                    icon = 'user-friends';
                }

                return StringHelper.xss`<i class="fa fa-${icon}"></i>${session.name}`;
            }
        }, {
            icon     : 'fa fa-clock',
            width    : 70,
            align    : 'center',
            editor   : 'duration',
            field    : 'fullDuration',
            renderer : ({ record : session }) => StringHelper.xss`${session.duration} ${session.durationUnit}`
        }],

        rowHeight : 65,

        disableGridRowModelWarning : true
    };

    static $name = 'UnplannedGrid';

    set project(project) {
        // Create a chained version of the event store as our store. It will be filtered to only display events that
        // lack assignments
        this.store = project.eventStore.chain(eventRecord => !eventRecord.assignments.length);

        // When assignments change, update our chained store to reflect the changes
        project.assignmentStore.on({
            change() {
                this.store.fillFromMaster();
            },
            thisObj : this
        });
    }
}

//endregion

// Displays planned sessions
const schedule = new Schedule({
    ref        : 'schedule',
    appendTo   : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : new Date(2025, 11, 1, 8),
    endDate    : new Date(2025, 11, 1, 18),
    flex       : 1,
    project    : {
        autoLoad           : true,
        eventModelClass    : Session,
        resourceModelClass : Room,
        eventStore         : {
            id                    : 'sessions',
            removeUnassignedEvent : false
        },
        resourceStore : {
            id : 'rooms'
        },
        loadUrl : 'data/data.json'
    }
});

const splitter = new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});

// Holds unplanned sessions, that can be dragged to the schedule
const unplannedGrid = new UnplannedGrid({
    ref         : 'unplanned',
    appendTo    : 'main',
    collapsible : true,
    header      : false,
    flex        : '0 1 330px',
    project     : schedule.project
});

// Handles dragging
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
