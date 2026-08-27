// Simple ProgressBar examples showing basic usage

// Add a button to toggle progress values
new Button({
    insertFirst : targetElement,
    text        : 'Update Progress',
    icon        : 'fa fa-sync',
    rendition   : 'tonal',
    color       : 'b-blue',
    style       : 'margin-top: 1em;',
    onClick() {
        const progressBars = bryntum.queryAll('progressbar');
        progressBars[0].value = Math.random();
        progressBars[1].value = Math.floor(Math.random() * 12) + 1;
        progressBars[2].value = Math.random();
    }
});

new ProgressBar({
    appendTo : targetElement,
    label    : 'Upload Progress',
    value    : 0.65,
    color    : 'blue'
});

new ProgressBar({
    appendTo      : targetElement,
    label         : 'Tasks Completed',
    value         : 8,
    max           : 12,
    valueRenderer : (value, max) => `${value} of ${max} tasks`,
    color         : 'green'
});

new ProgressBar({
    appendTo  : targetElement,
    label     : 'Database Migration',
    valueText : 'Nearly there',
    value     : 3 / 8,
    color     : 'orange'
});
