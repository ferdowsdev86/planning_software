import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import Toast from '../../../lib/Core/widget/Toast.js';

export default class Drag extends DragHelper {
    static get configurable() {
        return {
            callOnFunctions      : true,
            // Don't drag the actual cell element, clone it
            cloneTarget          : true,
            // We size the cloned element using CSS
            autoSizeClonedTarget : false,

            // Only allow drops on scheduled tasks
            dropTargetSelector : '.b-sch-event',
            // Drag only the icon inside the cell
            proxySelector      : 'i',
            // Only allow dragging cell elements inside on the equipment grid
            targetSelector     : '.b-grid-row:not(.b-group-row) .b-grid-cell'
        };
    }

    // Listening to events using the onXXX notation, similar to this.on('dragStart', () => {})
    onDragStart({ context }) {
        // save a reference to the equipment so we can access it later
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.features.eventTooltip.disabled = true;
    }

    // In the onDrop, we instruct the drag helper to transition the drag proxy element to an approximate destination
    // before updating the event record (done in onDropFinalized)
    async onDrop({ context }) {
        if (context.valid) {
            const
                { target }    = context,
                equipmentItem = context.equipment,
                eventRecord   = this.schedule.resolveEventRecord(target);

            if (eventRecord.equipment.includes(equipmentItem.id)) {
                context.valid = false;
                Toast.show(`${equipmentItem.name} is already assigned to ${eventRecord.name}`);
            }
            else {
                const
                    equipmentWrap = context.target.closest('.b-sch-event').querySelector('.b-sch-event-equipment-wrap'),
                    animTarget    = equipmentWrap?.lastElementChild || equipmentWrap;

                if (animTarget) {
                    await this.animateProxyTo(animTarget, {
                        align  : 'l0-r14',
                        offset : [
                            equipmentWrap?.lastElementChild ? parseInt(getComputedStyle(equipmentWrap.lastElementChild).marginInlineEnd) : 0
                        ]
                    });
                }

                eventRecord.equipment = eventRecord.equipment.concat(equipmentItem.id);
                Toast.show(`Added ${equipmentItem.name} to ${eventRecord.name}`);
            }
        }
    }
}
