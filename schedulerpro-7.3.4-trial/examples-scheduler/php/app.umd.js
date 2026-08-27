var {
    Scheduler,
    Toast
} = window.bryntum.schedulerpro;

// Set random PHP session ID if it doesn't exist
const cookie = 'PHPSESSID=scheduler-php';
if (!document.cookie.includes(cookie)) {
    document.cookie = `${cookie}-${Math.random().toString(16).substring(2)}`;
}
const processException = event => {
    var _response$parsedJson;
    const {
            action,
            response
        } = event,
        serverMessage = response === null || response === undefined || (_response$parsedJson = response.parsedJson) === null || _response$parsedJson === undefined ? undefined : _response$parsedJson.msg,
        exceptionText = `Command "${action}" failed.${serverMessage ? ` Server response: ${serverMessage}` : ''}`;
    Toast.show({
        html    : exceptionText,
        cls     : 'php-demo-error-message',
        timeout : 5000
    });
    if (!serverMessage) {
        console.error(`App Exception: ${exceptionText}`, event);
    }
};
const scheduler = new Scheduler({
    appendTo               : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom             : true,
    startDate              : new Date(2018, 4, 21, 6),
    endDate                : new Date(2018, 4, 21, 18),
    viewPreset             : 'hourAndDay',
    rowHeight              : 50,
    barMargin              : 5,
    eventColor             : 'blue',
    passStartEndParameters : true,
    features               : {
    // Configure event editor to display 'brand' as resource name
        eventEdit : {
            items : {
                resourceField : {
                    displayField : 'car'
                }
            }
        }
    },
    columns : [{
        text   : 'Id',
        field  : 'id',
        width  : 100,
        editor : false,
        hidden : true
    }, {
        text  : 'Car',
        field : 'car',
        width : 150
    }, {
        text   : 'Modified',
        field  : 'dt',
        type   : 'date',
        width  : 90,
        format : 'HH:mm:ss',
        editor : false,
        hidden : true
    }],
    resourceStore : {
    // Add some custom fields
        fields : ['car', {
            name : 'dt',
            type : 'date'
        }],
        // Setup urls
        createUrl      : 'php/resource/create.php',
        readUrl        : 'php/resource/read.php',
        updateUrl      : 'php/resource/update.php',
        deleteUrl      : 'php/resource/delete.php',
        // Load and save automatically
        autoLoad       : true,
        autoCommit     : true,
        // Send as form data and not a JSON payload
        sendAsFormData : true,
        // Make it read only to prevent changes while committing
        listeners      : {
            beforeCommit : () => {
                scheduler.readOnly = true;
            },
            commit : () => {
                scheduler.readOnly = false;
            },
            exception : event => {
                processException(event);
                scheduler.readOnly = false;
            }
        }
    },
    eventStore : {
    // Add a custom field and redefine durationUnit to default to hours
        fields : [{
            name : 'dt',
            type : 'date'
        }, {
            name         : 'durationUnit',
            defaultValue : 'hour'
        }],
        // Setup urls
        createUrl      : 'php/event/create.php',
        readUrl        : 'php/event/read.php',
        updateUrl      : 'php/event/update.php',
        deleteUrl      : 'php/event/delete.php',
        // Load and save automatically
        autoLoad       : true,
        autoCommit     : true,
        // Send as form data and not a JSON payload
        sendAsFormData : true,
        // Make it read only to prevent changes while committing
        listeners      : {
            beforeCommit : () => {
                scheduler.readOnly = true;
            },
            commit : () => {
                scheduler.readOnly = false;
            },
            exception : event => {
                processException(event);
                scheduler.readOnly = false;
            }
        }
    },
    tbar : [{
        type : 'button',
        ref  : 'reloadButton',
        icon : 'fa fa-sync',
        text : 'Reload scheduler',
        async onAction() {
            await Promise.all([scheduler.resourceStore.load(), scheduler.eventStore.load()]);
            Toast.show('Data reloaded');
        }
    }, {
        type  : 'button',
        ref   : 'resetButton',
        color : 'b-red',
        icon  : 'fa fa-recycle',
        text  : 'Reset database',
        async onAction() {
            await Promise.all([scheduler.resourceStore.load({
                reset : true
            }), scheduler.eventStore.load({
                reset : true
            })]);
            Toast.show('Database was reset');
        }
    }]
});