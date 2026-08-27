import shared from '../_shared/shared.module.js';
import { StringHelper, Toast, Container } from '../../build/schedulerpro.module.js';

// Create infrastructure to hold the different components of the demo
const container = new Container({
    layout   : 'hbox',
    appendTo : 'container',
    ref      : 'horizontal',
    cls      : 'demo-app', // Apply shared demo styling to put it in a nice box
    items    : {
        scheduler : {
            type : 'scheduler',
            // Enables smoother wheel and pinch zooming
            smoothZoom     : true,
            minWidth       : '50em',
            eventStyle     : 'bordered',
            resourceImages : {
                path      : '../_shared/images/transparent-users/',
                extension : '.png'
            },
            features : {
                // This feature enables row resizing by drag-drop
                rowResize : {
                    minHeight : 20
                },
                stickyCells : true
            },

            columns : [
                { type : 'resourceInfo', text : 'Name', field : 'name', width : 150 },
                {
                    type     : 'template',
                    text     : 'Cool link',
                    width    : 150,
                    readOnly : true,
                    template : ({ record }) => record.rowHeight || record.resourceMargin || record.barMargin ? 'Settings from data' : `<a href="#">Click me</a>`
                }
            ],

            crudManager : {
                loadUrl  : 'data/data.json',
                autoLoad : true
            },

            startDate  : new Date(2026, 0, 1, 8),
            endDate    : new Date(2026, 0, 1, 19),
            viewPreset : 'hourAndDay',

            resourceMargin : {
                start : 10,
                end   : 10
            },

            onCellClick({ column, record, event }) {
                if (column.field === 'name') {
                    Toast.show(StringHelper.xss`You clicked ${record.name}`);
                }
                else if (event.target.href) {
                    Toast.show('You clicked a link');
                }
            },

            eventRenderer({ eventRecord, renderData }) {
                // Make events with low height use a small font (uses em in styling, will scale)
                renderData.cls.tiny = renderData.height < 23;

                return StringHelper.encodeHtml(eventRecord.name);
            }
        },
        splitter : {
            type : 'splitter'
        },
        tools : {
            type        : 'panel',
            collapsible : {
                direction : 'right'
            },
            minWidth      : '20em',
            width         : 300,
            title         : 'Settings',
            labelPosition : 'above',
            items         : {
                resource : {
                    type         : 'combo',
                    label        : 'Adjust',
                    displayField : 'name',
                    value        : 'all',
                    editable     : false,
                    items        : [{ id : 'all', name : 'All unset' }],
                    onSelect({ record }) {
                        if (record.id === 'all') {
                            changeAdjustTarget(scheduler);
                        }
                        else {
                            changeAdjustTarget(scheduler.resourceStore.getById(record.id));
                        }
                    }
                },
                rowHeight : {
                    type      : 'slider',
                    text      : 'Row height',
                    showValue : 'thumb',
                    min       : 20,
                    onInput({ value }) {
                        scheduler.suspendAnimations();
                        adjustTarget.rowHeight = value;

                        changeAdjustTarget(adjustTarget);
                        scheduler.resumeAnimations();
                    }
                },
                barMargin : {
                    type      : 'slider',
                    text      : 'Bar margin',
                    showValue : 'thumb',
                    onInput({ value }) {
                        scheduler.suspendAnimations();
                        adjustTarget.barMargin = value;

                        changeAdjustTarget(adjustTarget);
                        scheduler.resumeAnimations();
                    }
                },
                resourceMarginTop : {
                    type      : 'slider',
                    text      : 'Resource margin top',
                    showValue : 'thumb',
                    max       : 14,
                    onInput({ value }) {
                        scheduler.suspendAnimations();
                        adjustTarget.resourceMargin = {
                            start : value,
                            end   : adjustTarget.resourceMargin?.end ?? scheduler.resourceMargin.end
                        };

                        changeAdjustTarget(adjustTarget);
                        scheduler.resumeAnimations();
                    }
                },
                resourceMarginBottom : {
                    type      : 'slider',
                    text      : 'Resource margin bottom',
                    showValue : 'thumb',
                    max       : 14,
                    onInput({ value }) {
                        scheduler.suspendAnimations();
                        adjustTarget.resourceMargin = {
                            end   : value,
                            start : adjustTarget.resourceMargin?.start ?? scheduler.resourceMargin.start
                        };

                        changeAdjustTarget(adjustTarget);
                        scheduler.resumeAnimations();
                    }
                }
            }
        }
    }
});

const
    {
        scheduler,
        rowHeight,
        barMargin,
        resourceMarginTop,
        resourceMarginBottom
    } = container.widgetMap;

let adjustTarget;

function changeAdjustTarget(target) {
    adjustTarget = target;

    const rowHeightValue = target.rowHeight ?? scheduler.rowHeight;

    rowHeight.value            = rowHeightValue;
    barMargin.value            = target.barMargin ?? scheduler.barMargin;
    resourceMarginTop.value    = adjustTarget.resourceMargin ? adjustTarget.resourceMargin.start : scheduler.resourceMargin.start;
    resourceMarginBottom.value = adjustTarget.resourceMargin ? adjustTarget.resourceMargin.end : scheduler.resourceMargin.end;

    // Limit margins to somewhat sane values
    barMargin.max = Math.max(0, (rowHeightValue - 10) / 2);
}

changeAdjustTarget(scheduler);

// Populate resource combo after data loads
scheduler.crudManager.on('load', () => {
    const { resource } = container.widgetMap;
    resource.items = [{ id : 'all', name : 'All unset' }].concat(scheduler.resourceStore.records.map(r => ({ id : r.id, name : r.name })));
});
