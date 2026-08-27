new FilePicker({
    appendTo        : targetElement,
    fileFieldConfig : {
        multiple : true,
        accept   : 'image/*'
    },
    buttonConfig : {
        text      : 'Pick multiple images',
        rendition : 'filled'
    }
});

new FilePicker({
    appendTo     : targetElement,
    buttonConfig : {
        text      : 'Pick single file of any type',
        rendition : 'filled'
    },
    style : 'margin-inline-start: 2em;'
});
