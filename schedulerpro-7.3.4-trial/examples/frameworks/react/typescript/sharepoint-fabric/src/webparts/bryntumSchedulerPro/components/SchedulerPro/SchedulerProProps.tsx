import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-react-thin';
import '@bryntum/scheduler-thin'; // Makes the resourceInfo column type available
import styles from '../App.module.scss';

export const schedulerProProps: BryntumSchedulerProProps = {

    cls : styles.schedulerPro,

    viewPreset : 'weekAndDayLetter',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    barMargin : 10,

    columns : [
        { type : 'resourceInfo', field : 'name', text : 'User', width : 250 }
    ],

    filterFeature : true,

    dependencyEditFeature : true,

    timeRangesFeature : {
        showCurrentTimeLine : true
    }
};
