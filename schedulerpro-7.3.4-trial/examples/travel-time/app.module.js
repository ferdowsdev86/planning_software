import shared from '../_shared/shared.module.js';
import { Toast, SchedulerPro, StringHelper, DateHelper } from '../../build/schedulerpro.module.js';

// IMPORTANT NOTICE: You are not allowed to use this access_token outside our demos, you are required to obtain your own
const leafletToken = 'pk.eyJ1IjoibWF0c2JyeW50c2UiLCJhIjoiY2tlcHdqd2lrM3hlZjJybHRpeDR0amo1cCJ9.PJc0GY_loGf0iQKlewuL0w';

const scheduler = new SchedulerPro({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'indented',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    allowOverlap : false,
    features     : {
        timeRanges : {
            showHeaderElements : false
        },
        dependencies : false,
        eventBuffer  : {
            // The event buffer time spans are considered as unavailable time
            bufferIsUnavailableTime : true,
            tooltipTemplate         : ({ duration }) => `<i class="fa fa-car"></i>Travel time: ${duration}`,
            renderer({ eventRecord, preambleConfig, postambleConfig }) {
                if (eventRecord.preamble) {
                    preambleConfig.icon = eventRecord.preambleIcon;
                    preambleConfig.cls  = eventRecord.preambleCls;
                    preambleConfig.text = eventRecord.preamble.toString(true) + (eventRecord.preambleText ? ` (${eventRecord.preambleText})` : '');
                }

                if (eventRecord.postamble) {
                    postambleConfig.icon = eventRecord.postambleIcon;
                    postambleConfig.cls  = eventRecord.postambleCls;
                    postambleConfig.text = eventRecord.postamble.toString(true) + (eventRecord.postambleText ? ` (${eventRecord.postambleText})` : '');
                }
            }
        },

        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        percentDoneField : {
                            label : '% Done'
                        },
                        preambleField : {
                            label : 'Drive to'
                        },
                        postambleField : {
                            label : 'Drive back'
                        }
                    }
                }
            }
        },

        // The tooltip feature is customized to contain a LeafletJS map
        eventTooltip : {
            // Don't auto hide the tooltip when moving the mouse over it
            allowOver : true,

            // We initialize the map when the tooltip is shown
            onShow({ source : tooltip }) {
                const
                    { eventRecord } = tooltip,
                    { lat, lon }    = eventRecord?.address || {};

                if (tooltip.map) {
                    tooltip.map.remove();
                    // Calling `remove` on already removed instance will throw
                    tooltip.map = null;
                }

                if (lat && lon) {
                    const map = tooltip.map = window.L.map('eventmap', {
                        zoomControl : false,
                        zoom        : 13,
                        center      : [lat, lon]
                    });

                    window.L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${leafletToken}`, {
                        attribution : '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a target="_blank" href="https://www.mapbox.com/">Mapbox</a>',
                        id          : 'mapbox/streets-v11',
                        tileSize    : 512,
                        zoomOffset  : -1,
                        accessToken : leafletToken
                    }).addTo(map);

                    window.L.marker([lat, lon]).addTo(tooltip.map);
                }
            },
            // Define a custom HTML template with a map placeholder to show in the tooltip
            template : ({ eventRecord }) => {
                // Read from main event if this is a split part
                eventRecord = eventRecord.event || eventRecord;
                return `<header>
                     ${eventRecord.resource.get('image') ? `<img class="resource-image" src="../_shared/images/transparent-users/${eventRecord.resource.get('image')}.png"/>` : ''}
                    <div class="resource-info">
                        <span class="resource-name">${StringHelper.encodeHtml(eventRecord.resource.name)}</span>
                        <span class="resource-role">${StringHelper.encodeHtml(eventRecord.resource.role)}</span>
                    </div>
                </header>
                <div class="event-info">
                    <div class="event-details">
                        <strong><i class="fa fa-calendar"></i>${StringHelper.encodeHtml(eventRecord.name)}</strong>
                        ${DateHelper.format(eventRecord.startDate, 'LT')} - ${DateHelper.format(eventRecord.endDate, 'LT')}
                        <strong><i class="fa fa-map-marker"></i>Address</strong>
                        <span>${eventRecord.address?.name || ''}</span>
                        <strong><i class="fa fa-car-side"></i>Travel time</strong>
                        <span>${eventRecord.preamble || ''} <i class="fa fa-arrow-right"></i></span>
                        <span>${eventRecord.postamble || ''} <i class="fa fa-arrow-left"></i></span>
                    </div>
                    <div id="eventmap"></div>
                </div>
            `;
            }
        }
    },
    columns : [
        {
            text   : 'Projects',
            width  : 130,
            field  : 'category',
            hidden : true
        },
        {
            type     : 'resourceInfo',
            text     : 'Technicians',
            width    : 205,
            field    : 'name',
            showRole : false
        },
        {
            text   : 'Role',
            width  : 155,
            field  : 'role',
            editor : false
        }
    ],

    rowHeight : 80,
    barMargin : 10,
    startDate : new Date(2021, 10, 1, 6),
    endDate   : new Date(2021, 10, 1, 20),

    viewPreset : 'hourAndDay',

    project : {
        autoLoad   : true,
        eventStore : {
            fields : [
                // A few additional fields used to customize the travel time elements
                { name : 'preambleText' },
                { name : 'preambleIcon', defaultValue : 'fa fa-car' },
                { name : 'preambleCls' },
                { name : 'postambleText' },
                { name : 'postambleIcon', defaultValue : 'fa fa-car' },
                { name : 'postambleCls' },
                { name : 'durationUnit', defaultValue : 'h' }
            ]
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    eventRenderer({ eventRecord }) {
        const { name, fullDuration } = eventRecord;

        return {
            children : [
                {
                    className : 'event-name',
                    text      : name
                },
                {
                    className : 'event-duration',
                    text      : fullDuration
                }
            ]
        };
    },

    tbar : [
        {
            type    : 'slidetoggle',
            label   : 'Show travel time',
            ref     : 'travel-time-toggle-button', // For test purpose
            color   : 'b-blue',
            checked : true,
            onChange({ checked }) {
                scheduler.features.eventBuffer.disabled = !checked;
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Show duration label',
            ref     : 'duration-toggle-button', // For test purpose
            color   : 'b-blue',
            checked : true,
            onChange({ checked }) {
                scheduler.features.eventBuffer.showDuration = checked;
            }
        }
    ]
});


Toast.show({
    html : `
        <p>This demo uses the great <b>Leaflet</b> library (<a href="https://github.com/Leaflet/Leaflet">GitHub</a>,
        <a href="https://github.com/Leaflet/Leaflet/blob/main/LICENSE">BSD 2-Clause License</a>).</p>
        <p>It is a separately licensed 3rd party library not part of the Bryntum product,<br>if you plan to use it
        in your app you must use your own access token.</p>
    `,
    timeout : 10000
});
