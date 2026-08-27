targetElement.innerHTML = '<p>Use the input field for Staff column to filter the resource.</p>';

const scheduler = new Scheduler({
    appendTo   : targetElement,
    eventStyle : 'colored',
    eventColor : null,
    autoHeight : true,

    features : {
        filterBar  : true,
        stripe     : true,
        timeRanges : true,
        eventEdit  : {
            items : {
                location : {
                    weight  : 210, // After resource
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
    }],

    resourceImagePath : 'data/Scheduler/examples/guides/readme/resources/',

    crudManager : {
        loadUrl  : 'data/Scheduler/examples/guides/readme/data.json', // link to .json data file
        autoLoad : true // auto load on initialization
    },

    barMargin : 5,
    rowHeight : 55,

    startDate : new Date(2024, 11, 1),
    endDate   : new Date(2024, 12, 7),
    // viewPreset : 'hourAndDay',

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = 'background-color:' + resourceRecord.color;

        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${ DateHelper.format(eventRecord.startDate, this.displayDateFormat)}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    }
});
