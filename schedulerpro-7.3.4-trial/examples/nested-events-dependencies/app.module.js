import shared from '../_shared/shared.module.js';
import { DomHelper, StringHelper, EventHelper, Toolbar, SchedulerPro } from '../../build/schedulerpro.module.js';

const scheduler = new SchedulerPro({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    // Project holding all demo data, automatically loaded when demo is opened
    project : {
        autoLoad   : true,
        loadUrl    : './data/data.json',
        // Force using a tree event store. This is normally detected from data, but in case you start without children
        // it can be forced. Also add some additional fields
        eventStore : {
            tree : true
        }
    },

    // Date range to view
    startDate : new Date(2023, 6, 30),
    endDate   : new Date(2023, 7, 13),

    columnLines    : false,
    rowLines       : false,
    tickSize       : 100,
    // Need a large row height to fit stacked nested events
    rowHeight      : 173,
    // Some more space at resource top/bottom
    resourceMargin : 20,
    // Don't use any event style or color, makes it easier to customize the appearance
    eventStyle     : null,
    eventColor     : null,
    // Features used by the demo
    features       : {
        // Turn nested events on, not much of a demo without :)
        nestedEvents : {
            // Stack nested events initially (can be changed from the toolbar)
            eventLayout             : 'stack',
            // Reserve more space above the nested events container
            headerHeight            : 25,
            // Prevent dragging nested events out of parents
            allowDeNestingOnDrop    : false,
            constrainResizeToParent : false
        },
        nonWorkingTime : false,
        columnLines    : false,
        dependencies   : {
            clickWidth        : 5,
            radius            : 5,
            terminalSize      : 16,
            terminalHideDelay : 200,
            drawAroundParents : true,
            showLagInTooltip  : true
        },
        dependencyEdit : true,
        // Show event progress (without label, nested events gets in the way)
        percentBar     : {
            showPercentage : false
        },
        regionResize       : false,
        resourceTimeRanges : true,
        stickyEvents       : false,
        timeRanges         : true
    },
    // Using a single column with a custom renderer
    columns : [
        {
            text    : 'Expedition',
            cellCls : 'expedition',
            field   : 'name',
            width   : 200,
            renderer({ record }) {
                return [
                    {
                        class : 'name',
                        text  : record.name
                    },
                    {
                        class : 'label',
                        text  : 'Height'
                    },
                    {
                        class : 'height',
                        text  : `${record.height}m/${(record.height / 3.28084).toFixed(0)}ft`
                    },
                    {
                        class : 'label',
                        text  : 'Country'
                    },
                    {
                        class   : 'country',
                        dataset : {
                            btip : StringHelper.encodeHtml(record.country)
                        },
                        text : record.flag
                    }
                ];
            }
        }
    ],

    // Hook called by drag creation and when double clicking to add an event. Used here to turn the added event into
    // a parent
    onEventCreated(eventRecord) {
        eventRecord.convertToParent();
    },

    eventRenderer({ eventRecord, renderData }) {
        // Shrink events for nicer looks + to have a chance of reaching the left/right dependency terminals on parents
        if (eventRecord.isLeaf) {
            if (eventRecord.startDate - eventRecord.parent.startDate === 0) {
                renderData.width -= 11;
                renderData.left += 10;
            }
            if (eventRecord.endDate - eventRecord.parent.endDate === 0) {
                renderData.width -= 11;
            }
            renderData.width--;
        }
        // Parent
        else {
            renderData.width -= 8;
            renderData.left += 4;

            // Indicate if parent has a constraint
            if (eventRecord.constraintType && eventRecord.constraintDate) {
                renderData.wrapperCls.add('b-has-constraint');

                return [
                    eventRecord.name,
                    {
                        tag       : 'i',
                        className : 'fa fa-thumbtack',
                        dataset   : {
                            btip : 'Pinned by a constraint, click to remove'
                        },
                        elementData : {
                            eventRecord
                        }
                    }
                ];
            }
        }

        return StringHelper.encodeHtml(eventRecord.name);
    }
});

const toolbarContainer = DomHelper.createElement({
    parent : 'container',
    class  : 'toolbar-container'
});

const toolbar = new Toolbar({
    appendTo : toolbarContainer,
    dock     : 'right',
    items    : {
        label : {
            type : 'label',
            text : 'Settings'
        },
        drawAround : {
            type        : 'checkbox',
            checked     : true,
            text        : 'Draw around parents',
            pressedIcon : 'fa fa-check-square',
            icon        : 'fa fa-square',
            onChange({ checked }) {
                scheduler.features.dependencies.drawAroundParents = checked;
            }
        }
    }
});

EventHelper.on({
    element  : scheduler.element,
    delegate : '.fa-thumbtack',
    click({ target }) {
        const { eventRecord } = target.elementData;

        eventRecord.constraintType = eventRecord.constraintDate = null;
    }
});
