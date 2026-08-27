let accessGranted = false;

const grid = new Grid({
    appendTo   : targetElement,
    autoHeight : true,
    rowHeight  : 50,
    flex       : 1,

    columns : [
        { text : 'Name', field : 'name', width : 160 }
    ],

    data : [
        { id : 1, name : 'Mr Boss' }
    ],

    features : {
        cellMenu : {
            // Process cell items before showing the menu
            processItems({ items, column, record }) {
                // Not possible to delete rows if there are no rights for it
                if (!accessGranted) {
                    items.removeRow = false;
                }
            }
        },
        headerMenu : {
            // Process header items before showing the menu
            processItems({ items, column }) {
                // Not possible to change columns visibility if there are no rights for it
                if (!accessGranted) {
                    items.columnPicker = false;
                    items.hideColumn   = false;
                }
            }
        }
    },

    tbar : [
        {
            text        : 'Limited rights',
            toggleable  : true,
            pressed     : !accessGranted,
            icon        : 'fa fa-square',
            pressedIcon : 'fa fa-check-square',
            onToggle({ pressed }) {
                accessGranted = !pressed;
            }
        }
    ]
});
