var {
    SchedulerResourceModel,
    DateHelper,
    DragHelper,
    DomHelper,
    Toast,
    Tooltip,
    Combo,
    Scheduler,
    StringHelper,
    SchedulerEventModel,
    Grid,
    Splitter
} = window.bryntum.schedulerpro;
//region "lib/CustomResource.js"

class CustomResource extends SchedulerResourceModel {
    static $name = 'CustomResource';
    static fields = [
        // Do not persist `cls` field because we change its value on dragging unplanned resources to highlight the row
        {
            name    : 'cls',
            persist : false
        }];
    get nbrAssignedEvents() {
        return this.events.length;
    }
}

//endregion

//region "lib/Drag.js"

class Drag extends DragHelper {
    static configurable = {
        callOnFunctions      : true,
        // Don't drag the actual row element, clone it
        cloneTarget          : true,
        // We size the cloned element manually
        autoSizeClonedTarget : false,
        // Only allow drops on the schedule area
        dropTargetSelector   : '#main',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector       : '.b-sch-event-wrap'
    };
    afterConstruct() {
    // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = this.schedule.scrollManager;
    }
    createProxy(element) {
        const proxy = element.cloneNode(true),
            {
                schedule
            } = this,
            task = this.grid.getRecordFromElement(element),
            durationInPx = schedule.timeAxisViewModel.getDistanceForDuration(task.rawDurationMS);

        // Fake an event bar
        proxy.classList.add('b-color-green', 'b-unassigned-class', `b-sch-${schedule.mode}`);
        if (schedule.isHorizontal) {
            proxy.style.height = `${schedule.rowHeight - 2 * schedule.resourceMargin}px`;
            proxy.style.width = `${durationInPx}px`;
        }
        else {
            proxy.style.height = `${durationInPx}px`;
            proxy.style.width = `${schedule.resourceColumnWidth}px`;
        }
        return proxy;
    }
    onDragStart({
        context
    }) {
        const me = this,
            {
                schedule
            } = me,
            {
                eventTooltip,
                eventDrag
            } = schedule.features;

        // save a reference to the task so we can access it later
        context.task = me.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        eventTooltip.disabled = true;
        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);
        if (eventDrag.showTooltip && !me.tip) {
            me.tip = new Tooltip({
                align       : 'b-t',
                rootElement : document.body,
                forElement  : context.element,
                cls         : 'b-popup b-sch-event-tooltip'
            });
        }
    }
    onDrag({
        event,
        context
    }) {
        const me = this,
            {
                schedule
            } = me,
            {
                task,
                target,
                enteredSchedule
            } = context,
            isOverSchedule = target === null || target === undefined ? undefined : target.closest('.b-time-axis-sub-grid');
        let valid = !enteredSchedule;
        if (isOverSchedule) {
            const coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
                startDate = schedule.getDateFromCoordinate(coordinate, 'round', false, true),
                endDate = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
                // Coordinates required when used in vertical mode, since it does not use actual columns
                resource = target && schedule.resolveResourceRecord(target, [event.offsetX, event.offsetY]);
            context.enteredSchedule = true;

            // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
            valid = Boolean(startDate && resource) && (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));

            // Save reference to resource so we can use it in onTaskDrop
            context.resource = resource;
            context.startDate = startDate;
            if (me.tip) {
                const dateFormat = schedule.displayDateFormat,
                    formattedStartDate = DateHelper.format(startDate, dateFormat),
                    formattedEndDate = DateHelper.format(endDate, dateFormat);
                me.tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-start-date">Starts: ${formattedStartDate}</div>
                <div class="b-sch-tooltip-end-date">Ends: ${formattedEndDate}</div>
            `;
                me.tip.showBy(context.element);
            }
        }
        else {
            var _me$tip;
            (_me$tip = me.tip) === null || _me$tip === undefined || _me$tip.hide();
        }
        context.valid = valid;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onDrop({
        context,
        event
    }) {
        var _me$tip2;
        const me = this,
            {
                schedule
            } = me,
            {
                task,
                target,
                resource,
                valid,
                element,
                startDate
            } = context;
        (_me$tip2 = me.tip) === null || _me$tip2 === undefined || _me$tip2.hide();
        schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);
        context.valid = valid && target && startDate;

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid) {
            const coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = schedule.resolveEventRecord(target);

            // Remove from grid first so that the data change
            // below does not fire events into the grid.
            me.grid.store.remove(task);
            task.startDate = startDate;
            task.assign(resource);
            schedule.eventStore.add(task);

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                Toast.show(`Dropped on ${targetEventRecord.name}`);
            }
        }
        if (resource) {
            resource.cls = '';
        }
        schedule.features.eventTooltip.disabled = false;
    }
    set schedule(schedule) {
        this._schedule = schedule;

        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager;
    }
    get schedule() {
        return this._schedule;
    }
    onAbort() {
        var _this$tip;
        (_this$tip = this.tip) === null || _this$tip === undefined || _this$tip.hide();
    }
}

//endregion

//region "lib/IconCombo.js"

// Custom combo containing icons to pick from
class IconCombo extends Combo {
    static type = 'iconcombo';
    static configurable = {
        items : [{
            value : 'fa fa-asterisk',
            text  : 'Asterisk'
        }, {
            value : 'fa fa-fw fa-beer',
            text  : 'Beer'
        }, {
            value : 'fa fa-fw fa-book',
            text  : 'Book'
        }, {
            value : 'fa fa-fw fa-bug',
            text  : 'Bug'
        }, {
            value : 'fa fa-building',
            text  : 'Building'
        }, {
            value : 'fa fa-coffee',
            text  : 'Coffee'
        }, {
            value : 'fa fa-fw fa-cog',
            text  : 'Cog'
        }, {
            value : 'fa fa-fw fa-dumbbell',
            text  : 'Dumbbell'
        }, {
            value : 'fa fa-laptop',
            text  : 'Laptop'
        }, {
            value : 'fa fa-fw fa-plane',
            text  : 'Plane'
        }, {
            value : 'fa fa-fw fa-phone',
            text  : 'Phone'
        }, {
            value : 'fa fa-fw fa-question',
            text  : 'Question'
        }, {
            value : 'fa fa-fw fa-life-ring',
            text  : 'Ring'
        }, {
            value : 'fa fa-sync',
            text  : 'Sync'
        }, {
            value : 'fa fa-user',
            text  : 'User'
        }, {
            value : 'fa fa-users',
            text  : 'Users'
        }, {
            value : 'fa fa-video',
            text  : 'Video'
        }],
        listItemTpl : item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
    };
    syncInputFieldValue(...args) {
        this.icon.className = this.value;
        super.syncInputFieldValue(...args);
    }
    get innerElements() {
        return [{
            reference : 'icon',
            tag       : 'i',
            className : 'fa fa-cog',
            style     : {
                marginLeft  : '.8em',
                marginRight : '-.3em'
            }
        }, ...super.innerElements];
    }
}

// Register class to be able to create widget by type
IconCombo.initClass();

//endregion

//region "lib/Schedule.js"

class Schedule extends Scheduler {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'Schedule';

    // Factoryable type name
    static type = 'schedule';
    static configurable = {
    // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
        autoRescheduleTasks : false,
        eventStyle          : 'indented',
        rowHeight           : 72,
        barMargin           : 8,
        eventColor          : 'indigo',
        //allowOverlap : false,

        subGridConfigs : {
            locked : {
                width : 300
            },
            normal : {
                flex : 1
            }
        },
        features : {
            stickyEvents : false,
            stripe       : true,
            timeRanges   : true,
            eventMenu    : {
                items : {
                    // Custom item with inline handler
                    unassign : {
                        text   : 'Unassign',
                        icon   : 'fa fa-user-times',
                        weight : 200,
                        onItem : ({
                            eventRecord
                        }) => eventRecord.unassign()
                    }
                }
            },
            eventEdit : {
                items : {
                    nameField : {
                        required : true
                    },
                    // Custom field for picking icon
                    iconCls : {
                        type   : 'iconcombo',
                        // Name should match a record field, to read and write value from that field
                        name   : 'icon',
                        label  : 'Icon',
                        weight : 200
                    }
                }
            }
        },
        columns : [{
            type           : 'resourceInfo',
            text           : 'Name',
            flex           : 1,
            showEventCount : false,
            showRole       : true
        }, {
            text   : 'Nbr tasks',
            editor : false,
            width  : 100,
            align  : 'center',
            // A custom field added in the CustomResourceModel (see CustomResourceModel.js)
            field  : 'nbrAssignedEvents'
        }],
        // Custom view preset with header configuration
        viewPreset : {
            base           : 'hourAndDay',
            columnLinesFor : 0,
            headers        : [{
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            }, {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }]
        },
        // Only used in vertical mode
        resourceColumns : {
            columnWidth : 120
        },
        // Do not remove event when unassigning, we want to add it to grid instead
        removeUnassignedEvent : false,
        resourceImages        : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        }
    };
    updateAutoRescheduleTasks(autoRescheduleTasks) {
        this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
    eventRenderer({
        eventRecord,
        resourceRecord
    }) {
    // Event contents
        return StringHelper.xss`
            <div class="b-event-header"><span>${eventRecord.name}</span><i class="fa fa-${eventRecord.icon}"></i></div>
            <div class="b-event-footer"><span class="b-meta">${eventRecord.note}</span><span>${eventRecord.eventStartEndTimeString}</span></div>
    `;
    }
}
Schedule.initClass();

//endregion

//region "lib/Task.js"

class Task extends SchedulerEventModel {
    static $name = 'Task';
    static fields = [{
        name         : 'icon',
        defaultValue : 'fa fa-asterisk'
    }];
    static defaults = {
    // In this demo, default duration for tasks will be hours (instead of days)
        durationUnit : 'h',
        // Use a default name, for better look in the grid if unassigning a new event
        name         : 'New event'
    };
    get eventStartEndTimeString() {
        return `${DateHelper.format(this.startDate, 'LT')} - ${DateHelper.format(this.endDate, 'LT')}`;
    }
}

//endregion

//region "lib/UnplannedGrid.js"

class UnplannedGrid extends Grid {
    /**
   * Original class name getter. See Widget.$name docs for the details.
   * @returns {string}
   */
    static $name = 'UnplannedGrid';

    // Factoryable type name
    static type = 'unplannedgrid';
    static configurable = {
        rowHeight : 80,
        readOnly  : true,
        rowLines  : false,
        features  : {
            sort : 'name'
        },
        columns : [{
            type       : 'template',
            text       : 'Tasks',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            minWidth   : 200,
            template   : ({
                record: eventRecord
            }) => StringHelper.xss`
            <div class="b-sch-event-wrap b-style-indented b-colorize b-color-none">
                <div class="b-sch-event">
                    <div class="b-sch-event-content">
                        <div class="b-event-header"><span>${eventRecord.isPhantom ? '#' : eventRecord.id} ${eventRecord.name}</span></div>
                        <div class="b-event-footer"><span class="b-meta">${eventRecord.note}</span><span>${eventRecord.duration} ${eventRecord.durationUnit}</span></div>
                    </div>
                </div>
            </div>
        `
        }]
    };
}

// Register this widget type with its Factory
UnplannedGrid.initClass();

//endregion

const schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2025, 11, 1, 8),
    endDate     : new Date(2025, 11, 1, 18),
    flex        : 4,
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : CustomResource
        },
        loadUrl : 'data/data.json'
    },
    tbar : ['Schedule view']
});
new Splitter({
    appendTo    : 'main',
    showButtons : 'end'
});
const unplannedGrid = new UnplannedGrid({
    ref         : 'unplanned',
    appendTo    : 'main',
    title       : 'Unplanned Tasks',
    collapsible : true,
    flex        : '0 0 300px',
    ui          : 'toolbar',
    hideHeaders : true,
    // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
    project     : schedule.project,
    store       : {
        modelClass          : Task,
        reapplySortersOnAdd : true,
        readUrl             : 'data/unplanned.json',
        autoLoad            : true
    }
});
const drag = new Drag({
    grid         : unplannedGrid,
    schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
schedule.assignmentStore.on({
    // When a task is unassigned move it back to the unplanned tasks grid
    remove({
        records
    }) {
        records.forEach(({
            event
        }) => {
            schedule.eventStore.remove(event);
            unplannedGrid.store.add(event);
        });
    },
    thisObj : undefined
});