import * as Leaflet from 'leaflet';
import { DateHelper, DomConfig, type Duration, EventModel, ResourceModel, SchedulerPro, StringHelper, Toast, Tooltip } from '@bryntum/schedulerpro';
import { type BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';

// IMPORTANT NOTICE: You are not allowed to use this access_token outside our demos, you are required to obtain your own
const leafletToken = 'pk.eyJ1IjoibWF0c2JyeW50c2UiLCJhIjoiY2tlcHdqd2lrM3hlZjJybHRpeDR0amo1cCJ9.PJc0GY_loGf0iQKlewuL0w';

class AppResourceModel extends ResourceModel {
    declare role: string;

    static override get fields() {
        return [
            // A few additional fields used to customize the travel time elements
            { name : 'role' }
        ];
    }
}

class AppEventModel extends EventModel {
    declare address: { name: string; lat: number; lon: number };
    declare event: EventModel;
    declare preambleIcon: string;
    declare preambleCls: string;
    declare preambleText: string;
    declare preamble: Duration;
    declare postambleIcon: string;
    declare postambleCls: string;
    declare postambleText: string;
    declare postamble: Duration;

    static override get fields() {
        return [
            // A few additional fields used to customize the travel time elements
            { name : 'preambleText' },
            { name : 'preambleIcon', defaultValue : 'fa fa-car' },
            { name : 'preambleCls' },
            { name : 'postambleText' },
            { name : 'postambleIcon', defaultValue : 'fa fa-car' },
            { name : 'postambleCls' },
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }
}

class AppTooltip extends Tooltip {
    // The Leaflet.Map type represents a Leaflet map instance.
    // This object is then used to interact with and manipulate the map, such as setting the view, adding layers, markers, etc.
    declare map: Leaflet.Map;
    declare eventRecord: AppEventModel;
}

export const schedulerProProps: BryntumSchedulerProProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    eventStyle        : 'indented',
    resourceImagePath : './users/',

    timeRangesFeature : {
        showHeaderElements : false
    },
    dependenciesFeature : false,

    eventBufferFeature : {
        tooltipTemplate : ({ duration }) => `<i class="fa fa-car"></i>Travel time: ${duration}`,
        renderer({ eventRecord, preambleConfig, postambleConfig }) {
            const
                appEvent = eventRecord as AppEventModel,
                {
                    preambleIcon,
                    preambleCls,
                    preambleText,
                    postambleIcon,
                    postambleCls,
                    postambleText
                }        = appEvent;

            if (eventRecord.preamble) {
                preambleConfig.icon = preambleIcon;
                preambleConfig.cls  = preambleCls;
                preambleConfig.text = eventRecord.preamble.toString(true) + (preambleText ? ` (${preambleText})` : '');
            }

            if (eventRecord.postamble) {
                postambleConfig.icon = postambleIcon;
                postambleConfig.cls  = postambleCls;
                postambleConfig.text = eventRecord.postamble.toString(true) + (postambleText ? ` (${postambleText})` : '');
            }
        }
    },

    taskEditFeature : {
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
    eventTooltipFeature : {
        // Don't auto hide the tooltip when moving the mouse over it
        allowOver : true,

        // We initialize the map when the tooltip is shown
        onShow({ source }) {
            const
                appTooltip      = source as unknown as AppTooltip,
                { eventRecord } = appTooltip,
                { lat, lon }    = eventRecord?.address || { lat : 0, lon : 0 };

            if (appTooltip.map) {
                appTooltip.map.remove();
                // Calling `remove` on already removed instance will throw
                appTooltip.map = null;
            }

            if (lat && lon) {
                const
                    map                = appTooltip.map = Leaflet.map('eventmap', {
                        zoomControl : false,
                        zoom        : 13,
                        center      : [lat, lon]
                    }),
                    leafletUrlTemplate = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${leafletToken}`,
                    leafletAttribution = '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
                        '<a target="_blank" href="https://www.mapbox.com/">Mapbox</a>';

                Leaflet.tileLayer(leafletUrlTemplate, {
                    attribution : leafletAttribution,
                    id          : 'mapbox/streets-v11',
                    tileSize    : 512,
                    zoomOffset  : -1,
                    accessToken : leafletToken
                }).addTo(map);

                // When creating a marker using Leaflet, specify the icon directly in the code:
                Leaflet.marker([lat, lon], {
                    icon : Leaflet.icon({
                        iconUrl   : './leaflet/images/marker-icon.png',
                        shadowUrl : './leaflet/images/marker-shadow.png'
                    })

                }).addTo(appTooltip.map);
            }
        },
        // Define a custom HTML template with a map placeholder to show in the tooltip
        template : ({ eventRecord }) => {
            const
                // Read from main event if this is a split parts of SchedulerEventModel
                appEvent    = (eventRecord as AppEventModel).event as AppEventModel || eventRecord as AppEventModel,
                {
                    address,
                    preamble,
                    postamble,
                    name,
                    startDate,
                    endDate,
                    resource
                }           = appEvent,
                appResource = resource as AppResourceModel;

            return `<header>
                     ${appResource.get('image') ? `<img class="resource-image" src="./users/${appResource.get('image')}.png"/>` : ''}
                    <div class="resource-info">
                        <span class="resource-name">${StringHelper.encodeHtml(appResource.name)}</span>
                        <span class="resource-role">${StringHelper.encodeHtml(appResource.role)}</span>
                    </div>
                </header>
                <div class="event-info">
                    <div class="event-details">
                        <strong><i class="fa fa-calendar"></i>${StringHelper.encodeHtml(name)}</strong>
                        ${DateHelper.format(startDate as Date, 'LT')} - ${DateHelper.format(endDate as Date, 'LT')}
                        <strong><i class="fa fa-map-marker"></i></i>Address</strong>
                        <span>${address?.name || ''}</span>
                        <strong><i class="fa fa-car-side"></i>Travel time</strong>
                        <span>${preamble || ''} <i class="fa fa-arrow-right"></i></span>
                        <span>${postamble || ''} <i class="fa fa-arrow-left"></i></span>
                    </div>
                    <div id="eventmap"></div>
                </div>
            `;
        }
    },
    columns : [
        {
            text   : 'Projects',
            width  : 100,
            field  : 'category',
            hidden : true
        },
        {
            type     : 'resourceInfo',
            text     : 'Technicians',
            width    : 170,
            field    : 'name',
            showRole : false
        },
        {
            text   : 'Role',
            width  : 150,
            field  : 'role',
            editor : false
        }
    ],
    rowHeight  : 80,
    barMargin  : 10,
    startDate  : new Date(2021, 10, 1, 6),
    endDate    : new Date(2021, 10, 1, 20),
    viewPreset : 'hourAndDay',
    project    : {
        autoLoad   : true,
        eventStore : {
            modelClass : AppEventModel
        },
        resourceStore : {
            modelClass : AppResourceModel
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
        } as DomConfig;
    },

    tbar : [
        {
            type    : 'slidetoggle',
            label   : 'Show travel time',
            ref     : 'travel-time-toggle-button', // For test purpose
            color   : 'b-blue',
            checked : true,
            onChange({ checked, source }: { checked: boolean; source: any }) {
                const schedulerPro                         = source.up(SchedulerPro.type);
                schedulerPro.features.eventBuffer.disabled = !checked;
            }
        },
        {
            type    : 'slidetoggle',
            label   : 'Show duration label',
            ref     : 'duration-toggle-button', // For test purpose
            color   : 'b-blue',
            checked : true,
            onChange({ checked, source }: { checked: boolean; source: any }) {
                const schedulerPro                             = source.up(SchedulerPro.type);
                schedulerPro.features.eventBuffer.showDuration = checked;
            }
        }
    ]
};

// <test>
!document.location.search.includes('test') &&
// </test>
Toast.show({
    html : `
        <p>This demo uses the great <b>Leaflet</b> library (<a href="https://github.com/Leaflet/Leaflet">GitHub</a>,
        <a href="https://github.com/Leaflet/Leaflet/blob/main/LICENSE">BSD 2-Clause License</a>).</p>
        <p>It is a separately licensed 3rd party library not part of the Bryntum product,<br>if you plan to use it
        in your app you must use your own access token.</p>
    `,
    timeout : 10000
});
