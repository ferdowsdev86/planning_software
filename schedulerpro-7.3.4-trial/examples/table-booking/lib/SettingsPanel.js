import Panel from '../../../lib/Core/widget/Panel.js';
import  '../../../lib/Core/widget/Slider.js';
import '../../../lib/Core/widget/RadioGroup.js';

export default class SettingsPanel extends Panel {
    static configurable = {
        drawer : {
            autoClose : true
        },
        title : 'Settings',
        width : 400,
        items : {
            container : {
                type  : 'container',
                items : {
                    rowHeight : {
                        type    : 'radiogroup',
                        label   : 'Row height',
                        inline  : true,
                        value   : '30',
                        options : {
                            30  : 'Small',
                            70  : 'Medium',
                            100 : 'Large'
                        },
                        onChange : 'up.onRowHeightChange'
                    },
                    tickWidth : {
                        type      : 'slider',
                        label     : 'Time Cell Width',
                        min       : 40,
                        max       : 100,
                        showValue : true,
                        unit      : 'px',
                        onInput   : 'up.onTickWidthSliderChange'
                    },
                    seatingLength : {
                        type   : 'radiogroup',
                        label  : 'Seating length',
                        inline : true,
                        items  : [
                            { text : 'Two hours', checkedValue : 2 },
                            { text : 'One hour', checkedValue : 1 }
                        ],
                        onChange : 'up.onSeatingLengthChange'
                    }
                }
            },
            bottomContainer : {
                type  : 'container',
                items : {
                    leftSectionToggle : {
                        type     : 'slidetoggle',
                        text     : 'Hide left section',
                        onChange : 'up.onLeftSectionToggle'
                    },
                    eventTimesToggle : {
                        type     : 'slidetoggle',
                        text     : 'Show event times',
                        checked  : true,
                        onChange : 'up.onShowEventTimesToggle'
                    }
                }
            }
        }
    };

    construct({ scheduler }) {
        super.construct(...arguments);

        this.widgetMap.tickWidth.value = scheduler.tickSize;
    }

    onRowHeightChange({ value }) {
        this.scheduler.rowHeight = Number(value);
    }

    onTickWidthSliderChange({ value }) {
        this.scheduler.tickSize = value;
    }

    onSeatingLengthChange({ value }) {
        this.scheduler.tickSize = this.widgetMap.tickWidth.value = value === 2 ? 40 : 80;
    }

    onLeftSectionToggle({ value }) {
        this.scheduler.subGrids.locked.toggleCollapse();
    }

    onShowEventTimesToggle({ value }) {
        this.scheduler.toggleCls('b-show-event-times', value);
    }
}
