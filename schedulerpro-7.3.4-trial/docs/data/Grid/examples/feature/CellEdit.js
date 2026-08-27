// grid with cell editing
const grid = new Grid({
    appendTo : targetElement,

    // makes grid as high as it needs to be to fit rows
    autoHeight : true,

    features : {
        // cellEditing is enabled by default, so this is not necessary
        cellEdit : true
    },

    data : DataGenerator.generateData(5),

    columns : [
        // basic columns has a TextField as editor by default
        {
            field            : 'name',
            text             : 'Name',
            flex             : 1,
            // Invoked on final edit of input field, typically after pressing enter or blurring the field.
            finalizeCellEdit : ({ value }) => {
                // returning true will accept the new value otherwise it shows the return statement as error message
                return value.trim().length < 5 ? 'Name should be at least 5 characters' : true;
            }
        },
        // a custom editor can be specified
        {
            field  : 'city',
            text   : 'City',
            flex   : 1,
            editor : {
                type  : 'combo',
                items : ['Stockholm', 'New York', 'Montreal']
            }
        },
        // column types may specify an editor
        // NumberColumn for example uses a NumberField
        {
            type             : 'number',
            field            : 'score',
            text             : 'Score',
            flex             : 1,
            finalizeCellEdit : ({ value, record }) => {

                // record contains sibling column's data
                const { city } = record;

                // Perform validation based on a sibling column
                if (city == 'Paris' && value > 999) {
                    return "Score can't be higher than 999 for Paris";
                }
                return true;
            }
        },
        // specify editor: false to make a column "readonly"
        { type : 'number', field : 'age', text : 'Age (readonly)', flex : 1, editor : false }
    ]
});
