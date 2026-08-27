import shared from '../_shared/shared.module.js';
import { DateHelper, Scheduler, CrudManager } from '../../build/schedulerpro.module.js';

const
    groupIcons  = {
        ceo       : 'fa fa-fw fa-crown',
        cto       : 'fa fa-fw fa-crown',
        developer : 'fa fa-fw fa-code',
        designer  : 'fa fa-fw fa-palette'
    },
    crudManager = new CrudManager({
        loadUrl : 'data/data.json',

        // Group by role field
        resourceStore : {
            groupers : ['role']
        }
    });

// Not using top-level await here, since example is also transpiled to UMD, which does not support it
crudManager.load().then(() => {
    const
        titles        = crudManager.resourceStore.getGroupTitles(),
        headerConfigs = titles.map(title => {
            return {
                unit     : 'day',
                // Show a number indicating number of events intersecting each day for each group
                renderer : (startDate, endDate, headerConfig, index, scheduler) => {
                    let events = 0;
                    scheduler.eventStore.forEach(event => {
                        if (event.resource?.role === title) {
                            if (DateHelper.intersectSpans(event.startDate, event.endDate, startDate, endDate)) {
                                events++;
                            }
                        }
                    });

                    return events || '';
                }
            };
        }),
        scheduler     = new Scheduler({
            appendTo         : 'container',
            // Enables smoother wheel and pinch zooming
            smoothZoom       : true,
            eventColor       : 'blue',
            barMargin        : 5,
            startDate        : new Date(2024, 6, 1),
            endDate          : new Date(2024, 6, 21),
            zoomOnMouseWheel : false,
            resourceImages   : {
                path      : '../_shared/images/transparent-users/',
                extension : '.png'
            },
            rowHeight : 50,
            crudManager,

            columns : [
                {
                    type     : 'resourceInfo',
                    width    : 200,
                    sortable : false,
                    // Generate group header titles
                    headerRenderer() {
                        return titles.map(title => `
                        <div class="b-column-header-row">
                            <i class="fa ${groupIcons[title?.toLowerCase()]}"></i>${title}
                        </div>`).join('');
                    },
                    filterable : {
                        filterField : {
                            type        : 'textfield',
                            placeholder : 'Filter resources...',
                            ariaLabel   : 'Enter text to filter resources',
                            cls         : 'b-searchbox',
                            triggers    : {
                                plug : {
                                    cls : 'fa fa-magnifying-glass'
                                }
                            }
                        }
                    }
                }
            ],

            features : {
                filterBar : true,
                group     : {
                    renderer({ rowElement, groupRowFor }) {
                        if (rowElement.closest('[data-region="locked"]')) {
                            return `<i class="fa ${groupIcons[groupRowFor?.toLowerCase()]}"></i><span class="b-group-header-row-text">${groupRowFor}</span>`;
                        }
                    }
                }
            },

            viewPreset : {
                base           : 'weekAndDayLetter',
                rowHeight      : 40,
                timeResolution : {
                    unit      : 'day',
                    increment : 1
                },

                headers : [
                    {
                        unit       : 'week',
                        dateFormat : 'LL'
                    },
                    {
                        unit       : 'd',
                        dateFormat : 'dd'
                    },
                    // Dynamically generated headers for group summary
                    ...headerConfigs
                ]
            }
        });

    scheduler.eventStore.on('change', () => scheduler.timeAxisColumn.refreshHeader());
});
