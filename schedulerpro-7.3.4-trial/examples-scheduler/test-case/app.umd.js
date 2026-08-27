var {
    Scheduler
} = window.bryntum.schedulerpro;

// Each team gets their own event color
const colors = {
    DevOps : 'pink',
    Devs   : 'blue',
    Sales  : 'deep-orange'
};
const scheduler = new Scheduler({
    appendTo    : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom  : true,
    startDate   : new Date(2022, 8, 18),
    endDate     : new Date(2022, 8, 25),
    barMargin   : 10,
    rowHeight   : 130,
    eventLayout : 'pack',
    eventStyle  : 'indented',
    tickSize    : 100,
    features    : {
        columnLines : false,
        group       : {
            // Group by team initially
            field : 'team',
            // Make group headers have a lower height than resource rows
            renderer({
                size
            }) {
                size.height = 40;
            }
        }
    },
    columns : [
        // Hidden team column, grouped by it initially
        {
            text   : 'Team',
            field  : 'team',
            hidden : true
        },
        // Employee column with customized content
        {
            text  : 'Employee',
            field : 'name',
            width : 270,
            renderer({
                record
            }) {
                if (!record.isSpecialRow) {
                    const
                        // Amount of assigned events
                        taskCount = record.events.length,
                        // Their total duration (this simple calculation only works if they use the same durationUnit)
                        totalDuration = record.events.reduce((sum, e) => sum += e.duration, 0);
                    return {
                        className : 'employee',
                        children  : [
                            // Employee image
                            {
                                tag       : record.image ? 'img' : 'div',
                                alt       : record.image ? record.name : undefined,
                                className : `b-bryntum b-color-${colors[record.team] ?? 'blue'}`,
                                src       : record.image && '../_shared/images/transparent-users/' + record.image
                            },
                            // Employee info
                            {
                                className : 'name',
                                text      : record.name
                            }, {
                                className : 'role',
                                text      : record.role
                            }, {
                                className : 'team',
                                text      : record.team
                            },
                            // Assignment info
                            {
                                tag       : 'i',
                                className : 'tasks fa fa-tasks',
                                dataset   : {
                                    btip : `${taskCount} assigned task${taskCount !== 1 ? 's' : ''}`
                                },
                                text : taskCount
                            }, {
                                tag       : 'i',
                                className : 'duration fa fa-clock',
                                dataset   : {
                                    btip : `Total task duration ${totalDuration} days`
                                },
                                text : totalDuration
                            }]
                    };
                }
            }
        }],
    // Custom event renderer, to manipulate event styling and content
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
    // When there is no color explicitly defined, use the teams color
        if (!eventRecord.eventColor) {
            renderData.eventColor = colors[resourceRecord.team] ?? 'pink';
        }

        // Custom contents, event name, names of assigned employees if multiple, duration
        return {
            className : 'info',
            children  : [{
                className : 'title',
                text      : eventRecord.name
            }, eventRecord.resources.length > 1 ? {
                className : 'assigned',
                text      : eventRecord.resources.map(r => r.name).join(', ')
            } : null, {
                className : 'event-duration',
                text      : eventRecord.duration + eventRecord.durationUnit[0]
            }]
        };
    },
    // Using CrudManager to load data (will be inlined when it creates the test app)
    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        resourceStore : {
            // Additional resource fields
            fields : ['team', 'role']
        }
    },
    tbar : [
        // Button to download the basis for a test case when reporting an issue to Bryntum's support forum
        {
            text : 'Download test case',
            icon : 'fa fa-download',
            cls  : 'b-skip-test',
            onClick() {
                scheduler.downloadTestCase();
            }
        },
        // Button that logs the test case to console instead of downloading it
        {
            text : 'Log test case',
            icon : 'fa fa-terminal',
            cls  : 'b-skip-test',
            onClick() {
                console.log(scheduler.getTestCase());
            }
        }]
});