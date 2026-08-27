//<code-header>
CSSHelper.insertRule('#datePickerRenderer .b-calendar-panel-cell .b-date-picker-cell-inner { padding:0.5em 1.2em 1.2em 1.2em;}', targetElement.getRootNode());
CSSHelper.insertRule('#datePickerRenderer .b-date-picker-cell-payload { bottom:0.75em;}', targetElement.getRootNode());
CSSHelper.insertRule('.price { font-size: 0.7em;}', targetElement.getRootNode());
CSSHelper.insertRule('.b-calendar-panel-cell:not(.b-active-date) .price { opacity:0.65; }', targetElement.getRootNode());
//</code-header>
const prices = [
    110, 80, 0, 70, 120, 80, 90,
    90, 110, 80, 0, 0, 120, 80, 90,
    90, 130, 60, 0, 70, 80, 90
];

// uneditable datefield (user only allowed to use picker)
new DateField({
    labelPosition : 'above',
    label         : 'Not editable',
    editable      : false,
    appendTo      : targetElement,
    style         : 'margin-right: .5em'
});

//editable datefield (user can type)
new DateField({
    labelPosition : 'above',
    label         : 'Editable',
    editable      : true,
    appendTo      : targetElement,
    style         : 'margin-right: .5em',
    picker        : {
        id            : 'datePickerRenderer',
        disabledDates : ['2025-01-10'],
        date          : '2025-01-03',
        // Show some extra info in each day cell
        cellRenderer({ cell, cellPayload, date }) {
            const
                sameMonth = date.getMonth() === this.date.getMonth(),
                price     = prices[date.getDate()];

            cellPayload.classList.add('price');
            cellPayload.innerHTML = `${sameMonth && price ? ('$' + price) : '&nbsp;'}`;

            delete cell.dataset.btip;
            if (sameMonth) {
                cell.dataset.btip = price ? `Flights available from: <strong>$${price}</strong>` : 'No flights available';
            }
        }
    }
});

//invalid datefield
new DateField({
    labelPosition : 'above',
    label         : 'Invalid',
    min           : new Date(2018, 4, 18),
    value         : new Date(2018, 4, 17),
    editable      : true,
    appendTo      : targetElement
});
