new ProgressBar({
    appendTo  : targetElement,
    label     : 'Backend API Dev.',
    valueText : 'All done',
    value     : 1
});

new ProgressBar({
    appendTo : targetElement,
    label    : 'Frontend',
    valueRenderer(value, max) {
        return `${value}/${max} tasks`;
    },
    max   : 12,
    value : 4,
    color : 'blue'
});

new ProgressBar({
    appendTo  : targetElement,
    label     : 'Database',
    valueText : '3/8 tasks',
    value     : 3 / 8,
    color     : 'orange'
});

new ProgressBar({
    appendTo  : targetElement,
    label     : 'Documentation',
    valueText : '1/5 tasks',
    value     : .2,
    color     : 'red'
});

new ProgressBar({
    appendTo  : targetElement,
    label     : 'Code Review',
    valueText : '10/15 tasks',
    value     : .67,
    color     : 'purple'
});
