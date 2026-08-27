import {
    AssignmentModel, AssignmentStoreConfig, DateHelper, DependencyModel, EventModel, EventStoreConfig, LazyLoadRequestParams, ResourceModel,
    ResourceStoreConfig
} from '@bryntum/schedulerpro';

interface DataResponse {
    resources: { rows: ResourceModel[] }
    events: { rows: EventModel[] }
    assignments: { rows: AssignmentModel[] }
    dependencies: { rows: DependencyModel[] }
}

// Data fetching, replace it with your own
const dataFetch = fetch('./data/data.json').then(res => res.json());

export const getResources: ResourceStoreConfig['requestData'] = async params => {
    const
        { startIndex, count } = params as LazyLoadRequestParams,
        data                  = await dataFetch as DataResponse,
        resources             = data.resources.rows;
    return {
        data  : resources.slice(startIndex, startIndex + count),
        total : resources.length
    };
};

export const getEvents: EventStoreConfig['requestData'] = async params => {
    const { startIndex, count, startDate, endDate } = params as LazyLoadRequestParams;

    if (startDate && endDate) {
        const
            resources           = (await getResources({ startIndex, count } as LazyLoadRequestParams)).data as ResourceModel[],
            allData             = await dataFetch as DataResponse,
            assignments         = allData.assignments.rows,
            events              = allData.events.rows,
            filteredAssignments = assignments.filter(a => resources.some(r => r.id === a.resource)),
            data                = events.filter(e =>
                DateHelper.intersectSpans(startDate, endDate, new Date(e.startDate), new Date(e.endDate)) &&
                filteredAssignments.some(a => a.event === e.id)
            );

        return {
            data,
            total : events.length
        };
    }

    return {
        data  : [],
        total : 0
    };
};

export const getAssignments: AssignmentStoreConfig['requestData'] = async params => {
    const { startIndex, count, startDate, endDate } = params as LazyLoadRequestParams;

    if (startDate && endDate) {
        const
            resources           = (await getResources({ startIndex, count } as LazyLoadRequestParams)).data as ResourceModel[],
            allData             = await dataFetch as DataResponse,
            assignments         = allData.assignments.rows,
            events              = allData.events.rows,
            filteredAssignments = assignments.filter(a => resources.some(r => r.id === a.resource)),
            filteredEvents      = events.filter(e =>
                DateHelper.intersectSpans(startDate, endDate, new Date(e.startDate), new Date(e.endDate)) &&
                filteredAssignments.some(a => a.event === e.id)
            ),
            data                = filteredAssignments.filter(a =>
                filteredEvents.some(e => e.id === a.event || (e.children as EventModel[]).some(c => c.id === a.event))
            );

        return {
            data,
            total : assignments.length
        };
    }

    return {
        data  : [],
        total : 0
    };
};

export const getDependencies = async() => (await dataFetch).dependencies.rows;
