var {
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;
new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    startDate      : new Date(2023, 8, 19),
    endDate        : new Date(2023, 8, 26),
    barMargin      : 5,
    eventStyle     : 'filled',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    features : {
        tree      : true,
        treeGroup : {
            hideGroupedColumns : true,
            levels             : ['team']
        }
    },
    columns : [{
        type       : 'tree',
        text       : 'Name',
        field      : 'name',
        width      : 220,
        htmlEncode : false,
        renderer({
            record,
            value
        }) {
            if (record.children) {
                return record.key;
            }
            else {
                return StringHelper.xss`${value}<div class="teams">${record.team.join(', ')}</div>`;
            }
        }
    }, {
        field : 'team'
    }],
    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            // Additional resource fields
            fields  : ['team'],
            // Sort by name initially
            sorters : [{
                field     : 'name',
                ascending : true
            }]
        }
    }
});