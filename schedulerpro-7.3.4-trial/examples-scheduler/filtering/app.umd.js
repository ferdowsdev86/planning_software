var {
    DateHelper,
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;
const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : 'traced',
    eventColor : null,
    features   : {
        filterBar  : true,
        stripe     : true,
        timeRanges : true,
        eventEdit  : {
            items : {
                location : {
                    weight  : 210,
                    // After resource
                    type    : 'text',
                    name    : 'location',
                    label   : 'Location',
                    dataset : {
                        eventType : 'Meeting'
                    }
                }
            }
        }
    },
    columns : [{
        type  : 'resourceInfo',
        text  : 'Staff',
        width : 170
    }, {
        text   : 'Role',
        field  : 'role',
        width  : 140,
        editor : {
            type        : 'combo',
            items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
            editable    : false,
            pickerWidth : 140
        }
    }],
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },
    barMargin      : 5,
    rowHeight      : 55,
    startDate      : new Date(2017, 1, 7, 8),
    endDate        : new Date(2017, 1, 7, 18),
    viewPreset     : 'hourAndDay',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    // Specialized event bar template with header and footer
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        renderData.style = 'background-color:' + resourceRecord.color;
        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, this.displayDateFormat)}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    },
    tbar : ['->',
        // Right align toolbar items
        {
            type                 : 'textfield',
            ref                  : 'filterByName',
            icon                 : 'fa fa-filter',
            placeholder          : 'Find tasks by name',
            clearable            : true,
            width                : '15em',
            keyStrokeChangeDelay : 100,
            triggers             : {
                filter : {
                    align : 'start',
                    cls   : 'fa fa-filter'
                }
            },
            onChange({
                value
            }) {
                value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Replace all previous filters and set a new filter
                scheduler.eventStore.filter({
                    filters : event => event.name.match(new RegExp(value, 'i')),
                    replace : true
                });

                /*
              // The code above is a one-liner version of:
               // Remove all previous filters
              scheduler.eventStore.clearFilters();
               // Set a new filter
              scheduler.eventStore.filter(event => event.name.match(new RegExp(value, 'i')));
               // Having `replace` provided makes the filter config go to the nested `filters` property,
              // see more in the Store.filter docs
          */
            }
        }, {
            type                 : 'textfield',
            ref                  : 'highlight',
            placeholder          : 'Highlight tasks',
            clearable            : true,
            width                : '15em',
            keyStrokeChangeDelay : 200,
            triggers             : {
                filter : {
                    align : 'start',
                    cls   : 'fa fa-search'
                }
            },
            onChange({
                value
            }) {
                if (value !== null && value !== undefined && value.length) {
                    const tasksToHighlight = scheduler.eventStore.query(task => task.name.toLowerCase().includes(value.toLowerCase()));
                    scheduler.highlightEvents({
                        events            : tasksToHighlight,
                        unhighlightOthers : true
                    });
                }
                else {
                    scheduler.unhighlightEvents();
                }
            }
        }]
});