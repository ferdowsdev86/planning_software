const dockSides = ['top', 'right', 'bottom', 'left'];

new SlideToggle({
    insertFirst : targetElement,
    label       : 'Closable tabs',
    checked     : true,
    onChange({ value }) {
        tabPanel.tabBar.items.forEach(tab => tab.closable = value);
    }
});

new Button({
    insertFirst : targetElement,
    text        : 'Move TabBar',
    icon        : 'fa fa-arrow-right',
    onClick() {
        const currentIndex = dockSides.indexOf(tabPanel.tabBar.dock || 'top');
        tabPanel.tabBar.dock = dockSides[(currentIndex + 1) % dockSides.length];
    }
});

const tabPanel = new TabPanel({
    appendTo : targetElement,
    height   : '25em',
    tabBar   : {
        defaults : {
            closable : true
        }
    },
    defaults : {
        style : 'padding : 1em'
    },
    items : {
        main : {
            type  : 'panel',
            title : 'Tab with widgets',
            tab   : {
                icon : 'fa fa-puzzle-piece'
            },
            items : {
                forename : { type : 'text', label : 'First name', required : true },
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
        },
        overflow : {
            title : 'Additional Configuration Settings & Preferences',
            tab   : {
                icon : 'fa fa-cogs'
            },
            items : {
                infoWidget : {
                    type  : 'widget',
                    style : 'padding: 1em',
                    html  : 'This tab has a long title to demonstrate tab overflow behavior when the tab bar runs out of space.'
                }
            }
        }
    }
});
