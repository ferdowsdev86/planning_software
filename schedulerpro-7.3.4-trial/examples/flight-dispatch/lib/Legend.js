import List from '../../../lib/Core/widget/List.js';

// Custom legend that allows user to filter by clicking labels
export default class Legend extends List {
    static $name   = 'Legend';
    static type = 'legend';

    static configurable = {
        multiSelect : true,
        itemTpl     : record => `${record.icon ? `
            <i class="${record.icon} b-colorize b-color-${record.color}"></i>` : `<div class="b-colorize b-color-square b-color-${record.color}"></div>`}
            <span class="b-legend-text">${record.text}</span>
        `,
        store : {
            fields : ['icon'],
            data   : [
                {
                    text  : 'Non-mutable',
                    color : 'pink'
                },
                {
                    text  : 'Mutable',
                    color : 'indigo'
                },
                {
                    text  : 'Changed',
                    color : 'purple'
                },
                {
                    text  : 'Maintenance',
                    color : 'lime'
                },
                {
                    text  : 'Overlap',
                    color : 'violet'
                },
                {
                    text  : 'Delayed',
                    color : 'orange'
                },
                {
                    text  : 'Shortened',
                    color : 'teal'
                },
                {
                    text  : 'Tail violation',
                    icon  : 'fa fa-warning',
                    color : 'red'
                },
                {
                    text  : 'No escape',
                    color : 'deep-orange'
                },
                {
                    text  : 'Locked',
                    icon  : 'fa fa-lock',
                    color : 'pink'
                },
                {
                    text  : 'Crew feasibility',
                    icon  : 'fa fa-person',
                    color : 'blue'
                },
                {
                    text  : 'Crew link',
                    icon  : 'fa fa-minus',
                    color : 'blue'
                },
                {
                    text  : 'Uncertainty',
                    icon  : 'fa fa-warning',
                    color : 'gray'
                }
            ]
        }
    };
}
Legend.initClass();
