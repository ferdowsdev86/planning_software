/**
 * Application configuration
 */
export const schedulerProps = {
    // A Project holds the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
    // loading data into all stores at once
    project : {
        autoLoad : true,
        loadUrl  : './data/data.json'
    },

    startDate      : '2020-03-23',
    endDate        : '2020-03-26',
    rowHeight      : 55,
    barMargin      : 12,
    eventStyle     : 'rounded',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    // Custom view preset, with more compact display of hours
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 15,
        headers   : [
            {
                unit       : 'day',
                dateFormat : 'ddd DD/MM'  //Mon 01/10
            },
            {
                unit       : 'hour',
                dateFormat : 'h'
            }
        ]
    },

    columnLinesFeature  : false,
    dependenciesFeature : false,
    // Enable the percent bar feature
    percentBarFeature   : true,

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Worker',
            showEventCount : true
        },
        {
            htmlEncodeHeaderText : false,

            text   : 'Button<br /><small>Vue Component</small>',
            width  : '10em',
            align  : 'center',
            field  : 'city',
            editor : false,
            vue    : true,
            renderer({ record }) {
                // The object needed by the wrapper to render the component
                return {
                    // Required. Name of the component to render.
                    // The component must be registered globally in main.js
                    // https://vuejs.org/v2/guide/components.html#Dynamic-Components
                    is : 'AppButton',

                    // `Button` gets its text from `record`
                    record

                    // Any other properties we provide for the Vue component, e.g. `value`.
                };
            }
        }
    ]
};

