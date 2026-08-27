targetElement.style.flexDirection = 'column';
targetElement.style.alignItems = 'flex-start';
targetElement.style.alignContent = 'flex-start';

function runHints() {
    new HintFlow({
        defaults : {
            highlightTarget : true
        },
        hints : [
            {
                target  : 'button[data-ref="learnButton"]',
                title   : 'Run hints',
                content : 'Click here to restart hint flow',
                align   : 's-e'
            },
            {
                target  : '.hint-panel .b-tool',
                title   : 'Settings',
                content : 'Click here to open Panel settings',
                align   : 's-e'
            },
            {
                target          : '.hint-panel [data-ref="email"] .b-field-inner',
                title           : 'Email',
                content         : 'Enter your email here',
                align           : 't-b',
                highlightTarget : {
                    // Expand the target zone a little
                    inflate : 5
                }
            },
            {
                target  : '.hint-panel [data-ref="send"]',
                title   : 'Send mail',
                content : 'Send the mail',
                align   : {
                    align  : 'b-t',
                    offset : [0, -5]
                },
                highlightTarget : {
                    center : '#9c37eb',
                    ping   : true
                }
            }
        ]
    });
}

new Button({
    ref      : 'learnButton',
    appendTo : targetElement,
    cls      : 'learnButton',
    text     : 'Start lesson',
    onClick  : runHints
});

new Panel({
    cls      : 'hint-panel',
    title    : 'My Panel',
    width    : 600,
    height   : '20em',
    appendTo : targetElement,
    tools    : {
        settings : {
            cls     : 'b-icon-cog',
            tooltip : 'Panel settings'
        }
    },
    items : {
        email : {
            inputType : 'email',
            type      : 'textfield',
            label     : 'Email Address'
        }
    },
    bbar : {
        items : {
            send : {
                text : 'Send Message'
            }
        }
    }
});
