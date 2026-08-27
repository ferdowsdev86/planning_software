const container = new Container({
    appendTo : targetElement,
    columns  : 2
});

for (const rendition of ['text', 'outlined', 'tonal', 'filled', 'elevated', 'padded', 'padded-filled']) {
    container.add([
        {
            type   : 'label',
            text   : StringHelper.capitalize(rendition),
            column : 1
        },
        {
            type        : 'buttongroup',
            toggleGroup : true,
            column      : 2,
            rendition,
            items       : [
                {
                    text    : 'Day',
                    pressed : true
                },
                { text : 'Week' },
                { text : 'Month' }
            ]
        }
    ]);
}
