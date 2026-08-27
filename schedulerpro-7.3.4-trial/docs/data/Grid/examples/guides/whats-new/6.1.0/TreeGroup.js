new Grid({
    appendTo : targetElement,
    features : {
        tree      : true,
        treeGroup : {
            levels : [
                'airline'
            ]
        }
    },
    autoHeight : true,
    columns    : [
        {
            type  : 'tree',
            text  : 'Airline',
            field : 'airline',
            flex  : 1
        },
        {
            text  : 'Flight',
            field : 'flight',
            flex  : 1
        },
        {
            type  : 'number',
            text  : 'Capacity',
            field : 'capacity',
            flex  : 1,
            sum   : 'add'
        },
        {
            type  : 'number',
            text  : 'Crew',
            field : 'crew',
            flex  : 1,
            sum   : 'add'
        }
    ],
    data : [
        {
            airline  : 'Delta',
            flight   : 'DL123',
            capacity : 180,
            crew     : 8
        },
        {
            airline  : 'American Airlines',
            flight   : 'AA456',
            capacity : 200,
            crew     : 9
        },
        {
            airline  : 'United Airlines',
            flight   : 'UA789',
            capacity : 210,
            crew     : 10
        },
        {
            airline  : 'United Airlines',
            flight   : 'UA101',
            capacity : 175,
            crew     : 7
        },
        {
            airline  : 'British Airways',
            flight   : 'BA234',
            capacity : 250,
            crew     : 12
        },
        {
            airline  : 'Air France',
            flight   : 'AF567',
            capacity : 220,
            crew     : 11
        },
        {
            airline  : 'Air France',
            flight   : 'AF569',
            capacity : 240,
            crew     : 12
        },
        {
            airline  : 'Qantas',
            flight   : 'QF672',
            capacity : 300,
            crew     : 15
        },
        {
            airline  : 'Qantas',
            flight   : 'QF678',
            capacity : 260,
            crew     : 13
        },
        {
            airline  : 'Singapore Airlines',
            flight   : 'SQ901',
            capacity : 280,
            crew     : 14
        }
    ]
});
