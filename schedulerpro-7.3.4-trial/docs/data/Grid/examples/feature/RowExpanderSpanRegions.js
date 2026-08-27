const grid = new Grid({
    appendTo : targetElement,
    height   : 400,
    features : {
        // Enable the feature
        rowExpander : {
            spanRegions : true,
            widget      : {
                type       : 'grid',
                dataField  : 'skills',
                autoHeight : true,
                columns    : [
                    { field : 'id', text : 'No.', type : 'number', width : 80 },
                    { field : 'skill', text : 'Skill', flex : 1 },
                    { field : 'level', text : 'Level', type : 'number', width : 100 },
                    { field : 'verified', text : 'Verified', type : 'check', width : 100 }
                ]
            }
        }
    },

    subGridConfigs : {
        locked : {
            width : 190
        },
        normal : {
            flex : 1
        }
    },

    columns : [
        { field : 'name', text : 'Name', width : 150, region : 'locked' },
        { field : 'id', text : 'Employee no.', type : 'number', width : 110, region : 'normal', align : 'center' },
        { field : 'city', text : 'City', width : 110, region : 'normal' },
        { field : 'age', text : 'Age', type : 'number', width : 90, region : 'normal', align : 'center' },
        { field : 'start', text : 'Start', type : 'date', width : 110, region : 'normal' },
        {
            field      : 'name',
            text       : 'Email',
            width      : 220,
            region     : 'normal',
            htmlEncode : false,
            renderer   : ({ value }) =>  {
                const email = value.toLowerCase().replaceAll(' ', '.') + '@example.com';
                return StringHelper.xss`<i class="fa fa-envelope"></i><a href="mailto:${email}">${email}</a>`;
            }
        },
        { field : 'active', text : 'Active', type : 'check', width : 90, region : 'normal' }
    ],

    data : DataGenerator.generateData({
        count     : 10,
        addSkills : true,
        rowCallback(row) {
            row.skills = row.skills.map((skill, index) => ({ id : index + 1, skill, level : Math.round(Math.random() * 2) + 1, verified : Math.random() > 0.5 }));
        }
    })
});
