var {
    TimelineHistogram,
    DateHelper,
    StringHelper
} = window.bryntum.schedulerpro;
const histogram = new TimelineHistogram({
    appendTo   : 'container',
    startDate  : new Date(2023, 0, 1),
    endDate    : new Date(2023, 2, 1),
    tickSize   : 35,
    smoothZoom : true,
    columns    : [{
        type  : 'tree',
        text  : 'Name',
        field : 'name',
        width : 220
    }, {
        text  : 'Company',
        field : 'company',
        width : 120
    }, {
        text  : 'City',
        field : 'city',
        width : 110
    }],
    // configure histogram displayed series of values
    series : {
        work : {
            type     : 'bar',
            disabled : true
        },
        maxWork : {
            type     : 'outline',
            disabled : true
        },
        travelTime : {
            type : 'bar'
        }
    },
    // Custom function to get histogram data for the provided record
    async getRecordData(record) {
        const {
            count
        } = this.timeAxis;

        // get record histogram data from the server
        const response = await fetch('php/histogramdata.php?' + new URLSearchParams({
            // pass the record identifier and the time span we need data for
            recordId  : record.id,
            tickCount : count,
            startDate : DateHelper.format(this.startDate),
            endDate   : DateHelper.format(this.endDate)
        }));

        // return the responded data
        return response.json();
    },
    // enable bar tooltip showing
    showBarTip : true,
    // bar tooltip template
    barTooltipTemplate({
        datum,
        record
    }) {
        const {
            work,
            maxWork,
            travelTime
        } = datum;
        return StringHelper.xss`<i class="fa fa-edit"></i> <b>${record.name}</b><br><br>
            Work: <span style="${work > maxWork ? 'color:#f00' : ''}">${work}h</span> of ${maxWork}h<br>
            Travel Time: ${travelTime}h`;
    },
    // Bars styling
    getBarClass(series, _rectConfig, datum) {
    // indicate bars entries having work greater than maxWork with "too-much-work" CSS class
        if (series.id === 'work' && datum.work > datum.maxWork) {
            return 'too-much-work';
        }
        return '';
    },
    features : {
        tree      : true,
        treeGroup : {
            levels : ['city', 'company']
        }
    },
    store : {
        autoLoad : true,
        readUrl  : 'php/read.php'
    },
    tbar : [{
        type : 'label',
        text : 'Group by'
    }, {
        type : 'groupbar'
    }, {
        type : 'label',
        text : 'Show series'
    }, {
        type      : 'buttongroup',
        rendition : 'padded',
        cls       : 'hide-buttons',
        defaults  : {
            toggleable : true
        },
        items : [{
            text    : 'Work',
            tooltip : 'Display Work bars',
            cls     : 'work-button',
            icon    : 'fa fa-chart-simple',
            onAction() {
                const series = histogram.getSeries('work');
                series.disabled = !series.disabled;
            }
        }, {
            text    : 'Max Work',
            tooltip : 'Display Max Work outline',
            cls     : 'maxWork-button',
            icon    : 'fa fa-chart-line',
            onAction() {
                const series = histogram.getSeries('maxWork');
                series.disabled = !series.disabled;
            }
        }, {
            text    : 'Travel Time',
            pressed : true,
            tooltip : 'Display Travel Time bars',
            cls     : 'travelTime-button',
            icon    : 'fa fa-chart-simple',
            onAction() {
                const series = histogram.getSeries('travelTime');
                series.disabled = !series.disabled;
            }
        }]
    }, '->', {
        text    : 'Reload',
        tooltip : 'Load new random data',
        icon    : 'fa fa-recycle',
        color   : 'b-red',
        onAction() {
            histogram.store.load();
        }
    }]
});