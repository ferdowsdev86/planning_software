var {
    Scheduler,
    StringHelper
} = window.bryntum.schedulerpro;

// Each team gets their own background color
const colors = {
    DevOps : 'pink',
    Devs   : 'purple',
    Sales  : 'indigo'
};
const scheduler = new Scheduler({
    appendTo          : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    startDate         : new Date(2021, 8, 19),
    endDate           : new Date(2021, 8, 26),
    barMargin         : 5,
    eventStyle        : 'traced',
    resourceImagePath : '../_shared/images/transparent-users/',
    features          : {
    // Enable merging cells
        mergeCells : true
    },
    columns : [{
        text       : 'Team',
        field      : 'team',
        width      : 50,
        minWidth   : 50,
        resizable  : false,
        draggable  : false,
        // Merge cells in this column when it is sorted
        mergeCells : true,
        // Apply some CSS to hide the header text, looks ugly in the narrow header
        cls        : 'hide-header-text',
        // Custom renderer for the merged cells, allows you to affected the generated merged cell (the contents are
        // determined using the normal renderer/record value)
        mergedRenderer({
            domConfig,
            value
        }) {
            // Add a background based on team to the merged range
            Object.assign(domConfig.className, {
                'b-color-pink'   : value === 'DevOps',
                'b-color-purple' : value === 'Devs',
                'b-color-indigo' : value === 'Sales',
                'b-color-violet' : value !== 'DevOps' && value !== 'Devs' && value !== 'Sales'
            });
        }
    }, {
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 140,
        renderer(args) {
            const {
                cellElement,
                record
            } = args;
            cellElement.classList.add(`b-color-${colors[record.team] ?? 'violet'}`);
            return this.defaultRenderer(args);
        }
    }, {
        text  : 'Role',
        field : 'role',
        width : 110
    }],
    // Custom event renderer, to manipulate event styling
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
    // When there is no color explicitly defined, use the teams color
        if (!eventRecord.eventColor) {
            renderData.eventColor = colors[resourceRecord.team] ?? 'pink';
        }
        return StringHelper.encodeHtml(eventRecord.name);
    },
    crudManager : {
        autoLoad      : true,
        loadUrl       : 'data/data.json',
        resourceStore : {
            // Additional resource fields
            fields  : ['team', 'role'],
            // Sort by team and name initially
            sorters : [{
                field     : 'team',
                ascending : true
            }, {
                field     : 'name',
                ascending : true
            }]
        }
    },
    tbar : [
        // Button to toggle between merging teams and not doing so
        {
            type    : 'slidetoggle',
            text    : 'Merge teams',
            checked : true,
            onChange({
                checked
            }) {
                const {
                        columns
                    } = scheduler,
                    teamColumn = columns.get('team');

                // When merging teams, move column first and make it narrow (as it starts)
                if (checked) {
                    columns.move(teamColumn, columns.first);
                    teamColumn.width = 40;
                    teamColumn.cls = 'hide-header-text';
                    scheduler.resourceStore.sort('team', true);
                }
                // When not merging, move it last in the locked region and make it wider
                else {
                    columns.move(teamColumn, scheduler.timeAxisColumn);
                    teamColumn.width = 100;
                    teamColumn.cls = null;
                }

                // Toggle merging cells
                scheduler.features.mergeCells.disabled = !checked;
            }
        }]
});