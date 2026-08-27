import shared from '../_shared/shared.module.js';
import { FieldFilterPickerGroup, TabPanel, GridFieldFilterPickerGroup, Scheduler, Container, StringHelper } from '../../build/schedulerpro.module.js';
//region "lib/EventFilterPanel.js"

class EventFilterPanel extends FieldFilterPickerGroup {
    static type = 'eventfilterpanel';
    static $name = 'EventFilterPanel';

    static configurable = {
        tbar : {
            enableAllCheckbox : {
                type      : 'checkbox',
                text      : 'Enable/disable all',
                checked   : true,
                listeners : {
                    change : 'up.onEnableAllCheckboxChange'
                }
            }
        },
        fields : {
            // Supply field `type` where not already present in the store model, to improve filterability
            startDate    : { type : 'date', title : 'Start Date' },
            endDate      : { type : 'date', title : 'Finish Date' },
            name         : { type : 'string', title : 'Name' },
            fullDuration : { type : 'duration', title : 'Duration' }
        },

        filters : [{
            property : 'name',
            operator : '=',
            value    : 'Partner meeting',
            disabled : true
        }]
    };

    onEnableAllCheckboxChange({ checked }) {
        const { filterPickers } = this.widgetMap;

        checked ? filterPickers.activateAll() : filterPickers.deactivateAll();
    }
}
EventFilterPanel.initClass();

//endregion

//region "lib/FilterPanel.js"

class FilterPanel extends TabPanel {
    static type = 'filterpanel';
    static $name = 'FilterPanel';

    static configurable = {
        cls         : 'filters-panel',
        collapsible : true,
        width       : '35em',
        defaults    : {
            style : 'padding: 1em'
        },
        items : {
            resourceFilter : {
                type : 'resourcefilterpanel',
                tab  : {
                    icon : 'fa fa-users'
                },
                title : 'Filter resources'
            },
            eventFilter : {
                type : 'eventfilterpanel',
                tab  : {
                    icon : 'fa fa-calendar'
                },
                title : 'Filter tasks'
            }
        }
    };
}

FilterPanel.initClass();

//endregion

//region "lib/ResourceFilterPanel.js"

class ResourceFilterPanel extends GridFieldFilterPickerGroup {
    static type = 'resourcefilterpanel';
    static $name = 'ResourceFilterPanel';

    static configurable = {
        ref   : 'filterPickers',
        grid  : null,
        items : {
            enableAllCheckbox : {
                type      : 'checkbox',
                text      : 'Enable/disable all',
                checked   : true,
                weight    : -1,
                style     : 'margin-bottom: 1em',
                listeners : {
                    change : 'up.onEnableAllCheckboxChange'
                }
            }
        },
        fields : {
            // Supply field `type` where not already present in the store model, to improve filterability
            type     : { type : 'string', title : 'Employment Type' },
            name     : { type : 'string', title : 'Name' },
            category : { type : 'string', title : 'Projects' }
        },

        filters : [{
            property : 'type',
            operator : '=',
            value    : 'Full time'
        }, {
            property : 'category',
            operator : 'isIncludedIn',
            value    : ['Research', 'Testers', 'Consultants']
        }]
    };

    onEnableAllCheckboxChange({ checked }) {
        if (checked) {
            this.activateAll();
        }
        else {
            this.deactivateAll();
        }
    }
}
ResourceFilterPanel.initClass();

//endregion

const scheduler = new Scheduler({
    // Enables smoother wheel and pinch zooming
    smoothZoom       : true,
    flex             : 1,
    startDate        : new Date(2025, 8, 5),
    endDate          : new Date(2025, 8, 12),
    viewPreset       : 'dayAndWeek',
    rowHeight        : 60,
    barMargin        : 7,
    multiEventSelect : true,
    features         : {
        regionResize : false
    },
    timeResolution : {
        increment : 1,
        unit      : 'day'
    },
    columns : [
        {
            text   : 'Projects',
            width  : 100,
            field  : 'category',
            hidden : true
        },
        {
            type           : 'resourceInfo',
            text           : 'Staff',
            width          : 210,
            field          : 'name',
            showRole       : 'category',
            showEventCount : false
        },
        {
            text  : 'Employment type',
            width : 120,
            field : 'type'
        }
    ],
    eventStyle     : 'traced',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        const colors = {
            Consultants : 'orange',
            Research    : 'pink',
            Sales       : 'lime',
            Testers     : 'cyan'
        };

        renderData.eventColor = colors[resourceRecord.category];

        return StringHelper.xss`${eventRecord.name}`;
    }
});

const app = new Container({
    layout   : 'hbox',
    appendTo : 'container',
    flex     : 1,
    cls      : 'demo-app', // Apply shared demo styling to put it in a nice box
    items    : {
        scheduler,
        splitter : {
            type : 'splitter'
        },
        filtersPanel : {
            type     : 'filterpanel',
            title    : 'Filters',
            minWidth : 300,
            maxWidth : 700,
            items    : {
                resourceFilter : {
                    grid : scheduler
                },
                eventFilter : {
                    store : scheduler.eventStore
                }
            }
        }
    }
});
