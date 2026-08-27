<script setup lang="ts">

import { type ButtonConfig, type ButtonListenersTypes, type ComboListenersTypes, DateHelper, Model, Toast, type ViewPresetConfig } from '@bryntum/schedulerpro';
import { BryntumToolbar, type BryntumToolbarProps } from '@bryntum/schedulerpro-vue-3';

class PresetModel extends Model {
    declare name: string;
    declare value: number;
    declare preset: ViewPresetConfig;
}

// Some variables used in this demo
const
    startHour = 7,
    endHour   = 20;

const props = defineProps({
    onToggleLayout : {
        type    : Function,
        default : () => {}
    },
    schedulerProRefFn : {
        type    : Function,
        default : () => {}
    }
});

const getSchedulerPro = () => props.schedulerProRefFn().value.instance.value;

const onSave = () => {
    Toast.show('TODO: Save data (see onSave() event for SchedulerPro)');
};

const onSelect: ComboListenersTypes['select'] = ({ record }) => {
    const schedulerPro = getSchedulerPro();
    if (!schedulerPro) {
        return;
    }

    const
        preset    = record as PresetModel,
        value     = preset.value,
        startDate = DateHelper.add(DateHelper.clearTime(schedulerPro.startDate), startHour, 'h'),
        endDate   = DateHelper.add(startDate, value - 1, 'd');
    endDate.setHours(endHour);
    schedulerPro.viewPreset = preset.preset;
    schedulerPro.setTimeSpan(startDate, endDate);
    schedulerPro.scrollLeft = 0;
};

const onShiftPrevious: ButtonListenersTypes['action'] = () => getSchedulerPro()!.shiftPrevious();

const onShiftNext: ButtonListenersTypes['action'] = () => getSchedulerPro()!.shiftNext();

const onClickToday: ButtonListenersTypes['action'] = () => {
    const startDate = DateHelper.clearTime(new Date());
    getSchedulerPro()!.setTimeSpan(DateHelper.add(startDate, startHour, 'h'), DateHelper.add(startDate, endHour, 'h'));
};

const toolbarProps: BryntumToolbarProps = {
    items : [
        {
            text     : 'Save',
            width    : 100,
            ref      : 'saveButton',
            disabled : true,
            onAction : onSave
        },
        {
            type         : 'combo',
            ref          : 'preset',
            editable     : false,
            label        : 'Show',
            value        : 1,
            valueField   : 'value',
            displayField : 'name',
            items        : [
                {
                    name   : '1 day',
                    value  : 1,
                    preset : {
                        base      : 'hourAndDay',
                        tickWidth : 45
                    }
                },
                {
                    name   : '3 days',
                    value  : 3,
                    preset : {
                        base : 'dayAndWeek'
                    }
                },
                {
                    name   : '1 week',
                    value  : 7,
                    preset : {
                        base : 'dayAndWeek'
                    }
                }
            ],
            onSelect
        },
        {
            type  : 'buttonGroup',
            style : 'margin-inline:auto',
            items : [
                {
                    type     : 'button',
                    icon     : 'fa fa-chevron-left',
                    tooltip  : 'Shift previous',
                    onAction : onShiftPrevious
                },
                {
                    type     : 'button',
                    text     : 'Today',
                    onAction : onClickToday
                },
                {
                    type     : 'button',
                    icon     : 'fa fa-chevron-right',
                    tooltip  : 'Shift next',
                    onAction : onShiftNext
                }
            ]
        },
        {
            type     : 'button',
            icon     : 'fa fa-columns',
            tooltip  : 'Toggle layout',
            ref      : 'toggle-layout', // for testing purpose
            onAction : props.onToggleLayout
        } as ButtonConfig
    ]
};

</script>

<template>
    <bryntum-toolbar
        v-bind="toolbarProps"
    />
</template>
