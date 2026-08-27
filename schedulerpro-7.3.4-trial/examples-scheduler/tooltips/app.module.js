import shared from '../_shared/shared.module.js';
import { StringHelper, DateHelper, AjaxHelper, TabPanel, SchedulerEventModel } from '../../build/schedulerpro.module.js';

class Task extends SchedulerEventModel {
    static get fields() {
        return [
            'note',
            'image',
            'href',
            'warning'
        ];
    }
}

const tabPanel = new TabPanel({
    appendTo : 'container',
    cls      : 'demo-app', // Apply shared demo styling to put it in a nice box
    items    : {
        local : {
            type : 'scheduler',
            // Enables smoother wheel and pinch zooming
            smoothZoom  : true,
            title       : 'Local tooltips',
            startDate   : new Date(2017, 0, 1, 6),
            endDate     : new Date(2017, 0, 1, 20),
            viewPreset  : 'hourAndDay',
            crudManager : {
                autoLoad   : true,
                loadUrl    : 'data/data.json',
                eventStore : {
                    modelClass : Task
                }
            },
            eventRenderer({ eventRecord, resourceRecord, renderData }) {
                const
                    { warning } = eventRecord,
                    warningIcon = warning ? `<i class="fa fa-exclamation-triangle b-warn-icon" data-btip="${StringHelper.encodeHtml(warning)}"></i>` : '';

                return StringHelper.encodeHtml(eventRecord.name) + warningIcon;
            },
            features : {
                eventDrag : {
                    // Custom tooltip for when an event is dragged
                    tooltipTemplate : ({ eventRecord, startDate }) => StringHelper.xss`
                        <h4 style="margin:0 0 1em 0">Custom drag drop tooltip</h4>
                        <div style="margin-bottom:0.8em">${eventRecord.name}</div>
                        <i style="margin-right:0.5em" class="b-icon b-icon-clock"></i>${DateHelper.format(startDate, 'HH:mm')}
                    `
                },

                eventResize : {
                    // A minimal tooltip when resizing
                    tooltipTemplate : ({ startDate, endDate }) =>
                        DateHelper.format(startDate, 'HH:mm') + '-' + DateHelper.format(endDate, 'HH:mm')
                },

                eventTooltip : {
                    maxWidth : '28em',
                    tools    : [
                        {
                            cls     : 'fa fa-cut',
                            tooltip : 'Split event',
                            handler() {
                                this.eventRecord.split();
                                this.hide();
                            }
                        },
                        {
                            cls     : 'fa fa-trash',
                            tooltip : 'Delete event',
                            handler() {
                                this.eventRecord.remove();
                                this.hide();
                            }
                        },
                        {
                            cls     : 'b-icon-previous',
                            tooltip : 'Move event 1h earlier',
                            handler() {
                                this.eventRecord.shift(-1);
                            }
                        },
                        {
                            cls     : 'b-icon-next',
                            tooltip : 'Move event 1h later',
                            handler() {
                                this.eventRecord.shift(1);
                            }
                        }
                    ],

                    header : {
                        titleAlign : 'start'
                    },

                    onBeforeShow({ source : tooltip }) {
                        tooltip.title = StringHelper.encodeHtml(tooltip.eventRecord.name);
                    },

                    template({ eventRecord }) {
                        return `<dl>
                            <dt>Assigned to</dt>
                            <dd>
                                ${eventRecord.resource.get('image') ? `<img class="resource-image" src="../_shared/images/transparent-users/${eventRecord.resource.image}"/>` : ''}
                                ${StringHelper.encodeHtml(eventRecord.resource.name)}
                            </dd>
                            <dt>Time</dt>
                            <dd>
                                ${DateHelper.format(eventRecord.startDate, 'LT')} - ${DateHelper.format(eventRecord.endDate, 'LT')}
                            </dd>
                            ${eventRecord.note ? `<dt>Note</dt>
                                <dd><a ${eventRecord.href ? `href="${eventRecord.href}"` : ''}>${StringHelper.encodeHtml(eventRecord.note)}</a></dd>` : ''
                        }
                            
                        </dl>
                        ${eventRecord.image ? `<img class="image" src="${eventRecord.image}"/>` : ''}`;
                        // You can also use Tooltip configs here, for example:
                        // anchorToTarget : false,
                        // trackMouse     : true
                    }
                }
            },

            columns : [
                { text : 'Name', field : 'name', width : 130 }
            ]
        },
        remote : {
            type : 'scheduler',
            // Enables smoother wheel and pinch zooming
            smoothZoom  : true,
            title       : 'Remotely loaded tooltips',
            startDate   : new Date(2017, 0, 1, 6),
            endDate     : new Date(2017, 0, 1, 20),
            viewPreset  : 'hourAndDay',
            crudManager : {
                autoLoad : true,
                loadUrl  : 'data/data.json'
            },
            features : {
                eventTooltip : {
                    template : ({ eventRecord }) => AjaxHelper.get(`./fakeServer?name=${eventRecord.name}`).then(response => response.responseText)
                }
            },

            columns : [
                { text : 'Name', field : 'name', width : 130 }
            ]
        }
    }
});

// DEMO ONLY: Mock a server endpoint fetching data to be shown in the async column
AjaxHelper.mockUrl('./fakeServer', (url, params) => {
    return {
        delay        : 1500,
        responseText : `<dl>
        <dt>Task</dt>
        <dd>${StringHelper.encodeHtml(params.name)}:</dd>
        <dt>Additional info</dt>
        <dd>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </dd>
    </dl>`
    };
});
