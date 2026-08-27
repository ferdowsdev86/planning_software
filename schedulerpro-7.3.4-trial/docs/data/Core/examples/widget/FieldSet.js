new FieldSet({
    appendTo      : targetElement,
    title         : 'The FieldSet widget',
    width         : '27em',
    labelPosition : 'align-before',
    items         : {
        username : {
            type  : 'text',
            label : 'Username'
        },
        password : {
            type  : 'password',
            label : 'Enter password'
        },
        repeat : {
            type  : 'password',
            label : 'Repeat password'
        },
        register : {
            type  : 'button',
            text  : 'Register',
            style : 'margin:2em 0 0 0',
            onClick() {
                Toast.show('You clicked the button');
            }
        }
    }
});
