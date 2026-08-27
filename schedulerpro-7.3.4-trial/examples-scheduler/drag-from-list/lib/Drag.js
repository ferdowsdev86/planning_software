import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import Toast from '../../../lib/Core/widget/Toast.js';

export default class Drag extends DragHelper {
    static configurable = {
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
        targetSelector     : '.b-list-item'
    };

    // Listening to events using the onXXX notation, similar to this.on('dragStart', () => {})
    onDragStart({ event, context }) {
        // save a reference to the equipment so we can access it later
        context.equipment = this.equipmentList.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.features.eventTooltip.disabled = true;
    }

    // In the onDrop, we instruct the drag helper to transition the drag proxy element to an approximate destination
    // before updating the event record (done in onDropFinalized)
    async onDrop({ context }) {
        const { target } = context;

        if (context.valid) {
            const
                equipment   = context.equipment,
                eventRecord = this.schedule.resolveEventRecord(target),
                alignTarget = target.closest('.b-sch-event').querySelector('.b-sch-event-equipment-wrap');

            await this.animateProxyTo(alignTarget, {
                align  : 'l0-r0',
                offset : [0, -11]
            });

            eventRecord.equipment = eventRecord.equipment.concat(equipment);

            // Show a toast
            Toast.show(`Added ${equipment.name} to ${eventRecord.name}`);
        }

        this.schedule.features.eventTooltip.disabled = false;
    }
}
