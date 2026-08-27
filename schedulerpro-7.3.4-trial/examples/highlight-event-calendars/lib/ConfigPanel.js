import Panel from '../../../lib/Core/widget/Panel.js';
import '../../../lib/Core/widget/SlideToggle.js';

// Custom panel that allows easy live configuring
export default class ConfigPanel extends Panel {
    static type = 'configpanel';

    static configurable = {
        scheduler : null,
        title     : 'Configuration',
        cls       : 'config-panel',
        defaults  : {
            ref       : 'slidetoggle',
            type      : 'slidetoggle',
            cls       : 'b-blue',
            listeners : {
                change({ source }) {
                    const
                        { value }   = source,
                        scheduler   = this.up('configpanel').scheduler;

                    switch (source.ref) {
                        case 'enableDragDrop':
                            scheduler.features.eventDrag.disabled = !value;
                            break;
                        case 'constrainToResource':
                            scheduler.features.eventDrag.constrainDragToResource = value;
                            break;
                        case 'highlight':
                            scheduler.features.calendarHighlight.disabled = !value;
                            break;
                        case 'snap':
                            scheduler.snap = value;
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        // Toggle features on/off (or rather disable/enable)
        items : {
            enableDragDrop      : { text : 'Enable task drag drop', checked : true },
            highlight           : { text : 'Enable highlighting', checked : true },
            constrainToResource : { text : 'Constrain drag to row', checked : false },
            snap                : { text : 'Snap to grid', checked : true }
        }
    };
}

ConfigPanel.initClass();
