// button that display a popup containing html
new Button({
    appendTo : targetElement,
    text     : 'Html popup',
    onClick({ source }) {
        const popup = new Popup({
            owner       : source,
            header      : 'A simple text Popup',
            autoShow    : false,
            centered    : true,
            draggable   : true,
            closeAction : 'destroy',
            closable    : true,
            modal       : true,
            width       : '30em',
            rootElement : targetElement, // Only for docs, not needed in real code
            bbar        : {
                items : {
                    close : {
                        text     : 'Close',
                        minWidth : 100,
                        onAction : 'up.close'
                    }
                }
            },
            html : `<h3 style="margin-top:0.5em">Bacon ipsum dolor </h3>
                    <p style="line-height:1.5em">amet flank ribeye ham hock, 
                     rump alcatra pork belly pancetta leberkas bacon shoulder 
                    meatloaf ball tip pig. Tongue jerky meatloaf pancetta 
                    pork sirloin. Hamburger corned beef ball tip cupim 
                    sirloin frankfurter tri-tip. </p>`
        });
        popup.show();
    }
});

// button that display a modal popup
new Button({
    appendTo  : targetElement,
    rendition : 'filled',
    text      : 'Modal popup',
    style     : 'margin-right: .5em',
    onClick({ source }) {
        const popup = new Popup({
            owner       : source,
            header      : 'A simple modal Popup',
            autoShow    : false,
            closeAction : 'destroy',
            modal       : true,
            closable    : true,
            maximizable : true,
            width       : '30em',
            bbar        : {
                items : {
                    close : {
                        text     : 'Close',
                        onAction : 'up.close'
                    }
                }
            },
            html : `<h3 style="margin-top:0.5em">Bacon ipsum dolor </h3>
                    <p style="line-height:1.5em">amet flank ribeye ham hock, 
                     rump alcatra pork belly pancetta leberkas bacon shoulder 
                    meatloaf ball tip pig. Tongue jerky meatloaf pancetta 
                    pork sirloin. Hamburger corned beef ball tip cupim 
                    sirloin frankfurter tri-tip.</p>`
        });
        popup.show();
    }
});

// button that displays a popup containing widgets
new Button({
    appendTo : targetElement,
    text     : 'Widget popup',
    ripple   : false,
    onClick({ source }) {
        const popup = new Popup({
            owner         : source,
            header        : 'Anchored containing Widgets',
            autoShow      : false,
            closable      : true,
            closeAction   : 'destroy',
            width         : '27em',
            minHeight     : '18em',
            resizable     : true,
            rootElement   : targetElement, // Only for docs, not needed in real code
            labelPosition : 'align-before',
            align         : {
                align  : 't-b',
                anchor : true
            },
            bbar : {
                items : {
                    cancel : {
                        text     : 'Cancel',
                        minWidth : 100,
                        onAction : 'up.close'
                    },
                    close : {
                        text      : 'OK',
                        minWidth  : 100,
                        rendition : 'filled',
                        onAction  : () => {
                            Toast.show('Hello ' + popup.widgetMap.nameField.value);
                            popup.close();
                        }
                    }
                }
            },
            items : {
                // a text field
                nameField : {
                    type  : 'text',
                    label : 'Name',
                    value : 'John Doe'
                },
                numberField : {
                    type  : 'number',
                    label : 'Age',
                    value : 25
                }
            }
        });
        popup.showBy(source.element);
    }
});
