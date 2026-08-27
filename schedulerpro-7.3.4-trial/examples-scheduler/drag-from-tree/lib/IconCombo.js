import Combo from '../../../lib/Core/widget/Combo.js';

// Custom combo containing icons to pick from
export default class IconCombo extends Combo {

    static type = 'iconcombo';

    static configurable = {
        cls : 'b-icon-combo',

        picker : {
            cls : 'b-icon-combo-picker'
        },

        items : [
            { value : 'fa fa-fw fa-arrow-up', text : 'Arrow up' },
            { value : 'fa fa-fw fa-asterisk', text : 'Asterisk' },
            { value : 'fa fa-fw fa-beer', text : 'Beer' },
            { value : 'fa fa-fw fa-book', text : 'Book' },
            { value : 'fa fa-fw fa-bug', text : 'Bug' },
            { value : 'fa fa-fw fa-building', text : 'Building' },
            { value : 'fa fa-fw fa-code', text : 'Code' },
            { value : 'fa fa-fw fa-coffee', text : 'Coffee' },
            { value : 'fa fa-fw fa-cog', text : 'Cog' },
            { value : 'fa fa-fw fa-database', text : 'Database' },
            { value : 'fa fa-fw fa-dumbbell', text : 'Dumbbell' },
            { value : 'fa fa-fw fa-keyboard', text : 'Keyboard' },
            { value : 'fa fa-fw fa-laptop', text : 'Laptop' },
            { value : 'fa fa-fw fa-laptop-code', text : 'Laptop code' },
            { value : 'fa fa-fw fa-lock', text : 'Lock' },
            { value : 'fa fa-fw fa-phone', text : 'Phone' },
            { value : 'fa fa-fw fa-plane', text : 'Plane' },
            { value : 'fa fa-fw fa-power-off', text : 'Power off' },
            { value : 'fa fa-fw fa-question', text : 'Question' },
            { value : 'fa fa-fw fa-life-ring', text : 'Ring' },
            { value : 'fa fa-fw fa-server', text : 'Server' },
            { value : 'fa fa-fw fa-sync', text : 'Sync' },
            { value : 'fa fa-fw fa-user', text : 'User' },
            { value : 'fa fa-fw fa-users', text : 'Users' },
            { value : 'fa fa-fw fa-video', text : 'Video' }
        ],

        listItemTpl : item => `<i class="${item.value}"></i>${item.text}`
    };

    syncInputFieldValue(...args) {
        this.icon.className = this.value ?? '';
        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                className : 'fa fa-cog'
            },
            ...super.innerElements
        ];
    }
}

// Register class to be able to create widget by type
IconCombo.initClass();
