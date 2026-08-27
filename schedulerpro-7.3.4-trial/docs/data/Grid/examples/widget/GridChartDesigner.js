class WeatherObservation extends Model {
    static fields = [{
        name : 'date',
        type : 'date'
    }, {
        name : 'temperature',
        type : 'number'
    }, {
        name : 'humidity',
        type : 'number'
    }, {
        name : 'windSpeed',
        type : 'number'
    }, {
        name : 'precipitation',
        type : 'number'
    }, {
        name : 'pressure',
        type : 'number'
    }];

    static idField = 'chartTypeId';
}

const records = [
    {
        id            : 1,
        date          : '2023-01-31',
        temperature   : 22.49,
        humidity      : 31.24,
        windSpeed     : 12.24,
        precipitation : 60.75,
        pressure      : 962.20
    },
    {
        id            : 2,
        date          : '2023-02-28',
        temperature   : 34.01,
        humidity      : 88.19,
        windSpeed     : 2.79,
        precipitation : 17.05,
        pressure      : 999.52
    },
    {
        id            : 3,
        date          : '2023-03-31',
        temperature   : 29.64,
        humidity      : 79.95,
        windSpeed     : 5.84,
        precipitation : 6.51,
        pressure      : 953.44
    },
    {
        id            : 4,
        date          : '2023-04-30',
        temperature   : 26.97,
        humidity      : 42.74,
        windSpeed     : 7.33,
        precipitation : 94.89,
        pressure      : 1040.93
    },
    {
        id            : 5,
        date          : '2023-05-31',
        temperature   : 18.12,
        humidity      : 40.91,
        windSpeed     : 9.12,
        precipitation : 96.56,
        pressure      : 975.88
    },
    {
        id            : 6,
        date          : '2023-06-30',
        temperature   : 18.12,
        humidity      : 41.00,
        windSpeed     : 15.70,
        precipitation : 80.84,
        pressure      : 1016.25
    },
    {
        id            : 7,
        date          : '2023-07-31',
        temperature   : 16.16,
        humidity      : 48.25,
        windSpeed     : 3.99,
        precipitation : 30.46,
        pressure      : 981.17
    },
    {
        id            : 8,
        date          : '2023-08-31',
        temperature   : 32.32,
        humidity      : 61.49,
        windSpeed     : 10.28,
        precipitation : 9.77,
        pressure      : 1002.01
    },
    {
        id            : 9,
        date          : '2023-09-30',
        temperature   : 27.02,
        humidity      : 55.92,
        windSpeed     : 11.85,
        precipitation : 68.42,
        pressure      : 1004.67
    },
    {
        id            : 10,
        date          : '2023-10-31',
        temperature   : 29.16,
        humidity      : 47.47,
        windSpeed     : 0.93,
        precipitation : 44.02,
        pressure      : 968.49
    }
].map(data => new WeatherObservation(data));

const grid = new Grid({
    height  : '20em',
    width   : '100%',
    columns : [
        {
            id    : 1,
            text  : 'Date',
            field : 'date',
            flex  : 1
        },
        {
            id    : 2,
            text  : 'Temperature',
            field : 'temperature',
            type  : 'number'
        },
        {
            id    : 3,
            text  : 'Humidity',
            field : 'humidity',
            type  : 'number'
        },
        {
            id    : 4,
            text  : 'Wind Speed',
            field : 'windSpeed',
            type  : 'number'
        },
        {
            id    : 5,
            text  : 'Precipitation',
            field : 'precipitation',
            type  : 'number'
        },
        {
            id    : 6,
            text  : 'Pressure',
            field : 'pressure',
            type  : 'number'
        }
    ],
    store : {
        modelClass : WeatherObservation,
        data       : records
    },
    selectionMode : {
        cell       : true,
        column     : true,
        dragSelect : true
    },
    features : {
        group : false
    }
});

new Container({
    appendTo : targetElement,
    items    : [
        {
            type   : 'gridchartdesigner',
            width  : '100%',
            height : '400px',
            grid,
            sync   : true
        },
        grid
    ]
});

grid.selectCellRange({ rowIndex : 0, columnIndex : 0 }, { rowIndex : 9, columnIndex : 4 });
