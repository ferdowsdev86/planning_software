import React, { useRef, useState } from 'react';
import { Button, Checkbox, DateHelper, SchedulerEventModel, SchedulerEventStore, Menu, StringHelper } from '@bryntum/schedulerpro';
import { BryntumScheduler, BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import ResourceHeaderRenderer from './ResourceHeaderRenderer';

const VerticalScheduler = () => {
    const schedulerRef = useRef<BryntumScheduler>(null);
    const getScheduler = () => schedulerRef.current!.instance;

    const [schedulerProps] = useState<BryntumSchedulerProps>({

        // Enables smoother wheel and pinch zooming
        smoothZoom : true,
        mode       : 'vertical',

        crudManager : {
            autoLoad  : true,
            transport : {
                load : {
                    url : 'data/data.json'
                }
            },
            // This config enables response validation and dumping of found errors to the browser console.
            // It's meant to be used as a development stage helper only so please set it to false for production systems.
            validateResponse : true
        },

        startDate      : new Date(2025, 0, 1, 6),
        endDate        : new Date(2025, 0, 1, 18),
        viewPreset     : 'hourAndDay',
        barMargin      : 5,
        resourceMargin : 5,
        eventStyle     : 'indented',
        tickSize       : 80,

        resourceImagePath : 'users/',

        filterBarFeature          : true, // required to filterable on columns work
        resourceTimeRangesFeature : true,
        timeRangesFeature         : {
            enableResizing      : true,
            showCurrentTimeLine : true
        },

        resourceColumns : {
            columnWidth    : 140,
            showAvatars    : false,
            headerRenderer : ({ resourceRecord }) => {
                return (
                    <ResourceHeaderRenderer
                        resourceRecord={resourceRecord}
                    ></ResourceHeaderRenderer>
                );
            }
        },

        verticalTimeAxisColumn : {
            filterable : {
                // filter configuration
                filterField : {
                    // define the configuration for the filter field
                    type        : 'text', // type of the field rendered for the filter
                    placeholder : 'Filter events',
                    onChange    : async({ value }: { value: any }) => {
                        // on change of the field, filter the event store
                        await getScheduler().eventStore.filter({
                            // filter event by name converting to lowerCase to be equal comparison
                            filters : (event: SchedulerEventModel) => event.name.toLowerCase().includes(value.toLowerCase()),
                            replace : true // to replace all existing filters with a new filter
                        });
                    }
                }
            }
        },

        subGridConfigs : {
            locked : {
                // Wide enough to not clip tick labels for all the zoom levels.
                width : 115
            }
        },

        eventRenderer : ({ eventRecord }) => {
            return <div>
                <div className="time">{DateHelper.format(eventRecord.startDate as Date, 'LT')}</div>
                <div className="name">{StringHelper.encodeHtml(eventRecord.name)}</div>
            </div>;
        },

        tbar : [
            {
                label : 'Date',
                type  : 'date',
                value : 'up.startDate',
                step  : '1d',
                width : '18em',
                onChange({ value }) {
                    const scheduler = getScheduler();
                    // Preserve time, only changing "day"
                    const diff = DateHelper.diff(DateHelper.clearTime(scheduler.startDate), value, 'days');
                    scheduler.startDate = DateHelper.add(scheduler.startDate, diff, 'days');
                }
            },
            {
                type  : 'button',
                id    : 'fitButton',
                text  : 'Width',
                icon  : 'fa fa-arrows-alt-h',
                width : '9em',
                menu  : {
                    type  : 'menu',
                    items : [
                        {
                            type        : 'menuitem',
                            text        : 'No fit',
                            checked     : false,
                            ref         : 'fitNone',
                            closeParent : true
                        },
                        {
                            type        : 'menuitem',
                            text        : 'Fill width',
                            ref         : 'fitFill',
                            checked     : 'up.resourceColumns.fillWidth',
                            closeParent : true
                        },
                        {
                            type        : 'menuitem',
                            text        : 'Fit width',
                            ref         : 'fitFit',
                            checked     : 'up.resourceColumns.fitWidth',
                            closeParent : true
                        }
                    ],
                    onItem({ item }) {
                        const
                            { resourceColumns }          = getScheduler(),
                            widgets                      = (item.owner as Menu).widgetMap,
                            { fitNone, fitFill, fitFit } = widgets as Record<string, Checkbox>;

                        console.log('here');
                        fitNone.checked = item.ref === 'fitNone';
                        resourceColumns.fillWidth = fitFill.checked = item.ref === 'fitFill';
                        resourceColumns.fitWidth = fitFit.checked = item.ref === 'fitFit';
                        resourceColumns.fitWidth = item.ref === 'fitFit';
                    }
                }
            },
            {
                type  : 'button',
                text  : 'Layout',
                icon  : 'fa fa-layer-group',
                width : '9em',
                menu  : {
                    type  : 'menu',
                    items : [
                        {
                            text        : 'Overlap',
                            checked     : false,
                            ref         : 'layoutNone',
                            closeParent : true
                        },
                        {
                            text        : 'Pack',
                            ref         : 'layoutPack',
                            checked     : true,
                            closeParent : true
                        },
                        {
                            text        : 'Mixed',
                            ref         : 'layoutMixed',
                            checked     : false,
                            closeParent : true
                        }
                    ],
                    onItem({ item }) {
                        const
                            scheduler                               = getScheduler(),
                            widgets                                 = (item.owner as Menu).widgetMap,
                            { layoutNone, layoutPack, layoutMixed } = widgets as Record<string, Checkbox>;

                        layoutNone.checked = item.ref === 'none';
                        layoutPack.checked = item.ref === 'pack';
                        layoutMixed.checked = item.ref === 'mixed';
                        scheduler.eventLayout = item.ref as 'pack' | 'mixed' | 'none';
                    }
                }
            },
            {
                type  : 'button',
                text  : 'Sizing',
                icon  : 'fa fa-expand-arrows-alt',
                width : '9em',
                menu  : {
                    type        : 'popup',
                    anchor      : true,
                    layoutStyle : {
                        flexDirection : 'column'
                    },
                    items : [
                        {
                            type      : 'slider',
                            ref       : 'columnWidth',
                            text      : 'Column width',
                            showValue : true,
                            min       : 50,
                            max       : 200,
                            value     : 'up.resourceColumnWidth',
                            onInput({ value }) {
                                const
                                    scheduler                    = getScheduler(),
                                    { resourceColumns }          = scheduler,
                                    menu                         = (scheduler.widgetMap.fitButton as Button).menu as Menu,
                                    { fitNone, fitFill, fitFit } = menu.widgetMap as Record<string, Checkbox>;

                                if (fitNone) {
                                    fitNone.checked = true;
                                    fitFill.checked = false;
                                    fitFit.checked = false;
                                }

                                resourceColumns.fitWidth = resourceColumns.fillWidth = null;
                                resourceColumns.columnWidth = value;
                            }
                        },
                        {
                            type      : 'slider',
                            ref       : 'tickHeight',
                            text      : 'Tick height',
                            showValue : true,
                            min       : 20,
                            style     : 'margin-top: .5em',
                            value     : 'up.tickSize',
                            onInput({ value }) {
                                const scheduler = getScheduler();
                                // To allow ticks to not fill height
                                scheduler.suppressFit = true;
                                // Set desired size
                                scheduler.tickSize = value;
                            }
                        },
                        {
                            type      : 'slider',
                            ref       : 'barMargin',
                            text      : 'Bar margin',
                            showValue : true,
                            min       : 0,
                            max       : 10,
                            style     : 'margin-top: .5em',
                            value     : 'up.barMargin',
                            onInput({ value }) {
                                getScheduler().barMargin = value;
                            }
                        },
                        {
                            type      : 'slider',
                            ref       : 'resourceMargin',
                            text      : 'Resource margin',
                            showValue : true,
                            min       : 0,
                            max       : 10,
                            style     : 'margin-top: .5em',
                            value     : 'up.resourceMargin',
                            onInput({ value }) {
                                getScheduler().resourceMargin = value;
                            }
                        }
                    ]
                }
            }
        ]
    });

    return <BryntumScheduler
        ref={schedulerRef}
        {...schedulerProps}
    />;
};

export default VerticalScheduler;
