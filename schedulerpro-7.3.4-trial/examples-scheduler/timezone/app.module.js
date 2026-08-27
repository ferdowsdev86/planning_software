import shared from '../_shared/shared.module.js';
import { AjaxHelper, DateHelper, StringHelper, TimeZoneHelper, Scheduler } from '../../build/schedulerpro.module.js';
//region "lib/data.js"

// The content of this file makes it possible for the demo Scheduler to show events for any given period displayed
// It is unsuitable to be used as the base for any type of real-world app

let eventId = 1;
const
    generatedDates = [],
    setDates       = (record, date) => {
        const startDate = new Date(date.getTime());

        startDate.setUTCHours(record.startDate);

        record.startDate = startDate;
        record.utcString = startDate.toISOString();

        record.id = eventId;
        eventId += 1;

        record.children?.forEach(childEvent => setDates(childEvent, date));
    };

AjaxHelper.mockUrl('timezone-data', async(url, urlParams, { queryParams }) => {
    const
        date = new Date(JSON.parse(queryParams.data).params.date);
    let resources  = [],
        events     = [],
        timeRanges = [];

    if (!generatedDates.includes(date.getTime())) {
        const data = await fetch('data/data.json').then(async response => await response.json());

        if (eventId === 1) {
            // First load request only
            ({ resources, timeRanges } = data);
        }

        // Use one data set on even days and another on odd
        events = date.getDate() % 2 === 0 ? data.eventsEven : data.eventsOdd;

        events.forEach(event => setDates(event, date));

        generatedDates.push(date.getTime());
    }

    return {
        responseText : JSON.stringify({
            success   : true,
            resources : {
                rows   : resources,
                append : true // Tells the CrudManager to add, not replace data
            },
            events : {
                rows   : events,
                append : true
            },
            timeRanges : {
                rows   : timeRanges,
                append : true
            }
        })
    };
});

//endregion

// For a better view range, all dates are calculated as UTC.
const
    now        = new Date(),
    today      = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
let currentDay = today;

const
    timeZones = ['America/Caracas', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/New_York', 'America/Sao_Paulo', 'America/St_Johns', 'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Hong_Kong',
        'Asia/Tokyo', 'Australia/Adelaide', 'Australia/Melbourne', 'Europe/London', 'Europe/Helsinki', 'Europe/Moscow',
        'Europe/Stockholm', 'Indian/Maldives', 'Indian/Mahe', 'Pacific/Auckland', 'Pacific/Honolulu'],

    scheduler = new Scheduler({
        appendTo       : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom     : true,
        eventStyle     : 'indented',
        resourceImages : {
            path      : '../_shared/images/transparent-users/',
            extension : '.png'
        },
        barMargin   : 5,
        crudManager : {
            loadUrl   : 'timezone-data', // Fake demo backend
            autoLoad  : true,
            listeners : {
                beforeLoad({ pack }) {
                    // Add the "currentDay" to all load requests
                    if (!pack.params) {
                        pack.params = {};
                    }
                    pack.params.date = currentDay;

                    // Disable the navigation buttons while loading
                    scheduler.widgetMap.prevButton.disabled = true;
                    scheduler.widgetMap.nextButton.disabled = true;
                },
                load() {
                    // Enable the navigation buttons when loading completes
                    scheduler.widgetMap.prevButton.disabled = false;
                    scheduler.widgetMap.nextButton.disabled = false;
                }
            }
        },

        features : {
            timeRanges : {
                showCurrentTimeLine : true,
                showHeaderElements  : false
            }
        },

        columns : [
            { type : 'resourceInfo', text : 'Staff', field : 'name', width : '10em' }
        ],

        startDate  : today,
        endDate    : DateHelper.add(currentDay, 1, 'day'),
        viewPreset : 'hourAndDay',

        eventRenderer({ eventRecord }) {
        // Example of how a time zone converted date can be converted back to local system time or UTC
            const utcString = TimeZoneHelper.fromTimeZone(eventRecord.startDate, scheduler.timeZone).toISOString();
            return `<div>${StringHelper.encodeHtml(eventRecord.name)}</div><div class="utc">UTC ${utcString.substring(0, 16)}Z</div>`;
        },

        tbar : [
            {
                type           : 'combo',
                label          : 'Current timezone',
                filterOperator : '*',
                ariaLabel      : 'Select time zone',
                inputWidth     : '15em',
                // Available options in the-drop down menu is those available for the native Intl.DateTimeFormat. The actual
                // time zone conversion uses toLocaleString('locale', { timeZone: chosenTimeZone }) and then parses it into
                // a local system date.
                items          : Intl.supportedValuesOf?.('timeZone') || timeZones,
                value          : new Intl.DateTimeFormat().resolvedOptions().timeZone, // Start value is local system timezone
                onSelect       : ({ record }) => {
                    scheduler.timeZone = record.data.text;
                }
            },
            '->',
            {
                type  : 'buttongroup',
                items : {
                    prevButton : {
                        type    : 'button',
                        icon    : 'b-icon-previous',
                        tooltip : 'View previous day',
                        onAction() {
                            // Re-populates the store with data for the previous day.
                            // Not needed when working with real data
                            currentDay = DateHelper.add(currentDay, -1, 'day');

                            scheduler.crudManager.load();
                            scheduler.shiftPrevious();
                        }
                    },
                    todayButton : {
                        type    : 'button',
                        text    : 'Today',
                        tooltip : 'View today, to see the current time line',
                        onAction() {
                            // Re-populates the store with data for today.
                            // Not needed when working with real data
                            currentDay = today;
                            const
                                tzToday = TimeZoneHelper.toTimeZone(today, scheduler.timeZone),
                                tzTomorrow = TimeZoneHelper.toTimeZone(DateHelper.add(currentDay, 1, 'day'));

                            scheduler.setTimeSpan(tzToday, tzTomorrow, scheduler.timeZone);
                        }
                    },
                    nextButton : {
                        type    : 'button',
                        icon    : 'b-icon-next',
                        tooltip : 'View next day',
                        onAction() {
                            // Re-populates the store with data for the next day. Not needed when working with real data
                            currentDay = DateHelper.add(currentDay, 1, 'day');

                            scheduler.crudManager.load();
                            scheduler.shiftNext();
                        }
                    }
                }
            }
        ]
    });
