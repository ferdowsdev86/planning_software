/**
 * Scheduler component (functional)
 */
import React, { useRef, useEffect } from 'react';

import { BryntumScheduler } from '@bryntum/schedulerpro-react';
import { DateHelper, StringHelper } from '@bryntum/schedulerpro';
import Drag from '../lib/Drag.js';

const Scheduler = props => {
    const
        { encodeHtml } = StringHelper,
        schedulerRef = useRef(),
        config = {
            ...props,
            id         : 'schedulerpro',
            ref        : schedulerRef,
            // Enables smoother wheel and pinch zooming
            smoothZoom : true,
            startDate  : new Date(2017, 11, 1, 8),
            endDate    : new Date(2017, 11, 1, 18),

            rowHeight  : 100,
            barMargin  : 4,
            eventColor : 'indigo',
            eventStyle : 'tonal',
            viewPreset : {
                base           : 'hourAndDay',
                columnLinesFor : 0,
                headers        : [
                    {
                        unit       : 'd',
                        align      : 'center',
                        dateFormat : 'ddd DD MMM'
                    },
                    {
                        unit       : 'h',
                        align      : 'center',
                        dateFormat : 'HH'
                    }
                ]
            },

            timeRangesFeature : true,
            resourceImages    : {
                path      : 'users/',
                extension : '.png'
            },

            eventMenuFeature : {
                items : [
                    // custom item with inline handler
                    {
                        text   : 'Remove all equipment',
                        icon   : 'fa fa-times',
                        weight : 200,
                        onItem : ({ eventRecord, resourceRecord }) =>
                            (eventRecord.equipment = [])
                    }
                ]
            },
            eventEditFeature : {
                // Add an extra combo box to the editor to select equipment
                items : {
                    equipmentCombo : {
                        type         : 'combo',
                        editable     : false,
                        multiSelect  : true,
                        valueField   : 'id',
                        displayField : 'name',
                        name         : 'equipment',
                        label        : 'Equipment',
                        items        : [],
                        weight       : 200
                    }
                }
            },

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Name',
                    width          : 200,
                    showEventCount : false,
                    showRole       : true
                }
            ],

            crudManager : {
                autoLoad         : true,
                eventStore       : props.eventStore,
                loadUrl          : 'data/data.json',
                // This config enables response validation and dumping of found errors to the browser console.
                // It's meant to be used as a development stage helper only so please set it to false for production systems.
                validateResponse : true
            },

            // Render some extra elements for the assignment equipment items
            eventRenderer({ eventRecord }) {
                const equipment = this.extraData.equipmentStore && eventRecord.equipment
                    ? eventRecord.equipment.map(itemId => this.extraData.equipmentStore.getById(itemId) || {})
                    : [];

                return `
                    <div class="b-sch-event-startdate">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
                    <div class="b-sch-event-name">${encodeHtml(eventRecord.name || '')}</div>
                    <ul class="b-sch-event-equipment-wrap">
                        ${equipment.map(item => `<li title="${encodeHtml(item.name)}" class="${encodeHtml(item.iconCls)}"></li>`).join('')}
                    </ul>
                `;
            }
        };

    // runs once when the component is mounted
    useEffect(() => {
        const scheduler = schedulerRef.current.instance;
        const { equipmentStore, equipmentGrid } = props.extraData;

        // taken from the original example
        const onEquipmentStoreLoad = ({ source: store }) => {
            // Setup the data for the equipment combo inside the event editor
            const equipmentCombo = scheduler.features.eventEdit.editor
                .query(item => item.name === 'equipment');
            equipmentCombo.items = store.getRange();

            // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
            scheduler.refreshRows();
        };

        equipmentStore.on('load', onEquipmentStoreLoad.bind(scheduler));

        new Drag({
            grid         : equipmentGrid,
            schedule     : scheduler,
            outerElement : equipmentGrid.element
        });

        equipmentStore.load();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <BryntumScheduler {...config} />;
};

export default Scheduler;
