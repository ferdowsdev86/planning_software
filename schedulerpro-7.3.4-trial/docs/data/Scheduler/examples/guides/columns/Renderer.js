const scheduler = new Scheduler({
    appendTo : targetElement,

    autoHeight : true,

    resources : [
        { id : 1, name : 'Don Taylor', color : 'blue' },
        { id : 2, name : 'John Adams', color : 'pink' },
        { id : 3, name : 'Linda Moore', color : 'lime' }
    ],
    startDate : new Date(2018, 0, 7),
    endDate   : new Date(2018, 0, 21),

    columns : [
        {
            field : 'name',
            text  : 'Name',
            width : 150,
            renderer({ cellElement, record }) {
                const color = record.color.toLowerCase();
                cellElement.style.backgroundColor = `color-mix(in srgb, var(--b-color-${color}), var(--b-mix) 90%)`;
                cellElement.style.color           = `color-mix(in srgb, var(--b-color-${color}), var(--b-opposite) 20%)`;
                return record.name;
            }
        }
    ]
});
