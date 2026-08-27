const button = new Button({
    appendTo : targetElement,
    text     : 'Show drawer',
    ref      : 'showButton',
    onClick() {
        const panel = this.panel || (this.panel = new Panel({
            drawer : {
                side      : 'end',
                autoClose : {
                    // Close on click outside, but *not* when clicking
                    // on our show button
                    mousedown : ':not(button[data-ref="showButton"])'
                }
            },
            title         : 'Settings',
            rootElement   : document.body,
            width         : 400,
            labelPosition : 'align-before',
            items         : {
                name    : { type : 'text', label : 'Name' },
                email   : { type : 'text', label : 'Email' },
                phone   : { type : 'text', label : 'Phone' },
                address : { type : 'text', label : 'Address' }
            },
            bbar : {
                items : {
                    close : {
                        text    : 'Close',
                        icon    : 'fa fa-times',
                        style   : 'margin-inline-start: auto',
                        onClick : () => {
                            panel.hide();
                        }
                    }
                }
            }
        }));

        panel.show();
    }
});
