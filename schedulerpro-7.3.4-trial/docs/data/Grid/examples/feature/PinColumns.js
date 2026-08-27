const grid = new Grid({
    appendTo : targetElement,

    height : 300,

    features : {
        pinColumns : true
    },

    // Small dataset: student grades across five subjects and their average
    data : [
        { id : 1, student : 'Alice Johnson', math : 88, science : 92, history : 81, english : 90, geography : 85, average : 87.20 },
        { id : 2, student : 'Ben Carter', math : 74, science : 79, history : 85, english : 78, geography : 80, average : 79.20 },
        { id : 3, student : 'Chloe Nguyen', math : 93, science : 87, history : 90, english : 91, geography : 88, average : 89.80 },
        { id : 4, student : 'Diego Morales', math : 66, science : 72, history : 69, english : 70, geography : 64, average : 68.20 },
        { id : 5, student : 'Elena Petrova', math : 82, science : 84, history : 88, english : 86, geography : 82, average : 84.40 },
        { id : 6, student : 'Farah Khan', math : 95, science : 91, history : 94, english : 94, geography : 96, average : 94.00 },
        { id : 7, student : 'George Smith', math : 70, science : 68, history : 73, english : 72, geography : 71, average : 70.80 },
        { id : 8, student : 'Hiro Tanaka', math : 89, science : 85, history : 92, english : 88, geography : 90, average : 88.80 }
    ],

    // First column is pinned to start, last column pinned to end
    columns : [
        { field : 'student', text : 'Student', width : 180, pinned : 'start' },
        { type : 'number', field : 'math', text : 'Math', width : 120 },
        { type : 'number', field : 'science', text : 'Science', width : 120 },
        { type : 'number', field : 'history', text : 'History', width : 120 },
        { type : 'number', field : 'english', text : 'English', width : 120 },
        { type : 'number', field : 'geography', text : 'Geography', width : 120 },
        { text : 'Average', field : 'average', width : 140, type : 'number', pinned : 'end' }
    ]
});
