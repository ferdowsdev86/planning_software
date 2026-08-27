const grid = new Grid({
    appendTo : targetElement,

    height : 513,

    features : {
        cellEdit     : true,
        filter       : true,
        //group        : 'city',
        quickFind    : true,
        regionResize : true,
        stripe       : true
    },

    columns : [
        { text : 'Name', field : 'name', width : 180, locked : true },
        { text : 'City', field : 'city', width : 130, locked : true },
        { text : 'Start', type : 'date', format : 'YYYY-MM-DD', field : 'start', width : 100 },
        {
            type   : 'number',
            text   : 'Score',
            field  : 'score',
            width  : 80,
            sum    : 'sum',
            align  : 'right',
            editor : { type : 'number', min : 0, max : 100000 }
        },
        {
            type   : 'percent',
            text   : 'Percent done',
            field  : 'percent',
            editor : { type : 'number', min : 0, max : 100 },
            flex   : 1
        },
        {
            type    : 'action',
            text    : 'Details',
            align   : 'center',
            width   : 80,
            actions : [{
                cls     : 'fa fa-cog',
                onClick : 'up.editNotes',
                tooltip : 'Edit notes'
            }]
        }
    ],

    // Handler function for the ActionColumn
    editNotes({ record, target }) {
        // Only ever create one Popup
        const editPopup = this.editPopup || (this.editPopup = new Popup({
            owner  : this,
            height : '30em',
            width  : '20em',

            // When the target moves because of scrolling, we follow it
            scrollAction : 'realign',

            // Single child item is sized to fit.
            layout : 'fit',

            items : {
                notes : {
                    type  : 'textareafield',
                    style : 'padding : 0 0.79em'
                }
            },
            bbar : {
                items : {
                    cancel : {
                        text : 'Cancel',
                        onClick() {
                            editPopup.hide();
                        }
                    },
                    apply : {
                        text : 'Apply',
                        onClick() {
                            record.notes = editPopup.widgetMap.notes.value;
                            editPopup.hide();
                        }
                    }
                }
            }
        }));

        // Set the data and show the Popup by the target
        editPopup.widgetMap.notes.value = record.notes;
        editPopup.title = `Edit ${record.name} details`;
        editPopup.showBy({
            anchor : true,
            target,
            // Our right to target's left
            align  : 'r-l'
        });
    },

    data : DataGenerator.generateData(50)
});
