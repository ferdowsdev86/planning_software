var {
    SchedulerPro,
    EventModel,
    StringHelper,
    DateHelper
} = window.bryntum.schedulerpro;
class Task extends EventModel {
    static fields = [{
        name         : 'durationUnit',
        defaultValue : 'h'
    }, {
        name : 'plannedStartDate',
        type : 'date'
    }, {
        name : 'plannedEndDate',
        type : 'date'
    }, {
        name : 'actualStartDate',
        type : 'date'
    }, {
        name : 'actualEndDate',
        type : 'date'
    }, {
        name       : 'startDate',
        dataSource : 'actualStartDate'
    }, {
        name       : 'endDate',
        dataSource : 'actualEndDate'
    }];
}
class MyScheduler extends SchedulerPro {
    static type = 'actualplannedschedule';
    get resourceTimeRangeColor() {
        return this.showPlanned ? this.actualColorCls : this.plannedColorCls;
    }
    get eventColor() {
        return this.showPlanned ? this.plannedColor : this.actualColor;
    }
    set eventColor(value) {
        super.eventColor = value;
    }
    static configurable = {
        plannedColorCls : 'planned-color',
        actualColorCls  : 'actual-color',
        plannedColor    : 'gray',
        actualColor     : 'blue',
        showPlanned     : false,
        features        : {
            taskEdit : {
                editorConfig : {
                    // Editor needs to be wider than the default, to fit the longer labels
                    width : '36em'
                },
                items : {
                    generalTab : {
                        items : {
                            durationField    : false,
                            effortField      : false,
                            percentDoneField : false,
                            // New datafields for planned start / end date
                            newStartField    : {
                                type      : 'dateTimefield',
                                weight    : 410,
                                label     : 'Planned start',
                                name      : 'plannedStartDate',
                                timeField : {
                                    step : '1 hours'
                                },
                                listeners : {
                                    change : 'up.isValidateDate'
                                }
                            },
                            newEndField : {
                                type      : 'dateTimefield',
                                weight    : 510,
                                label     : 'Planned finish',
                                name      : 'plannedEndDate',
                                timeField : {
                                    step : '1 hours'
                                },
                                listeners : {
                                    change : 'up.isValidateDate'
                                }
                            }
                        }
                    }
                }
            },
            resourceTimeRanges : {
                enableMouseEvents : false
            },
            eventTooltip : {
                template({
                    eventRecord
                }) {
                    return `
                        <div class="field"><label>Task</label><span>${StringHelper.encodeHtml(eventRecord.name)}</span></div>
                        <div class="field"><label>Assigned to</label><span>${StringHelper.encodeHtml(eventRecord.resource.name)}</span></div>
                        <div class="field"><label>Planned start</label><span>${DateHelper.format(eventRecord.plannedStartDate, 'MMM DD HH:mm')}</span></div>
                        <div class="field"><label>Planned end</label><span>${DateHelper.format(eventRecord.plannedEndDate, 'MMM DD HH:mm')}</span></div>
                        <div class="field"><label>Actual start</label><span>${DateHelper.format(eventRecord.actualStartDate, 'MMM DD HH:mm')}</span></div>
                        <div class="field"><label>Actual end</label><span>${DateHelper.format(eventRecord.actualEndDate, 'MMM DD HH:mm')}</span></div>
                    `;
                }
            }
        },
        rowHeight      : 70,
        barMargin      : 15,
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        eventColor : 'blue',
        eventStyle : 'filled',
        viewPreset : 'hourAndDay',
        columns    : [
            // A column using a custom render to display an icon + text
            {
                text       : 'Property',
                width      : 180,
                field      : 'name',
                // We want to use custom markup
                htmlEncode : false,
                // Renderer that returns a DOM config object, a more performant way than returning a html string, allows
                // reusing elements as cells are re-rendered
                renderer   : ({
                    record
                }) => ({
                    children : [
                        // <i> tag with the icon
                        {
                            tag       : 'i',
                            className : record.iconCls
                        },
                        // text node with the name
                        record.name]
                })
            }],
        listeners : {
            eventMouseEnter({
                source,
                eventRecord,
                assignmentRecord
            }) {
                const rId = `rtr_${assignmentRecord.id}`;
                source.resourceTimeRangeStore.data = [{
                    id         : rId,
                    cls        : this.resourceTimeRangeColor,
                    resourceId : assignmentRecord.resourceId,
                    startDate  : source.showPlanned ? eventRecord.actualStartDate : eventRecord.plannedStartDate,
                    endDate    : source.showPlanned ? eventRecord.actualEndDate : eventRecord.plannedEndDate,
                    name       : eventRecord.name
                }];

                // it will trigger opacity transition
                source.resourceTimeRangeStore.first.cls += ' shown';
            },
            eventMouseLeave({
                source
            }) {
                // it will trigger opacity transition
                if (source.resourceTimeRangeStore.first) {
                    source.resourceTimeRangeStore.first.cls = this.resourceTimeRangeColor;
                }
            },
            beforeTaskEdit({
                source,
                taskEdit
            }) {
                const {
                    startDateField,
                    endDateField,
                    newStartField,
                    newEndField
                } = taskEdit.editor.widgetMap;

                // It needs to update label and name of start / end date datafields by considering the plannedToggle value
                if (source.showPlanned) {
                    startDateField.label = 'Planned start';
                    endDateField.label = 'Planned finish';
                    newStartField.label = 'Actual start';
                    newStartField.name = 'actualStartDate';
                    newEndField.label = 'Actual finish';
                    newEndField.name = 'actualEndDate';
                }
                else {
                    startDateField.label = 'Actual start';
                    endDateField.label = 'Actual finish';
                    newStartField.label = 'Planned start';
                    newStartField.name = 'plannedStartDate';
                    newEndField.label = 'Planned finish';
                    newEndField.name = 'plannedEndDate';
                }
            }
        },
        tbar : [{
            type     : 'slidetoggle',
            ref      : 'plannedToggle',
            text     : 'View Planned dates',
            onChange : 'up.onToggleDates'
        }]
    };
    updateShowPlanned(value) {
        const me = this,
            {
                eventStore
            } = me,
            {
                fieldMap
            } = eventStore.modelClass;
        let startDateDataSource, endDateDataSource;
        if (value) {
            startDateDataSource = 'plannedStartDate';
            endDateDataSource = 'plannedEndDate';
        }
        else {
            startDateDataSource = 'actualStartDate';
            endDateDataSource = 'actualEndDate';
        }

        // Toggle fields if needed
        if (startDateDataSource !== fieldMap.startDate.dataSource) {
            fieldMap.startDate.dataSource = startDateDataSource;
            fieldMap.endDate.dataSource = endDateDataSource;

            // Duration should be recalculated taking into account new start / end dates that could be changed in the task editor.
            me.suspendRefresh();
            me.eventStore.forEach(e => e.duration = undefined);
            me.resumeRefresh(false);
            me.runWithTransition(() => eventStore.data = eventStore.toJSON());
        }
    }
    onToggleDates({
        value
    }) {
        this.showPlanned = value;
    }
    isValidateDate({
        source,
        oldValue
    }) {
        var _newStartField$value, _newEndField$value;
        const {
            newStartField,
            newEndField
        } = this.taskEdit.editor.widgetMap;
        if (oldValue && ((_newStartField$value = newStartField.value) === null || _newStartField$value === undefined ? undefined : _newStartField$value.getTime()) >= ((_newEndField$value = newEndField.value) === null || _newEndField$value === undefined ? undefined : _newEndField$value.getTime())) {
            if (source === newStartField) {
                newEndField.value = source.value;
            }
            else {
                newStartField.value = source.value;
            }
        }
    }
}
const myScheduler = new MyScheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    startDate  : '2024-03-11T06:00',
    endDate    : '2024-03-11T20:00',
    project    : {
        autoLoad               : true,
        // Constraint should not be set when event date changes, because when switching actual / planned mode,
        // constraint date has prio over the start date. If constraint date is needed, consider to add and manage the
        // corresponding actualConstraintDate / plannedConstraintDate fields.
        addConstraintOnDateSet : false,
        eventStore             : {
            modelClass : Task,
            // Opt out of using raw data, need to clone the incoming data objects for the way this demo maps multiple
            // fields to the same datasource to work
            useRawData : false
        },
        loadUrl : './data/data.json'
    }
});