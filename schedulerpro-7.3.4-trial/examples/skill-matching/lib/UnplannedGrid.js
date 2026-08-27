import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Grid from '../../../lib/Grid/view/Grid.js';
import '../../../lib/Grid/feature/Stripe.js';

// Custom grid that displays unplanned maintenance tasks
export default class UnplannedGrid extends Grid {
    static $name = 'UnplannedGrid';

    static configurable = {
        hideHeaders                : true,
        rowHeight                  : 65,
        disableGridRowModelWarning : true,
        collapsible                : true,
        flex                       : '0 0 320px',
        ui                         : 'toolbar',
        title                      : 'Unplanned maintenance',
        emptyText                  : 'No unplanned maintenance',
        selectionMode              : {
            multiSelect : false
        },
        features : {
            stripe : true,
            sort   : 'name'
        },

        columns : [
            {
                flex       : 1,
                field      : 'name',
                id         : 'name', // for state
                cellCls    : 'unscheduledNameCell',
                htmlEncode : false,
                renderer   : ({ record : task }) => `
                        <div class="vehicle-ct">
                            <i class="${StringHelper.encodeHtml(task.iconCls) || ''}"></i>
                            <span class="licensePlate">${StringHelper.encodeHtml(task.licensePlate)}</span>
                        </div>
                        <div class="name-container">
                            <div class="main-info"><span class="task-name">${StringHelper.encodeHtml(task.name)}</span></div>
                            <div class="meta-info"><ul class="skills">${task.requiredSkillNames.map(skill => `<li data-btip="This task requires a technician with the following skills: <strong>${task.requiredSkillNames.join(', ')}</strong>">${skill}</li>`).join('')}</ul><span class="duration">${task.duration ? task.duration + 'h' : ''}</span></div>
                        </div>
                    `
            }
        ]
    };
}
