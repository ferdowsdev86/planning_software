import { useEffect, useRef } from 'react';
import { BryntumDemoHeader, BryntumScheduler } from '@bryntum/schedulerpro-react';
import {
    type Button, type ButtonGroup, DateHelper, LocaleManager, type ResourceTimeRangeStore, type Scheduler, type SchedulerListenersTypes,
    StringHelper, SummaryConfig
} from '@bryntum/schedulerpro';
import { DailyRateModel } from './lib/DailyRateStore';
import { PropertyModel } from './lib/PropertyModel';
import { ReservationModel } from './lib/ReservationModel';
import './lib/DaySelectorFeature';
import { useSchedulerProps } from './AppConfig';
import './App.scss';

function App() {

    const schedulerRef = useRef<BryntumScheduler>(null);
    const getScheduler = () => schedulerRef.current!.instance as Scheduler;

    useEffect(() => {
        const
            scheduler               = getScheduler(),
            { features, widgetMap } = scheduler,
            summaryButton           = widgetMap['summaryGroup'] as ButtonGroup,
            selectedRowButton       = widgetMap['selectedRowButton'] as Button;

        summaryButton.onClick = () => features.summary.refresh();

        selectedRowButton.onToggle = () => features.summary.selectedOnly = !features.summary.selectedOnly;

        // Applying localization settings to translate the placeholder value from 'New Event' to 'Guest'
        // in english in the event editor
        LocaleManager.applyLocale('En', {
            Object : {
                newEvent : 'Guest'
            }
        });
    }, []);

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

    const onBeforeEventAdd : SchedulerListenersTypes['beforeEventAdd'] = ({ eventRecord, resourceRecords }) => {
        const
            reservation = eventRecord as ReservationModel,
            property    = resourceRecords[0] as PropertyModel;
        // Copy price over to the reservation record when created
        reservation.pricePerNight = getPricePerNightFor(property, eventRecord.startDate as Date);
    };

    const schedulerProps = useSchedulerProps(summaryFeatureRenderer, resourceTimeRangeDblClick, onBeforeEventAdd);

    return (
        <>
            {/*BryntumDemoHeader component is used for Bryntum example styling only and can be removed*/}
            <BryntumDemoHeader/>
            <BryntumScheduler
                ref={schedulerRef}
                {...schedulerProps}
            />
        </>
    );
}

export default App;
