/**
 * Custom drag class
 *
 * Taken from the vanilla example
 */
import { DragHelper, Toast } from '@bryntum/schedulerpro';

export default class Drag extends DragHelper {
    static configurable = {
        // Don't drag the actual cell element, clone it
        cloneTarget        : true,
        // Only allow drops on scheduled tasks
        dropTargetSelector : '.b-sch-event',

        // Only allow dragging cell elements inside on the equipment grid
        targetSelector : '.b-grid-cell'
    };

    construct(config) {
        const me = this;

        super.construct(config);

        me.on({
            dragstart : me.onEquipmentDragStart,
            drop      : me.onEquipmentDrop,
            thisObj   : me
        });
    }

    onEquipmentDragStart({ event, context }) {
        // save a reference to the equipment so we can access it later
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.element.classList.add('b-dragging-event');
    }

    async onEquipmentDrop({ context }) {
        const { target } = context;

        if (context.valid) {
            const
                equipmentItem = context.equipment,
                eventRecord   = this.schedule.resolveEventRecord(target);

            if (eventRecord.equipment.includes(equipmentItem.id)) {
                context.valid = false;
                Toast.show(`${equipmentItem.name} is already assigned to ${eventRecord.name}`);
            }
            else {

                const
                    equipmentWrap = context.target.closest('.b-sch-event').querySelector('.b-sch-event-footer'),
                    animTarget    = equipmentWrap && (equipmentWrap.lastElementChild || equipmentWrap);

                if (animTarget) {
                    await this.animateProxyTo(animTarget, {
                        align  : 'l0-r14',
                        offset : [
                            equipmentWrap?.lastElementChild ? parseInt(getComputedStyle(equipmentWrap.lastElementChild).marginInlineEnd) : 0
                        ]
                    });
                }
                eventRecord.equipment = eventRecord.equipment.concat(equipmentItem.id);
                // Dropped on a scheduled event, display toast
                Toast.show(`Added ${equipmentItem.name} to ${eventRecord.name}`);
            }
        }

        this.schedule.element.classList.remove('b-dragging-event');

    }
}
