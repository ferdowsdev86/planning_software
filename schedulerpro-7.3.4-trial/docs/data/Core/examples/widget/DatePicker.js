const picker = new DatePicker({
    appendTo          : targetElement,
    width             : '24em',
    date              : DateHelper.add(new Date(), '1d'),
    onSelectionChange : ({ selection }) => {
        Toast.show(`You picked ${DateHelper.format(selection[0], 'MMM DD')}`);
    }
});
