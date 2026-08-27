var {
    Scheduler,
    DataGenerator,
    AjaxHelper
} = window.bryntum.schedulerpro;

//region Data

// This demo uses a mocked JS backend. The console logs is there to serve as a network request log

const nbrResources = 1000,
    nbrEvents = 5,
    {
        resources,
        events
    } = DataGenerator.generateEvents({
        nbrResources,
        nbrEvents,
        viewStartDate : new Date('2024-04-01'),
        gap           : 5
    });
function loadResources(page, pageSize) {
    const startIndex = (page - 1) * pageSize;
    return {
        data  : resources.slice(startIndex, startIndex + pageSize),
        total : resources.length
    };
}
function loadEvents(page, pageSize, startDate, endDate) {
    const resourceIds = loadResources(page, pageSize).data.map(r => r.id);
    return events.filter(e => resourceIds.includes(e.resourceId) && (e.startDate >= startDate && e.startDate <= endDate || e.endDate >= startDate && e.endDate <= endDate));
}
AjaxHelper.mockUrl('resources', (url, {
    page,
    pageSize
}, options) => {
    const {
        data,
        total
    } = loadResources(parseInt(page), parseInt(pageSize));
    console.log('Loaded resources page ' + page);
    return {
        responseText : JSON.stringify({
            success : true,
            total,
            data
        })
    };
});
AjaxHelper.mockUrl('events', (url, {
    page,
    pageSize,
    startDate,
    endDate
}, options) => {
    console.log(`Loaded events for page ${page} from ${startDate} to ${endDate}`);
    return {
        responseText : JSON.stringify({
            success : true,
            data    : loadEvents(parseInt(page), parseInt(pageSize), new Date(startDate), new Date(endDate))
        })
    };
});

//endregion

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    viewPreset : 'dayAndMonth',
    features   : {
        filter      : false,
        sort        : false,
        group       : false,
        eventFilter : false
    },
    eventStore : {
        readUrl      : 'events',
        remotePaging : true
    },
    resourceStore : {
        pageParamName : 'page',
        autoLoad      : true,
        readUrl       : 'resources'
    },
    startDate : new Date('2024-05-01'),
    endDate   : new Date('2024-07-31'),
    columns   : [{
        text  : 'Name',
        field : 'name',
        width : 200
    }],
    bbar : {
        type  : 'pagingtoolbar',
        store : 'resourceStore'
    }
});