import { BryntumSchedulerProps } from '@bryntum/schedulerpro-react-thin';
import '@bryntum/schedulerpro-thin'; // Makes the resourceInfo column type available
import styles from '../App.module.scss';

export const schedulerProps: BryntumSchedulerProps = {

    cls : styles.scheduler,

    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    viewPreset : 'weekAndDayLetter',

    barMargin : 10,
    startDate : new Date(2025, 2, 24),

    filterFeature       : true,
    dependenciesFeature : true,
    timeRangesFeature   : {
        showCurrentTimeLine : true
    },

    columns : [
        { type : 'resourceInfo', field : 'name', text : 'User', width : 250 }
    ]
};
