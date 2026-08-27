// grid with WidgetColumn
const grid = new Grid({
    appendTo : targetElement,

    // makes grid as high as it needs to be to fit rows
    autoHeight : true,
    store      : {
        fields : ['price', 'inflightMeal', 'priorityBoarding'],
        data   : DataGenerator.generateData(5).map(data => {
            data.price = Math.round(Math.random() * 1000) + 100;
            return data;
        })
    },
    rowHeight : 100,
    columns   : [
        { field : 'city', text : 'Destination', flex : 1 },
        {
            type    : 'widget',
            text    : 'Extras',
            align   : 'center',
            width   : 300,
            widgets : [
                {
                    type  : 'checkbox',
                    name  : 'inflightMeal',
                    label : 'In-flight Meal'
                },
                {
                    type  : 'checkbox',
                    name  : 'priorityBoarding',
                    label : 'Priority boarding'
                }
            ]
        },
        {
            text       : 'Total price',
            align      : 'right',
            htmlEncode : false,
            renderer({ record }) {
                let total = record.price;

                if (record.inflightMeal) {
                    total += 30;
                }
                if (record.priorityBoarding) {
                    total += 50;
                }

                return `<strong>$ ${total}</strong>`;
            }
        },
        {
            type    : 'widget',
            text    : 'Button column',
            width   : 140,
            widgets : [{
                type      : 'button',
                rendition : 'filled',
                icon      : 'fa fa-plane',
                text      : 'Book now',
                flex      : 1,
                // 'up.' will find the implementation in the Grid
                onClick   : 'up.bookFlight'
            }]
        }
    ],

    bookFlight({ source : button }) {
        // The cell's widget has a cellInfo context block
        const { record } = button.cellInfo;

        Toast.show(
            `Booking a flight to ${record.city}.` +
            (record.inflightMeal ? ' Meal: \u2713' : '') +
            (record.priorityBoarding ? ' Priority: \u2713' : '')
        );
    }
});
