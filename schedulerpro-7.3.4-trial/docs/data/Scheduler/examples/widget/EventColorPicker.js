new Button({
    appendTo : targetElement,
    text     : 'Show menu',
    menu     : [
        {
            text      : 'Color',
            icon      : 'fa fa-palette',
            separator : true,
            menu      : {
                colorMenu : {
                    type : 'eventcolorpicker'
                }
            }
        }
    ]
});
