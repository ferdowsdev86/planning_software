import { List, ListConfig, Model } from '@bryntum/schedulerpro';

/**
 * Custom legend that allows user to filter by clicking labels
 */

export class LegendRecord extends Model {
    declare icon: string;
    declare color: string;
    declare text: string;

    static override get fields() {
        return [
            { name : 'icon', type : 'string' },
            { name : 'color', type : 'string' },
            { name : 'text', type : 'string' }
        ];
    }
}

export type LegendConfig = ListConfig & {
    type : 'legendlist'
};

export class Legend extends List {
    static override $name = 'Legend';
    static override type  = 'legent';

    static configurable = {
        multiSelect : true,
        itemTpl     : (record : Model) => {
            const legend = record as LegendRecord;
            return `${legend.icon ? `
                <i class="b-icon ${legend.icon} b-colorize b-color-${legend.color}"></i>` : `<div class="b-colorize b-color-square b-color-${legend.color}"></div>`}
                <span class="b-legend-text">${legend.text}</span>
            `;
        },
        store : {
            modelClass : LegendRecord,
            data       : [
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
    } as ListConfig;
}

Legend.initClass();
