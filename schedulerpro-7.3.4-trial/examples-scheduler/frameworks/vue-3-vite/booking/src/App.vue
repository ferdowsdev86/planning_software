<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-vue-3';
import {
    type Button, DateHelper, DateRangeField, LocaleManager, ResourceTimeRangeStore, type Scheduler, type SchedulerListenersTypes, SlideToggle, StringHelper, type
    SummaryConfig
} from '@bryntum/schedulerpro';
import type { DailyRateModel } from './lib/DailyRateStore';
import type { PropertyModel } from './lib/PropertyModel';
import type { ReservationModel } from './lib/ReservationModel';
import './lib/DaySelectorFeature';
import { useSchedulerProps } from './AppConfig';

const schedulerRef = ref(null);
const getScheduler = () => schedulerRef.value.instance.value as Scheduler;

// Renderer method on summary feature
const summaryFeatureRenderer: SummaryConfig['renderer'] = ({ events }) => {
    const
        scheduler    = getScheduler(),
        countButton  = scheduler.widgetMap['countButton'] as Button,
        reservations = events as ReservationModel[],
        result       = countButton.pressed
            ? reservations.length
            : reservations.reduce((total, reservation) => total + reservation.guests, 0);
    return StringHelper.xss`${result || ''}`;
};

const getPricePerNightFor = (property: PropertyModel, date: Date) => {
    const
        scheduler               = getScheduler(),
        schedulerTimeRangeStore = scheduler.resourceTimeRangeStore as ResourceTimeRangeStore;

    const dayModel = schedulerTimeRangeStore.getRanges({
        resourceRecord : property,
        startDate      : date,
        endDate        : DateHelper.add(date, 1, 'day')
    })?.[0];

    return (dayModel as DailyRateModel)?.pricePerNight;
};

// Create a new booking when double-clicking an available day
const resourceTimeRangeDblClick: SchedulerListenersTypes['resourceTimeRangeDblClick'] = async(event) => {
    const scheduler = getScheduler();
    await scheduler.createEvent(event.resourceTimeRangeRecord.startDate as Date, event.resourceRecord);
};

const onBeforeEventAdd: SchedulerListenersTypes['beforeEventAdd'] = ({ eventRecord, resourceRecords }) => {
    const
        reservation           = eventRecord as ReservationModel,
        property              = resourceRecords[0] as PropertyModel;
    // Copy price over to the reservation record when created
    reservation.pricePerNight = getPricePerNightFor(property, eventRecord.startDate as Date);
};

const schedulerProps = reactive(useSchedulerProps(
    summaryFeatureRenderer, resourceTimeRangeDblClick, onBeforeEventAdd
));

onMounted(async() => {
    const
        scheduler               = schedulerRef.value.instance.value as Scheduler,
        { features, widgetMap } = scheduler,
        summaryButton           = widgetMap['summaryGroup'] as Button,
        selectedRowButton       = widgetMap['selectedRowButton'] as SlideToggle,
        viewRange               = widgetMap['viewRange'] as DateRangeField;

    summaryButton.onClick = () => features.summary.refresh();

    selectedRowButton.onChange = ({ checked }) => {
        features.summary.selectedOnly = checked;
    };

    viewRange.onChange = () => {
        scheduler.setConfig({
            startDate : viewRange.value[0],
            endDate   : viewRange.value[1]
        });
    };

    // Applying localization settings to translate the placeholder value from 'New Event' to 'Guest'
    // in english in the event editor
    await LocaleManager.applyLocale('En', {
        Object : {
            newEvent : 'Guest'
        }
    });
});

</script>

<template>
    <!-- BryntumDemoHeader component is used for Bryntum example styling only and can be removed -->
    <bryntum-demo-header />
    <bryntum-scheduler
        ref="schedulerRef"
        v-bind="schedulerProps"
    />
</template>

<style lang="scss">
@use './App.scss';
</style>
