import Combo from '../../../lib/Core/widget/Combo.js';

// Custom combo containing icons to pick from
export default class IconCombo extends Combo {

    static type = 'iconcombo';

    static configurable = {
        items : [
            { value : 'fa fa-asterisk', text : 'Asterisk' },
            { value : 'fa fa-fw fa-beer', text : 'Beer' },
            { value : 'fa fa-fw fa-book', text : 'Book' },
            { value : 'fa fa-fw fa-bug', text : 'Bug' },
            { value : 'fa fa-building', text : 'Building' },
            { value : 'fa fa-coffee', text : 'Coffee' },
            { value : 'fa fa-fw fa-cog', text : 'Cog' },
            { value : 'fa fa-fw fa-dumbbell', text : 'Dumbbell' },
            { value : 'fa fa-laptop', text : 'Laptop' },
            { value : 'fa fa-fw fa-plane', text : 'Plane' },
            { value : 'fa fa-fw fa-phone', text : 'Phone' },
            { value : 'fa fa-fw fa-question', text : 'Question' },
            { value : 'fa fa-fw fa-life-ring', text : 'Ring' },
            { value : 'fa fa-sync', text : 'Sync' },
            { value : 'fa fa-user', text : 'User' },
            { value : 'fa fa-users', text : 'Users' },
            { value : 'fa fa-video', text : 'Video' }
        ],

        listItemTpl : item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
    };

    syncInputFieldValue(...args) {
        this.icon.className = this.value;
        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                className : 'fa fa-cog',
                style     : {
                    marginLeft  : '.8em',
                    marginRight : '-.3em'
                }
            },
            ...super.innerElements
        ];
    }
}

// Register class to be able to create widget by type
IconCombo.initClass();
