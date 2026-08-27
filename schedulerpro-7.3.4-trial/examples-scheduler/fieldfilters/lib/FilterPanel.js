import TabPanel from '../../../lib/Core/widget/TabPanel.js';
import  './EventFilterPanel.js';
import  './ResourceFilterPanel.js';

export default class FilterPanel extends TabPanel {
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
