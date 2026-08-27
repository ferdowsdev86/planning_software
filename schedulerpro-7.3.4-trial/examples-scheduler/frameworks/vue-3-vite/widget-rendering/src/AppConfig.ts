import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-vue-3';
import type { CrudManagerListenersTypes } from '@bryntum/schedulerpro';
import { Developer } from './lib/Developer';
import type { Ref } from 'vue';

export const useSchedulerProps = (
    calcEvents: CrudManagerListenersTypes['load'],
    beforeLunch: Ref<number>,
    afterLunch: Ref<number>
): BryntumSchedulerProps => {
    return ({
        startDate        : new Date(2024, 11, 1, 6),
        endDate          : new Date(2024, 11, 1, 20),
        viewPreset       : 'hourAndDay',
        rowHeight        : 50,
        barMargin        : 5,
        multiEventSelect : true,
        // Enables smoother wheel and pinch zooming
        smoothZoom       : true,
        resourceImages   : {
            path      : 'users/',
            extension : '.png'
        },

        columns : [
            {
                type  : 'resourceInfo',
                text  : 'Developer',
                field : 'name',
                width : 130
            }
        ],

        cellTooltipFeature : {
            tooltipRenderer({ record }) {
                return {
                    vue  : true,
                    is   : 'VueTooltip',
                    bind : { record }
                };
            }
        },

        eventTooltipFeature : {
            // Returns a Vue component to be used as the tooltip
            template(data) {

                // Get the data for the Vue component
                const {
                    resourceRecord,
                    eventRecord,
                    startDate,
                    endDate,
                    tip
                } = data;

                // For the tooltip body styling
                tip.cls = 'vue-event-tip';

                return {
                    vue  : true,
                    is   : 'VueEventTip',
                    bind : {
                        resourceRecord,
                        eventRecord,
                        startDate,
                        endDate
                    }
                };
            }
        },
        // CrudManager arranges loading and syncing of data in JSON form from/to a web service
        crudManager : {
            resourceStore : {
                modelClass : Developer
            },
            loadUrl  : 'data/data.json',
            autoLoad : true,
            onLoad   : calcEvents
        },

        tbar : {
            items : [{
                type    : 'widget',
                tooltip : [
                    'Button and the status text are rendered by Vue Component',
                    '<strong><code>VueWidget</code></strong>.<br><br>',
                    'Status text parts are defined at the application level passed to the Vue component as props.<br><br>',
                    'Event fired by the button is emitted by the Vue Component as a custom event',
                    'and is handled by the listener defined at the application level.'
                ].join(' '),
                // html is used to configure the Vue component for the widget's content
                html : {
                    vue  : true,
                    is   : 'VueWidget', // must be registered
                    bind : {
                        beforeLunch,
                        afterLunch
                    },
                    on : {
                        myClick : calcEvents
                    }
                }
            }]
        }
    });
};
