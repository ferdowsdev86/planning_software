new Button({
    appendTo : targetElement,
    text     : 'Hover me',
    tooltip  : 'A simple textual button tooltip'
});

new Button({
    appendTo : targetElement,
    text     : 'Async content',
    tooltip  : {
        listeners : {
            beforeShow : ({ source: tip }) => {
                tip.html = new Promise(resolve => {
                    setTimeout(() => resolve('Remotely fetched content!'), 2000);
                });
                // fetch('someurl').then(response => tip.html = 'Done!');
            }
        }
    }
});

new Button({
    appendTo : targetElement,
    text     : 'Tooltip with title and widgets',
    tooltip  : {
        title       : 'Tooltip containing a Grid ',
        maximizable : true,
        minWidth    : 500,
        layout      : 'fit',
        items       : {
            grid : {
                type    : 'grid',
                border  : true,
                columns : [
                    {
                        text  : 'Name',
                        field : 'name',
                        flex  : 1
                    },
                    {
                        text  : 'Age',
                        field : 'age',
                        flex  : 1,
                        type  : 'number'
                    },
                    {
                        type    : 'check',
                        text    : 'Active',
                        field   : 'active',
                        widgets : [{ type : 'slidetoggle' }]
                    }
                ],

                data : [
                    {
                        id     : 2,
                        name   : 'John B Adams',
                        age    : 65,
                        active : true
                    },
                    {
                        id     : 3,
                        name   : 'John Doe',
                        age    : 40,
                        active : false
                    },
                    {
                        id     : 5,
                        name   : 'Li Wei',
                        age    : 35,
                        active : true
                    }
                ]
            }
        },

        bbar : {
            items : {
                button : {
                    text : 'Custom button',
                    onClick() {
                        Toast.show('Hey there');
                    }
                }
            }
        }
    }
});
