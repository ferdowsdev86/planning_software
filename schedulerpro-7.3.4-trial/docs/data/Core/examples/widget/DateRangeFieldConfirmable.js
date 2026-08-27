const firstDateOfMonth = DateHelper.getFirstDateOfMonth(new Date());

new DateRangeField({
    appendTo    : targetElement,
    autoExpand  : true,
    // Adds a bottom toolbar with OK and Cancel buttons
    confirmable : true,
    rendition   : 'outlined',
    value       : [DateHelper.add(firstDateOfMonth, 7, 'd'), DateHelper.add(firstDateOfMonth, 17, 'd')]
});

new DateRangeField({
    appendTo    : targetElement,
    autoExpand  : true,
    // Adds a bottom toolbar with OK and Cancel buttons
    confirmable : true,
    rendition   : 'filled',
    value       : [DateHelper.add(firstDateOfMonth, 7, 'd'), DateHelper.add(firstDateOfMonth, 17, 'd')]

});
