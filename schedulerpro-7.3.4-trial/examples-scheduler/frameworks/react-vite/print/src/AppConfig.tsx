import type { BryntumSchedulerProps } from '@bryntum/schedulerpro-react';
import { DataGenerator, DateHelper, Scheduler, Widget } from '@bryntum/schedulerpro';
import AppEventModel from './lib/AppEventModel';

const
    getScheduler  = (widget: Widget) => widget.up(Scheduler.type) as Scheduler,
    viewStartDate = DateHelper.clearTime(new Date(2025, 12, 0)),
    viewEndDate   = DateHelper.add(viewStartDate, 3, 'weeks');

export const schedulerProps: BryntumSchedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : 'traced',
    rowHeight  : 50,

    // Generate random data
    ...(DataGenerator).generateEvents({
        viewStartDate,
        viewEndDate,
        nbrResources : 40,
        nbrEvents    : 5,
        tickUnit     : 'day',
        minDuration  : 4,
        dependencies : true
    }),

    crudManager : {
        eventStore : {
            // Custom SchedulerEventModel class
            // @ts-ignore
            modelClass : AppEventModel
        }
    },

    columns : [
        {
            type : 'rownumber'
        },
        {
            type  : 'column',
            text  : 'Name',
            field : 'name',
            flex  : 1,
            // JSX cell renderer
            renderer({ record }) {
                return <span>{(record as AppEventModel).name}</span>;
            }
        },
        {
            type  : 'number',
            text  : 'Score',
            field : 'score',
            width : 70
        }
    ],

    subGridConfigs : {
        locked : {
            width : 420
        }
    },

    // Disabled the dependencies feature at the start and use can enable it at runtime using the slider in tbar
    dependenciesFeature : {
        disabled : true
    },

    printFeature : {
        headerTpl : ({ currentPage, totalPages }) => `
            <img alt="Company logo" src="favicon.png"/>
            <span>${document.title}</span>
            <dl>
                <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
                <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
            </dl>
        `,
        footerTpl : () => `
            <h3>© ${new Date().getFullYear()} Bryntum AB</h3>
        `
    },

    tbar : [
        {
            type : 'slidetoggle',
            text : 'Show dependencies',
            onChange({ checked, source }) {
                getScheduler(source).features.dependencies.disabled = !checked;
            }
        },
        {
            type : 'button',
            icon : 'fa fa-print',
            text : 'Print',
            onClick({ source }) {
                getScheduler(source).features.print.showPrintDialog();
            }
        }
    ],

    // JSX event renderer
    eventRenderer : ({ eventRecord }) => {
        return <div>{eventRecord.name}</div>;
    }
};
