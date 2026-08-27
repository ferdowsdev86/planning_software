import { Combo, Model, Store } from '@bryntum/schedulerpro';

export default class RoomThemeCombo extends Combo {
    icon : HTMLElement;
    static type          = 'roomthemecombo';
    static get configurable() {
        return {
            items : [
                { value : 1, text : 'Beachfront Bliss', iconCls : 'fa fa-umbrella-beach' },
                { value : 2, text : 'Cityscape Retreat', iconCls : 'fa fa-city' },
                { value : 3, text : 'Jungle Hideaway', iconCls : 'fa fa-leaf' },
                { value : 4, text : 'Artistic Haven', iconCls : 'fa fa-paint-brush' },
                { value : 5, text : 'Alpine Getaway', iconCls : 'fa fa-snowflake' }
            ],
            picker : {
                minWidth : '11em'
            },
            listItemTpl : ({ text, iconCls }) => `
                <div>
                    <i style="margin-inline-end: 0.5em" class="${iconCls}"></i>
                    <small>${text}</small>
                </div>
            `
        };
    }

    syncInputFieldValue(...args) {
        const theme = (this.store as Store).getById(this.value as number);
        this.icon.className = `${(theme as Model & { iconCls : string })?.iconCls}`;
        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                style     : {
                    marginInlineStart : '.8em',
                    marginInlineEnd   : '-.3em'
                }
            },
            ...super.innerElements
        ];
    }
}

// Register class to be able to create widget by type
RoomThemeCombo.initClass();
