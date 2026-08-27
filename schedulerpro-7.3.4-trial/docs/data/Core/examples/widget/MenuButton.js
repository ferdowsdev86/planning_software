new Button({
    appendTo  : targetElement,
    rendition : 'filled',
    text      : 'Button with menu',
    menu      : {
        anchor : true,
        items  : [
            {
                icon : 'b-fw-icon b-icon-add',
                text : 'Add'
            },
            {
                icon : 'b-fw-icon b-icon-trash',
                text : 'Remove'
            },
            {
                icon     : 'b-fw-icon b-icon-locked',
                disabled : true,
                text     : 'I am disabled'
            },
            {
                text : 'Sub menu',
                menu : [{
                    icon : 'b-fw-icon fa fa-play',
                    text : 'Play'
                }]
            }
        ],
        // Method is called for all ancestor levels
        onItem({ item }) {
            Toast.show('You clicked ' + item.text);
        }
    }
});
