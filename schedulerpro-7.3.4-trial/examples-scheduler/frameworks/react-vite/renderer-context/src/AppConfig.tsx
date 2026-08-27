import { type BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import Resource from './components/Resource';
import Event, { AppEventModel } from './components/Event';
import ColumnHeaderContent from './components/ColumnHeaderContent';

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    resourceImages : {
        path      : 'users/',
        extension : '.png'
    },
    startDate        : new Date(2023, 5, 1, 6),
    endDate          : new Date(2023, 5, 1, 20),
    viewPreset       : 'hourAndDay',
    rowHeight        : 70,
    barMargin        : 5,
    multiEventSelect : true,

    // Event renderer returns JSX component
    eventRenderer : ({ eventRecord, assignmentRecord }) => (
        <Event
            key={assignmentRecord.id}
            eventRecord={eventRecord as AppEventModel}
        ></Event>
    ),

    crudManager : {
        autoLoad         : true,
        loadUrl          : 'data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    treeFeature : true,

    columns : [
        {
            type     : 'tree',
            field    : 'name',
            text     : 'Name',
            width    : 170,
            renderer : ({ record, row }) => {
                return <Resource record={record} row={row}/>;
            },
            headerRenderer : ({ column }) => {
                column.headerWidgets = [{
                    type : 'widget',
                    html : <ColumnHeaderContent
                        text="Name"
                    />
                }];
            }
        }
    ]

};
