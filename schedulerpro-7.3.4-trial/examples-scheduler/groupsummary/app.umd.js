var {
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;
const maxValue = 10;
const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'tonal',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
    //stripe       : true,
        group        : 'category',
        sort         : 'name',
        groupSummary : {
            collapseToHeader : true,
            /**
       * This template method produces content shown in a custom group summary tooltip.
       * Rendered summary cell values and labels can be accessed in the `groupSummaryValues` array.
       **/
            tooltipTemplate  : ({
                groupSummaryValues,
                startDate,
                groupValue
            }) => `
                <header>${groupValue} at ${scheduler.getFormattedDate(startDate)}</header>
                ${groupSummaryValues.map(({
                label = '',
                text
            }) => `
                    <div class="tip-item">
                        <span class="label">${label}</span>
                        <span>${text || 0}</span>
                    </div>
                `).join('')}
            `,
            summaries : [{
                label    : 'Full time',
                renderer : ({
                    events
                }) => {
                    // Only count events for resources that are "Full time"
                    return events.filter(event => event.resource.type === 'Full time').length;
                }
            }, {
                label    : 'Part time',
                renderer : ({
                    events
                }) => {
                    return events.reduce((result, event) => {
                        // Only count events for resources that are "Part time"
                        return result + (event.resource.type === 'Part time' ? 1 : 0);
                    }, 0);
                }
            }, {
                label : 'Total',
                renderer({
                    events
                }) {
                    const value = Math.min(1, events.length / maxValue),
                        height = 100 * value + '%';
                    return `
                           <div class="bar-outer">
                               <div class="bar-inner" style="height: ${height}"><label class="${value > 0.5 ? 'b-summary-bar-label-inside' : ''}">${events.length || ''}</label></div>
                           </div>
                        `;
                }
            }]
        }
    },
    columns : [{
        text   : 'Category',
        width  : 100,
        field  : 'category',
        hidden : true
    }, {
        type      : 'resourceInfo',
        text      : 'Staff',
        width     : 200,
        summaries : [{
            sum   : 'count',
            label : 'Employees'
        }]
    }, {
        text      : 'Employment type',
        width     : 130,
        field     : 'type',
        summaries : [{
            sum   : (result, record) => result + (record.type === 'Part time' ? 1 : 0),
            label : 'Part time'
        }]
    }],
    rowHeight  : 55,
    barMargin  : 5,
    startDate  : new Date(2024, 3, 21),
    endDate    : new Date(2024, 4, 5),
    // Customize preset
    viewPreset : {
        base              : 'dayAndWeek',
        displayDateFormat : 'YYYY-MM-DD',
        timeResolution    : {
            unit      : 'day',
            increment : 1
        }
    },
    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        const colors = {
            Consultants : 'orange',
            Researchers : 'purple',
            Sales       : 'lime',
            Testers     : 'cyan'
        };
        if (!eventRecord.eventColor) {
            renderData.eventColor = colors[resourceRecord.category];
        }

        // Add a custom CSS classes to the template element data by setting a property name
        renderData.cls.full = resourceRecord.type === 'Full time';
        renderData.cls.part = !renderData.cls.full;

        // Add data to be applied to the event template
        return StringHelper.encodeHtml(eventRecord.name);
    },
    tbar : {
        items : {
            target : {
                type        : 'buttongroup',
                rendition   : 'padded',
                toggleGroup : true,
                items       : {
                    targetHeader : {
                        text : 'Display in header',
                        icon : 'fa fa-table',
                        onToggle({
                            pressed
                        }) {
                            scheduler.widgetMap.collapseToHeader.disabled = pressed;
                            scheduler.features.groupSummary.target = pressed ? 'header' : 'footer';
                        }
                    },
                    targetFooter : {
                        text    : 'Display in footer',
                        icon    : 'fa fa-table fa-rotate-180',
                        pressed : true
                    }
                }
            },
            collapseToHeader : {
                type    : 'slidetoggle',
                text    : 'Collapse to header',
                checked : true,
                onChange({
                    checked
                }) {
                    scheduler.features.groupSummary.collapseToHeader = checked;
                }
            },
            showAsHistogram : {
                type : 'slidetoggle',
                text : 'Show as histogram',
                onChange({
                    checked
                }) {
                    scheduler.element.classList.toggle('histogram-summary', checked);
                }
            }
        }
    }
});