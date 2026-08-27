const picker = new DatePicker({
    appendTo : targetElement,
    width    : '24em',
    date     : new Date(2025, 5, 1),
    tbar     : {
        // Remove all navigation buttons
        items : {
            // Hide previous/next year buttons
            prevYear : null,
            nextYear : null

            // Uncommend to hide previous/next month buttons
            // prevMonth : null,
            // nextMonth : null
        }
    },
    bbar : {
        items : {
            todayButton : {
                text      : 'Today',
                style     : 'margin-inline:auto',
                onClick   : 'up.onTodayClick',
                rendition : 'filled'
            }
        }
    },
    onTodayClick() {
        this.date = new Date();
    }
});
