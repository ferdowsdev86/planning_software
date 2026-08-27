import { BryntumGridProps } from '@bryntum/grid-react-thin';
import { BryntumSchedulerProProps } from '@bryntum/schedulerpro-react-thin';
import { Model, StringHelper } from '@bryntum/core-thin';
import '@bryntum/scheduler-thin'; // Makes the resourceInfo column type available
import styles from '../App.module.scss';
import EventModel from '../../data/model/TaskModel';

export const schedulerProProps: BryntumSchedulerProProps = {
    cls        : styles.scheduler,
    viewPreset : 'hourAndDay',
    barMargin  : 10,
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    filterFeature       : true,
    dependenciesFeature : true,
    timeRangesFeature   : {
        showCurrentTimeLine : true
    },

    columns : [
        { type : 'resourceInfo', field : 'name', text : 'User', width : 200 }
    ]
};

export const unplannedGridProps: BryntumGridProps = {
    cls       : styles.grid,
    rowHeight : 50,
    columns   : [
        {
            text       : 'Unassigned tasks',
            flex       : 1,
            field      : 'name',
            htmlEncode : false,
            renderer   : (data: { record: Model }) => {
                const record = data.record as EventModel;
                return StringHelper.xss`<i class="${record.iconCls}"></i>${record.name}`;
            }
        },
        {
            text     : 'Duration',
            width    : 100,
            align    : 'right',
            editor   : false,
            field    : 'duration',
            renderer : (data: { record: Model }) => {
                const record = data.record as EventModel;
                return StringHelper.xss`${record.duration} ${record.durationUnit}`;
            }
        }
    ],
    stripeFeature : true,
    sortFeature   : 'name'
};

