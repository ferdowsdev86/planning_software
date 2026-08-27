new DateRangeField({
    appendTo   : targetElement,
    autoExpand : true,
    rendition  : 'outlined',
    picker     : {
        align              : 't-b50',
        datePickerDefaults : {
            shadePastDates : true
        }
    }
});

new DateRangeField({
    appendTo   : targetElement,
    autoExpand : true,
    rendition  : 'filled',
    picker     : {
        align              : 't-b50',
        datePickerDefaults : {
            shadePastDates : true
        }
    },
    fieldStartDate : {
        placeholder : 'Departure'
    },
    fieldEndDate : {
        placeholder : 'Return'
    }
});
