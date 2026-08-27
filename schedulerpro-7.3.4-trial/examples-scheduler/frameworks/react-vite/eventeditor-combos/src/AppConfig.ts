import { Combo, ComboConfig, Container, DateHelper, DomConfig, Store, StringHelper } from '@bryntum/schedulerpro';
import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { AppEventModelConfig, FloorModel, RoomModel } from './lib/Types';
import { buildings, equipment, floors, purpose, rooms } from './lib/Stores';

const getCombos = (combo: Combo): Record<string, Combo> => ((combo.owner as Container).widgetMap as Record<string, Combo>);

export const schedulerProps: BryntumSchedulerProps = {

    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2025, 2, 20, 6),
    endDate        : new Date(2025, 2, 20, 20),
    viewPreset     : 'hourAndDay',
    eventStyle     : 'bordered',
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },

    columns : [
        {
            type : 'resourceInfo',
            text : 'Staff',
            flex : 1
        },
        {
            type  : 'column',
            text  : 'Type',
            field : 'type',
            width : 200
        }
    ],
    eventEditFeature : {
        editorConfig : {
            items : {
                buildingCombo : {
                    type      : 'combo',
                    name      : 'building',
                    store     : buildings,
                    label     : 'Building',
                    editable  : false,
                    clearable : true,
                    async onChange({ source, value }) {
                        const
                            combo                     = source as Combo,
                            { roomCombo, floorCombo } = getCombos(combo);

                        roomCombo.value  = null;
                        floorCombo.value = null;

                        if (combo.record) {
                            await (floorCombo.store as Store).filter({
                                property : 'buildingId',
                                value
                            });
                            floorCombo.disabled = false;
                        }
                        else {
                            floorCombo.value    = null;
                            floorCombo.disabled = true;
                        }
                    }
                },
                floorCombo : {
                    type      : 'combo',
                    name      : 'floor',
                    store     : floors,
                    label     : 'Floor',
                    editable  : false,
                    disabled  : true,
                    clearable : true,
                    async onChange({ source, value }) {
                        const
                            combo         = source as Combo,
                            { roomCombo } = getCombos(combo);

                        roomCombo.value = null;

                        if (combo.record) {
                            await (roomCombo.store as Store).filter({
                                property : 'floorId', value
                            }
                            );
                            roomCombo.disabled = false;
                        }
                        else {
                            roomCombo.value    = null;
                            roomCombo.disabled = true;
                        }
                    }
                },
                roomCombo : {
                    type      : 'combo',
                    name      : 'room',
                    store     : rooms,
                    label     : 'Room',
                    editable  : false,
                    disabled  : true,
                    clearable : true,
                    onChange({ source }) {
                        const
                            combo                            = source as Combo,
                            { purposeCombo, equipmentCombo } = getCombos(combo);

                        if (combo.record) {
                            purposeCombo.hidden   = false;
                            equipmentCombo.hidden = false;

                        }
                        else {
                            purposeCombo.hidden   = true;
                            equipmentCombo.hidden = true;
                            purposeCombo.value    = null;
                            equipmentCombo.value  = null;
                        }
                    }
                },
                purposeCombo : {
                    type   : 'combo',
                    store  : purpose,
                    name   : 'purpose',
                    label  : 'Purpose',
                    hidden : true
                },
                equipmentCombo : {
                    type   : 'combo',
                    store  : equipment,
                    name   : 'equipment',
                    label  : 'Equpment',
                    hidden : true
                }
            } as Record<string, ComboConfig>
        }
    },

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord, renderData }) {
        const event = eventRecord as AppEventModelConfig;

        (renderData.cls as DomConfig).add(`b-sch-eventtype-${event.eventType}`);

        let headerText = DateHelper.format(event.startDate, 'LT');

        const
            currentFloor = floors.getById(event.floor) as FloorModel,
            currentRoom  = rooms.getById(event.room) as RoomModel;

        if (event.floor) {
            headerText += ` | ${currentFloor.text}`;
        }
        if (event.room) {
            headerText += ` | ${currentRoom.text}`;
        }

        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${headerText}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    },

    crudManager : {
        stores     : [buildings, floors, rooms, purpose, equipment],
        eventStore : {
            // @ts-ignore
            modelClass : AppEventModelConfig
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        autoLoad : true
    }
};
