var {
    SchedulerPro
} = window.bryntum.schedulerpro;
const scheduler = new SchedulerPro({
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },
    appendTo              : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom            : true,
    startDate             : '2020-03-23',
    endDate               : '2020-03-24',
    rowHeight             : 60,
    barMargin             : 15,
    eventStyle            : 'indented',
    viewPreset            : 'hourAndDay',
    highlightSuccessors   : true,
    highlightPredecessors : true,
    features              : {
        dependencies : {
            highlightDependenciesOnEventHover : true
        },
        dependencyEdit : {
            // Allow editing lag in the dependency editor
            showLagField : true
        },
        eventDrag : {
            // Prevent reassigning events using drag and drop
            constrainDragToResource : true
        },
        resourceTimeRanges : true
    },
    columns : [
        // A column using a custom render to display an icon + text
        {
            text       : 'Resource',
            width      : 150,
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
                    record.icon ? {
                        tag       : 'i',
                        className : `fa fa-fw ${record.icon}`,
                        style     : 'margin-right: .5em'
                    } : null,
                    // text node with the name
                    record.name]
            })
        }],
    tbar : {
        cls   : 'b-demo-toolbar',
        items : {
            addInvalidDep : {
                text : 'Add invalid dependency',
                icon : 'fa fa-bug',
                cls  : 'b-invalid-dependency-button',
                onClick() {
                    // Here we add an invalid dependency linking "Arrive" event to itself
                    // which naturally building a cycle..
                    // This action triggers event rescheduling which then detects the cycle
                    // and informs user about it.

                    scheduler.dependencyStore.add({
                        fromEvent : 1,
                        toEvent   : 1
                    });
                }
            },
            addInvalidCal : {
                text : 'Add invalid calendar',
                icon : 'fa fa-bug',
                cls  : 'b-invalid-calendar-button',
                onClick() {
                    // Here we add an invalid calendar and assign it to "Arrive #2" event.
                    // The calendar has no working intervals and thus cannot be used for scheduling,
                    // Assigning of the calendar triggers event rescheduling which then detects the issue
                    // and informs user about it.

                    const [calendar] = scheduler.calendarManagerStore.add({
                        name                     : 'Foo',
                        // we setup a global not working interval on the calendar but
                        // not provide any single working one so the calendar has zero working periods
                        unspecifiedTimeIsWorking : false
                    });
                    scheduler.eventStore.getById(5).calendar = calendar;
                }
            }
        }
    }
});