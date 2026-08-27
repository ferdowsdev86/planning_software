new TabPanel({
    appendTo : targetElement,
    height   : '25em',
    tabBar   : {
        dock           : 'left',
        horizontalTabs : true
    },
    defaults : { style : 'padding: 1em 2em' },
    items    : {
        profile : {
            title         : 'User profile',
            tab           : { icon : 'fa fa-user' },
            labelPosition : 'align-before',
            items         : {
                forename : { type : 'textfield', label : 'First name', value : 'Dave' },
                surname  : { type : 'textfield', label : 'Last name', value : 'Taylor' },
                email    : { type : 'textfield', label : 'Email', value : 'pam.d@bryntum.com' }
            }
        },
        settings : {
            title         : 'Settings',
            tab           : { icon : 'fa fa-gear' },
            labelPosition : 'align-before',
            items         : {
                theme    : { type : 'combo', label : 'Theme', items : ['Stockholm', 'Svalbard', 'Material'], value : 'Stockholm' },
                darkMode : { type : 'slidetoggle', label : 'Dark mode' },
                alerts   : { type : 'slidetoggle', label : 'Alerts', checked : true },
                fontSize : { type : 'slider', label : 'Font size', min : 10, max : 24, value : 14, text : '14px' }
            }
        },
        about : {
            title : 'About',
            tab   : { icon : 'fa fa-circle-info' },
            html  : '<h3 style="margin-top:0">Bryntum TabPanel</h3><p>Horizontal tabs keep text readable on side-docked tab bars.</p><p>Use the <code>horizontalTabs</code> config on the TabBar to enable this mode.</p>'
        }
    }
});
