//<code-header>
CSSHelper.insertRule('#datePickerCellRenderer .b-calendar-panel-cell .b-date-picker-cell-inner { padding:0.5em 1.2em 1.2em 1.2em;}', targetElement.getRootNode());
CSSHelper.insertRule('#datePickerCellRenderer .b-date-picker-cell-payload { bottom:0.75em;}', targetElement.getRootNode());
CSSHelper.insertRule('.price { font-size: 0.65em;}', targetElement.getRootNode());
CSSHelper.insertRule('.b-calendar-panel-cell:not(.b-active-date) .price { opacity:0.65; }', targetElement.getRootNode());
//</code-header>
const prices = [
        110, 80, 0, 70, 120, 80, 90,
        90, 110, 80, 0, 0, 120, 80, 90,
        90, 130, 60, 0, 70, 80, 90
    ],
    picker = new DatePicker({
        id       : 'datePickerCellRenderer',
        appendTo : targetElement,
        width    : '27em',
        date     : new Date(),

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
        },

        onSelectionChange : ({ selection }) => {
            Toast.show(`You picked ${DateHelper.format(selection[0], 'MMM DD')}`);
        }
    });
