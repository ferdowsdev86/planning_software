new TabPanel({
    appendTo : targetElement,
    height   : '25em',
    tabBar   : {
        enableReordering : true
    },
    items : {
        main : {
            title : 'Tab with widgets',
            tab   : {
                icon : 'fa fa-puzzle-piece'
            },
            style : 'padding : 1em',
            items : {
                forename : { type : 'text', label : 'First name' },
                surname  : { type : 'text', label : 'Last name' }
            }

        },
        secondary : {
            title : 'Tab with basic HTML',
            tab   : {
                icon : 'fa fa-code'
            },
            items : {
                infoWidget : {
                    type  : 'widget',
                    style : 'padding: 1em',
                    html  : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                }
            }
        },
        tertiary : {
            title : 'Images',
            style : 'gap: 3em; padding: 4em; display: grid; grid-template-columns: repeat(3, 1fr)',
            tab   : {
                icon : 'fa fa-image'
            },
            defaults : {
                flex  : 1,
                type  : 'widget',
                tag   : 'img',
                style : 'width: 186px; height: 140px'
            },
            items : {
                gantt : {
                    elementAttributes : {
                        src : 'data/Core/images/thumb/gantt.png'
                    }
                },
                calendar : {
                    elementAttributes : {
                        src : 'data/Core/images/thumb/calendar.png'
                    }
                },
                taskboard : {
                    elementAttributes : {
                        src : 'data/Core/images/thumb/taskboard.png'
                    }
                }
            }
        }
    }
});
