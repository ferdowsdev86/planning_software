var {
    SchedulerPro,
    DateHelper
} = window.bryntum.schedulerpro;

// Data fetching, replace with your own
const dataFetch = fetch('./data/data.json').then(res => res.json()),
    getResources = async({
        startIndex,
        count
    }) => {
        const data = await dataFetch;
        return {
            data  : data.resources.rows.slice(startIndex, startIndex + count),
            total : data.resources.rows.length
        };
    },
    getEventsData = async({
        startIndex,
        count,
        startDate,
        endDate,
        getAssignments = false
    }) => {
        const resources = (await getResources({
                startIndex,
                count
            })).data,
            data = await dataFetch,
            allAssignments = data.assignments.rows.filter(a => resources.some(r => r.id === a.resource)),
            events = data.events.rows.filter(e => DateHelper.intersectSpans(startDate, endDate, new Date(e.startDate), new Date(e.endDate)) && allAssignments.some(a => a.event === e.id)),
            assignments = allAssignments.filter(a => events.some(e => e.id === a.event || e.children.some(c => c.id === a.event)));
        return getAssignments ? assignments : events;
    };
dataFetch.then(data => {
    scheduler.project.dependencyStore.data = data.dependencies.rows;
});

// SchedulerPro configuration
const scheduler = new SchedulerPro({
    appendTo          : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom        : true,
    resourceImagePath : '../_shared/images/transparent-users/',
    startDate         : new Date(2025, 0, 24, 7),
    endDate           : new Date(2025, 0, 24, 23),
    viewPreset        : 'hourAndDay',
    rowHeight         : 90,
    barMargin         : 10,
    columns           : [{
        type  : 'resourceInfo',
        text  : 'Name',
        field : 'name',
        width : 130
    }, {
        type  : 'rating',
        text  : 'Speaker rating',
        field : 'rating'
    }],
    project : {
        resourceStore : {
            lazyLoad : {
                chunkSize : 30
            },
            autoLoad : true,
            async requestData({
                startIndex,
                count
            }) {
                return await getResources({
                    startIndex,
                    count
                });
            }
        },
        eventStore : {
            tree     : true,
            lazyLoad : true,
            async requestData({
                startDate,
                endDate,
                startIndex,
                count
            }) {
                const data = await getEventsData({
                    startDate,
                    endDate,
                    startIndex,
                    count
                });
                return {
                    data
                };
            }
        },
        assignmentStore : {
            lazyLoad : true,
            async requestData({
                startDate,
                endDate,
                startIndex,
                count
            }) {
                const data = await getEventsData({
                    startDate,
                    endDate,
                    startIndex,
                    count,
                    getAssignments : true
                });
                return {
                    data
                };
            }
        }
    },
    features : {
        nestedEvents : {
            // Don't allow dragging nested events out of their parents
            constrainDragToParent : true
        }
    }
});