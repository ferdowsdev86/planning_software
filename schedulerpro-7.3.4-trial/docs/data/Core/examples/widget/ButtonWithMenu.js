const renditions = ['text', 'outlined', 'tonal', 'filled', 'elevated'];

for (const rendition of renditions) {
    new Button({
        appendTo : targetElement,
        icon     : 'fa fa-chart-line',
        rendition,
        menu     : [
            { icon : 'fa fa-chart-pie', text : 'Item 1', onItem : () => console.log('Item 1 activated') },
            { icon : 'fa fa-chart-bar', text : 'Item 2', onItem : () => console.log('Item 2 activated') }
        ]
    });

    new Button({
        rendition,
        text     : 'Settings button',
        icon     : 'fa fa-cog',
        appendTo : targetElement,
        menu     : {

            // Other menu configs can be passed here

            items : [
                { icon : 'fa fa-hammer', text : 'Item 1', onItem : () => console.log('Item 1 activated') },
                { icon : 'fa fa-wrench', text : 'Item 2', onItem : () => console.log('Item 2 activated') }
            ]
        }
    });

    new Button({
        rendition,
        text     : 'Settings button',
        icon     : 'fa fa-cog',
        appendTo : targetElement,
        split    : 'hover',
        menu     : {

            // Other menu configs can be passed here

            items : [
                { icon : 'fa fa-hammer', text : 'Item 1', onItem : () => console.log('Item 1 activated') },
                { icon : 'fa fa-wrench', text : 'Item 2', onItem : () => console.log('Item 2 activated') }
            ]
        }
    });
}
