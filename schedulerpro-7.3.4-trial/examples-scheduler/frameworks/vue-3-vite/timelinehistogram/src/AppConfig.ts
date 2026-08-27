import { TimelineHistogram, Widget } from '@bryntum/schedulerpro';
import type { BryntumTimelineHistogramProps } from '@bryntum/schedulerpro-vue-3';

const getHistogram = (source: Widget) => (source.up(TimelineHistogram.type) as TimelineHistogram);

export const histogramProps: BryntumTimelineHistogramProps = {
    startDate : new Date(2023, 0, 1),
    endDate   : new Date(2023, 2, 1),
    cls       : 'b-hide-maxWork b-hide-work',
    tickSize  : 35,

    columns : [
        {
            type  : 'tree',
            text  : 'Name',
            field : 'name',
            width : 200
        },
        {
            text  : 'Company',
            field : 'company'
        },
        {
            text  : 'City',
            field : 'city'
        }
    ],

    // configure histogram displayed series of values
    series : {
        work : {
            type : 'bar'
        },
        maxWork : {
            type : 'outline'
        },
        travelTime : {
            type : 'bar'
        }
    },

    // Bars styling
    getBarClass(series, _rectConfig, datum) {
        const data = datum as { work : number; maxWork : number };
        // indicate bars entries having work greater than maxWork with "too-much-work" CSS class
        if (series.id === 'work' && data.work > data.maxWork) {
            return 'too-much-work';
        }

        return '';
    },

    treeFeature : true,

    // Header date range and zoom items are disabled
    // because data exists for initial range and zoom level only
    timeAxisHeaderMenuFeature : {
        items : {
            zoomLevel : false,
            dateRange : false
        }
    },

    store : {
        autoLoad : true,
        readUrl  : 'data/data.json'
    },
    tbar : [
        {
            type : 'label',
            text : 'Show series'
        },
        {
            type      : 'buttongroup',
            cls       : 'hide-buttons',
            rendition : 'padded',
            defaults  : {
                toggleable : true
            },
            items : [
                {
                    type    : 'button',
                    text    : 'Work',
                    tooltip : 'Display Work bars',
                    cls     : 'work-button',
                    icon    : 'fa-chart-simple',
                    onAction({ source }) {
                        // We toggle the series visibility by setting a special class on the
                        // histogram component element.
                        // Check "resource/app.css" file to see how it's done.
                        getHistogram(source).element.classList.toggle('b-hide-work');
                    }
                },
                {
                    type    : 'button',
                    text    : 'Max Work',
                    tooltip : 'Display Max Work outline',
                    cls     : 'maxWork-button',
                    icon    : 'fa-chart-line',
                    onAction({ source }) {
                        getHistogram(source).element.classList.toggle('b-hide-maxWork');
                    }
                },
                {
                    type    : 'button',
                    text    : 'Travel Time',
                    pressed : true,
                    tooltip : 'Display Travel Time bars',
                    cls     : 'travelTime-button',
                    icon    : 'fa-chart-simple',
                    onAction({ source }) {
                        getHistogram(source).element.classList.toggle('b-hide-travelTime');
                    }
                }
            ]
        }
    ]
};
