//<code-header>
CSSHelper.insertRule([
    '.date-range-field-demo .b-date-picker-cell-inner { padding:0.5em 0.75em 1em 0.75em; }',
    '.date-range-field-demo .b-date-picker-cell-payload { margin-bottom:4px; }',
    '.b-calendar-panel-cell:not(.b-active-date) .b-date-picker-cell-payload { opacity:0.65; }',
    '.b-date-picker-cell-payload { font-size: 0.6em; white-space: nowrap; }',
    '.therm { padding-inline-end : .5em;; }'
], targetElement.getRootNode());
//</code-header>

const picker = new DateRangeField({
    appendTo   : targetElement,
    autoExpand : true,
    value      : ['today', 'today'],

    picker : {
        align : {
            align : 't-b50'
        },
        cls                : 'date-range-field-demo',
        datePickerDefaults : {
            shadePastDates : true
        },
        cellRenderer : ({ innerCell, cellPayload, date }) => {
            const
                CF      = /US|LR|MM/i.test(new Intl.Locale(navigator.languages[0]).region) ? 'F' : 'C', // US/Liberia/Myanmar
                convert = (CF === 'F') ? t => t : t => Math.floor((t - 32) * 5 / 9),
                therm   = v => Math.min(4, Math.max(0, Math.floor((v - 30) / 15))),
                hiF     = date % 31 + 47,  // pseudo-random temperature
                loF     = hiF - date % 29 - 11,
                hi      = `${convert(hiF)} °${CF}`,
                lo      = `${convert(loF)} °${CF}`;

            cellPayload.innerHTML = hi;

            innerCell.dataset.btip =
                `<div><span class="therm fa fa-thermometer-${therm(hiF)}"></span>High: ${hi}</div>` +
                `<div><span class="therm fa fa-thermometer-${therm(loF)}"></span>Low: ${lo}</div>`;
        }
    },

    listeners : {
        change : ({ value }) => {
            Toast.show(`You picked ${DateHelper.format(value[0], 'MMM DD')} to ${DateHelper.format(value[1], 'MMM DD')}`);
        }
    }
});
