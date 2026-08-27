var {
    SchedulerResourceModel,
    SchedulerEventModel,
    DateHelper,
    Scheduler,
    Toast,
    MessageDialog,
    StringHelper
} = window.bryntum.schedulerpro;
//region "lib/Employee.js"

class Employee extends SchedulerResourceModel {
    static get fields() {
        return [{
            name         : 'available',
            type         : 'boolean',
            defaultValue : true
        }, {
            name         : 'statusMessage',
            defaultValue : 'Gone fishing'
        }];
    }
    get cls() {
        return this.available ? '' : 'unavailable';
    }
}

//endregion

//region "lib/Task.js"

class Task extends SchedulerEventModel {
    static get fields() {
        return ['type'];
    }
    get dragValidationText() {
        const {
            resource,
            type
        } = this;
        let result = '';
        switch (type) {
            case 'Golf':
                result = 'Only C-suite people can play Golf';
                break;
            case 'Meeting':
                result = `Only ${resource.role} can participate in meetings`;
                break;
            case 'Coding':
                result = `Only ${resource.role} can do coding`;
                break;
            case 'Sales':
                result = `Only ${resource.role} can prepare marketing strategies`;
                break;
            case 'Fixed':
                result = 'Fixed time event - may be reassigned, but not rescheduled';
                break;
        }
        return result;
    }
    get resizeValidationText() {
        let result = '';
        switch (this.type) {
            case 'Golf':
                result = 'Golf game has always fixed duration';
                break;
            case 'Coding':
                result = 'Programming task duration cannot be shortened';
                break;
        }
        return result;
    }
}

//endregion

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    // Uncomment to not allow tasks to overlap for any resource
    // allowOverlap      : false,
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        stripe       : true,
        timeRanges   : true,
        eventTooltip : {
            template : data => {
                const task = data.eventRecord;
                return `
                    ${task.name ? StringHelper.xss`<div class="b-sch-event-title">${task.name}</div>` : ''}
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                    ${task.dragValidationText || task.resizeValidationText ? `<div class="restriction-title"><b>Restrictions:</b></div>
                    <ul class="restriction-list">
                        ${task.dragValidationText ? `<li>${task.dragValidationText}</li>` : ''}
                        ${task.resizeValidationText ? `<li>${task.resizeValidationText}</li>` : ''}
                    </ul>` : ''}
                `;
            }
        },
        eventDrag : {
            validatorFn({
                eventRecords,
                newResource
            }) {
                const task = eventRecords[0],
                    isValid = task.type === 'Fixed' ||
          // Only C-suite people can play Golf
          task.type === 'Golf' && ['CEO', 'CTO'].includes(newResource.role) ||
          // Tasks that have type defined cannot be assigned to another resource type
          !(task.type && newResource.role !== task.resource.role);
                return {
                    valid   : newResource.available && isValid,
                    message : !newResource.available ? newResource.statusMessage : !isValid ? task.dragValidationText : ''
                };
            }
        },
        eventResize : {
            validatorFn({
                eventRecord: task,
                endDate,
                startDate
            }) {
                const originalDuration = task.endDate - task.startDate,
                    isValid = !(task.type === 'Golf' || task.type === 'Coding' && originalDuration > endDate - startDate);
                return {
                    valid   : isValid,
                    message : isValid ? '' : task.resizeValidationText
                };
            }
        },
        eventDragCreate : {
            validatorFn({
                resourceRecord: resource
            }) {
                return {
                    valid   : resource.available,
                    message : resource.available ? '' : resource.statusMessage
                };
            }
        }
    },
    subGridConfigs : {
        locked : {
            width : 500
        }
    },
    columns : [{
        type : 'resourceInfo',
        text : 'Staff'
    }, {
        text   : 'Role',
        field  : 'role',
        flex   : 1,
        editor : {
            type        : 'combo',
            items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
            editable    : false,
            pickerWidth : 140
        }
    }, {
        text  : 'Allow overlap',
        type  : 'check',
        field : 'allowOverlap',
        width : 140
    }, {
        text  : 'Available',
        type  : 'check',
        field : 'available'
    }],
    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        resourceStore : {
            modelClass : Employee
        },
        loadUrl          : 'data/data.json',
        // This config enables CrudManager responses validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    barMargin  : 2,
    rowHeight  : 50,
    startDate  : new Date(2019, 1, 7, 8),
    endDate    : new Date(2019, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },
    multiEventSelect : true,
    // Specialized event bar template with header and footer
    eventRenderer({
        eventRecord
    }) {
        return StringHelper.xss`
            <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
            <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
        `;
    },
    listeners : {
        beforeEventAdd({
            resourceRecords
        }) {
            const [resource] = resourceRecords,
                available = resource.available;
            if (!available) {
                Toast.show(`Resource not available: ${resource.statusMessage}`);
            }
            return available;
        },
        async beforeEventSave({
            source: scheduler,
            context,
            eventRecord
        }) {
            if (scheduler.confirmationsEnabled) {
                context.async = true;
                const result = await MessageDialog.confirm({
                    title   : 'Please confirm',
                    message : `Do you want to save changes to the '${eventRecord.name}' event?`
                });
                context.finalize(result === MessageDialog.yesButton);
            }
        },
        beforeEventDrag({
            eventRecord
        }) {
            // Only Henrik can be assigned Marketing tasks.
            // constrainDragToResource prevents dragging up or down.
            scheduler.features.eventDrag.constrainDragToResource = eventRecord.type === 'Marketing' && eventRecord.resource.name === 'Henrik';

            // Events with type Fixed must not change time slot.
            scheduler.features.eventDrag.constrainDragToTimeSlot = eventRecord.type === 'Fixed';
        },
        async beforeEventDropFinalize({
            source: scheduler,
            context
        }) {
            if (scheduler.confirmationsEnabled) {
                context.async = true;
                const namesInQuotes = context.eventRecords.map(eventRecord => `"${StringHelper.encodeHtml(eventRecord.name)}"`),
                    result = await MessageDialog.confirm({
                        title   : 'Please confirm',
                        message : `${namesInQuotes.join(', ')} ${namesInQuotes.length > 1 ? 'were' : 'was'} moved. Allow this operation?`
                    });

                // `true` to accept the changes or `false` to reject them
                context.finalize(result === MessageDialog.yesButton);
            }
        },
        async beforeEventResizeFinalize({
            source: scheduler,
            context
        }) {
            if (scheduler.confirmationsEnabled) {
                context.async = true;
                const eventRecord = context.eventRecord,
                    result = await MessageDialog.confirm({
                        title   : 'Please confirm',
                        message : StringHelper.xss`"${eventRecord.name}" duration changed. Allow this operation?`
                    });

                // `true` to accept the changes or `false` to reject them
                context.finalize(result === MessageDialog.yesButton);
            }
        }
    },
    tbar : [{
        type     : 'slidetoggle',
        ref      : 'confirmationToggle',
        text     : 'Enable confirmations',
        onChange : ({
            checked
        }) => scheduler.confirmationsEnabled = checked
    }, {
        type       : 'slidetoggle',
        ref        : 'lockToggle',
        text       : 'Read only',
        toggleable : true,
        onChange   : ({
            checked
        }) => scheduler.readOnly = checked
    }]
});