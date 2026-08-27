const picker = new MonthPicker({
    appendTo  : targetElement,
    width     : '24em',
    listeners : {
        select : ({ value }) => {
            Toast.show(`You picked ${value}`);
        },
        titleClick : () => Toast.show('You clicked the title bar')
    }
});
