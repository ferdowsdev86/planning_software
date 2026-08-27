const data = DataGenerator.generateData(50);
data[0].fixed = true;

const grid = new Grid({
    appendTo : targetElement,

    height : '30em',

    features : {
        group    : false,
        lockRows : true
    },

    data,

    columns : [
        { field : 'firstName', text : 'First name', width : 150 },
        { field : 'fixed', text : 'Fixed', type : 'check' },
        { field : 'surName', text : 'Surname',  width : 150 },
        { field : 'city', text : 'City',  width : 150 },
        { type : 'date', field : 'start', text : 'Start',  width : 150 },
        { type : 'date', field : 'finish', text : 'Finish', width : 150 },
        { type : 'number', field : 'score', text : 'Score',  width : 150 },
        { type : 'number', field : 'age',  text : 'Age', width : 150 },
        { type : 'rating', field : 'rank',  text : 'Rank', width : 150 }
    ]
});
