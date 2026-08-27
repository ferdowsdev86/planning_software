/**
 * Application configuration
 */
export const schedulerProps = {
    rowHeight        : 50,
    barMargin        : 5,
    multiEventSelect : true,
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    resourceImages   : {
        path      : 'users/',
        extension : '.png'
    },
    defaultResourceImageName : 'firstName',

    eventRenderer({ eventRecord }) {
        return {
            is   : 'EventRenderer',
            vue  : true,
            name : eventRecord.name
        };
    },

    crudManager : {
        loadUrl  : './data.json',
        autoLoad : true
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name',
            width : 150
        },
        {
            text                 : 'Button<br /><small>Vue Component</small>',
            width                : '10em',
            align                : 'center',
            field                : 'city',
            editor               : false,
            htmlEncodeHeaderText : false,
            vue                  : true,
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

