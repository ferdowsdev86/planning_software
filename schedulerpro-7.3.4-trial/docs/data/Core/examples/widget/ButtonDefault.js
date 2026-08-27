targetElement.style.gridTemplateColumns = 'auto auto auto auto';
const
    onClick = () => Toast.show('Button clicked'),
    renditions = ['text', 'outlined', 'tonal', 'filled', 'elevated'];

for (const rendition of renditions) {
    new Button({
        appendTo : targetElement,
        text     : StringHelper.capitalize(rendition),
        width    : '9em',
        rendition,
        onClick
    });

    new Button({
        appendTo : targetElement,
        icon     : 'fa fa-flask',
        text     : StringHelper.capitalize(rendition),
        width    : '9em',
        rendition,
        onClick
    });

    new Button({
        appendTo : targetElement,
        icon     : 'fa fa-cog',
        rendition,
        onClick
    });

    new Button({
        appendTo : targetElement,
        icon     : 'fa fa-times',
        disabled : true,
        rendition,
        onClick
    });
}
