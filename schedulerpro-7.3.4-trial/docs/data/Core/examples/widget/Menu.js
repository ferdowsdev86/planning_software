const widget = new Widget({
    appendTo : targetElement,
    style    : {
        background        : '#777',
        color             : '#fff',
        display           : 'flex',
        'align-items'     : 'center',
        'justify-content' : 'center',
        padding           : '1em 2em'
    },
    html : 'Right-click to show menu'
});

widget.element.addEventListener('contextmenu', event => {
    event.preventDefault();

    if (!widget.menu) {
        widget.menu = new Menu({
            anchor : true,

            owner : widget, // Ensure menu is destroyed when the owning widget is destroyed
            items : [
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
                }
            ],
            // Method is called for all ancestor levels
            onItem({ item }) {
                Toast.show('You clicked ' + item.text);
            }
        });
    }

    widget.menu.showBy(widget);
});
