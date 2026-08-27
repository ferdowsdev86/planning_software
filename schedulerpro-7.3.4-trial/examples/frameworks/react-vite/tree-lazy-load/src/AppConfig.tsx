import { AjaxHelper, DateHelper, EventStoreConfig, LazyLoadRequestParams, ResourceStoreConfig, SchedulerPro, Widget } from '@bryntum/schedulerpro';
import { BryntumSchedulerProProjectModelProps, BryntumSchedulerProProps } from '@bryntum/schedulerpro-react';
import { AppResource, Cinema, Movie } from './lib/AppResource';

import genresData from '../php/data/genres.json';

// Uncomment importing of JSON data here for data processing inside the app instead of a PHP backend
// See the comments below inside requestData methods for data stores
// import resourcesData from '../php/data/resources.json';
// import eventsData from '../php/data/events.json';

const getSchedulerPro = (source: Widget) => source.up(SchedulerPro.type) as SchedulerPro;
const startDate       = new Date(2025, 3, 14, 9);
const endDate         = new Date(2025, 3, 15, 0);
const lastDate        = new Date(2025, 3, 20, 9);
const dateFormat      = 'YYYY-MM-DDTHH:mm:ss';

/**
 * Data is lazily loaded from a PHP backend.
 * Check the Lazy data loading guide here:
 * https://bryntum.com/products/schedulerpro/docs/guide/Scheduler/data/lazyloading
 */
const resourceStoreConfig: ResourceStoreConfig = {
    modelClass   : AppResource,
    autoLoad     : true,
    lazyLoad     : true,
    tree         : true,
    remoteFilter : true,
    requestData  : async params => {
        const { count, startIndex, parentId, filters } = params as LazyLoadRequestParams;

        // Please note that the React development server running with "Vite" does not support PHP script processing.
        // You will need to build the application and run it on a web server that supports PHP (e.g., Apache).
        // Check the README.md in application's folder for setting up an Apache

        const queryParams = {
            count,
            startIndex,
            parentId
        } as any;

        if (filters?.length) {
            queryParams.filters = encodeURIComponent(
                JSON.stringify(filters.map(filter => ({
                    property : 'genre',
                    value    : filter.value
                })
                )));
        }

        return (await AjaxHelper.fetch(
            '../php/resources.php',
            {
                parseJson : true,
                queryParams
            }
        )).parsedJson;

        // Remove the return statement above and uncomment the code below to use data processing inside application
        // Uncomment importing data at the top of the file

        // let filteredResources = [...resourcesData];
        //
        // if (params.filters?.length) {
        //     // Filter parent resources by checking if any child matches a filter
        //     filteredResources = filteredResources
        //         .map((parent: any) => {
        //             const matchingChildren = parent.children?.filter((child: any) =>
        //                 filters!.some(filter => child.genre && child.genre.toLowerCase() === filter.value)
        //             );
        //
        //             // Return a new parent object only if it has matching children
        //             if (matchingChildren?.length) {
        //                 return {
        //                     ...parent,
        //                     children : matchingChildren
        //                 };
        //             }
        //             return null;
        //         })
        //         .filter(Boolean);
        // }
        //
        // const resources = (parentId === 'root' ? filteredResources : filteredResources.find(r => r.id === parentId)!.children) as any[];
        //
        // const data = resources.slice(startIndex, startIndex + count).map(r => {
        //     const res = { ...r };
        //     delete res.children;
        //     return res;
        // });
        //
        // return {
        //     data,
        //     total : resources.length
        // };
    }
};

const eventStoreConfig: EventStoreConfig = {
    autoLoad    : true,
    lazyLoad    : true,
    requestData : async params => {
        const { startDate, endDate, resourceIds } = params as LazyLoadRequestParams;

        // Please note that the React development server running with "Vite" does not support PHP script processing.
        // You will need to build the application and run it on a web server that supports PHP (e.g., Apache).
        // Check the README.md in application's folder for setting up an Apache

        return (await AjaxHelper.fetch(
            '../php/events.php',
            {
                parseJson   : true,
                queryParams : {
                    startDate   : DateHelper.format(startDate!, dateFormat),
                    endDate     : DateHelper.format(endDate!, dateFormat),
                    resourceIds : resourceIds!.join(',')
                }
            }
        )).parsedJson;

        // Remove the return statement above and uncomment the code below to use data processing inside application
        // Uncomment importing data at the top of the file

        // const
        //     data = eventsData.filter(event =>
        //         (resourceIds as String[]).includes(event.resourceId) &&
        //         DateHelper.intersectSpans(
        //             startDate as Date, endDate as Date,
        //             DateHelper.parse(event.startDate), DateHelper.parse(event.endDate)
        //         )
        //     );
        //
        // return {
        //     data,
        //     total : data.length
        // };
    }
};

export const projectProps: BryntumSchedulerProProjectModelProps = {
    resourceStore : resourceStoreConfig,
    eventStore    : eventStoreConfig
};

export const schedulerProProps: BryntumSchedulerProProps = {

    startDate,
    endDate,

    viewPreset : 'hourAndDay',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    rowHeight : 80,

    columns : [
        {
            type       : 'tree',
            text       : 'Cinema',
            field      : 'name',
            width      : 350,
            readOnly   : true,
            htmlEncode : false,
            sortable   : false,
            filterable : {
                filterField : {
                    label        : 'Genre',
                    type         : 'combo',
                    multiSelect  : false,
                    displayField : 'text',
                    valueField   : 'value',
                    items        : genresData
                }
            },

            renderer : ({ record }) => {
                if (record.isLeaf) {
                    const movie = record as Movie;
                    return [{
                        className : 'movie',
                        children  : [
                            {
                                className : 'name',
                                text      : movie.name
                            },
                            {
                                tag       : 'div',
                                className : 'info',
                                children  : [
                                    {
                                        tag       : 'i',
                                        className : 'fa fa-stopwatch'
                                    },
                                    {
                                        html : DateHelper.format(movie.durationDate, 'HH:mm')
                                    },
                                    {
                                        tag       : 'i',
                                        className : 'fa fa-masks-theater'
                                    },
                                    {
                                        text : movie.genre
                                    }
                                ]
                            },
                            {
                                tag       : 'div',
                                className : 'info',
                                text      : `${movie.country}, ${movie.productionCompany}`
                            }
                        ]
                    }];
                }
                else {
                    const cinema = record as Cinema;
                    return [{
                        className : 'movie',
                        children  : [
                            {
                                className : 'name',
                                text      : cinema.name
                            },
                            {
                                tag       : 'div',
                                className : 'info',
                                children  : [
                                    {
                                        tag       : 'i',
                                        className : 'fa fa-location-dot'
                                    },
                                    {
                                        text : cinema.city
                                    }]
                            }
                        ]
                    }];
                }
            }
        }
    ],

    filterBarFeature : true,

    treeFeature : true,

    dependenciesFeature : false,

    tbar : [
        {
            type     : 'button',
            ref      : 'previous-day',
            icon     : 'b-icon b-icon-previous',
            tooltip  : 'Previous day',
            onAction : ({ source }) => {
                if (DateHelper.isEqual(getSchedulerPro(source).startDate, startDate)) {
                    return;
                }
                getSchedulerPro(source).shiftPrevious();
            }
        },
        {
            type     : 'button',
            ref      : 'start-day',
            text     : 'Start day',
            tooltip  : 'Project start day',
            onAction : ({ source }) => {
                getSchedulerPro(source).setStartDate(startDate);
            }
        },
        {
            type     : 'button',
            ref      : 'next-day',
            icon     : 'b-icon b-icon-next',
            tooltip  : 'Project next day',
            onAction : ({ source }) => {
                if (DateHelper.isEqual(getSchedulerPro(source).startDate, lastDate)) {
                    return;
                }
                getSchedulerPro(source).shiftNext();
            }
        }
    ]

};
