import shared from '../_shared/shared.module.js';
import { DateHelper, StringHelper, Scheduler } from '../../build/schedulerpro.module.js';

let lunchAt = 11;

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'indented',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },
    barMargin : 5,

    features : {
        stripe          : true,
        scheduleTooltip : false,
        timeRanges      : {
            enableResizing         : true,
            showCurrentTimeLine    : true,
            showHeaderElements     : true,
            showMouseIndicatorLine : true,
            // Define a custom tooltip shown when hovering a time range header element
            tooltipTemplate        : ({ timeRange }) => {
                if (timeRange.id === 'currentTime') {
                    return 'Current time';
                }
                return `${DateHelper.format(timeRange.startDate, 'LST')} ${timeRange.duration ? DateHelper.format(timeRange.endDate, '- LST') : ''} ${timeRange.name}`;
            },

            headerRenderer({ timeRange }) {
                const { iconCls } = timeRange;
                if (timeRange.cls['b-circle']) {
                    return '';
                }
                if (timeRange.cls['b-triangle']) {
                    return `<i class="${iconCls}"></i>`;
                }
                // Lunch time range has a custom header showing its name and time span, using a container query to
                // hide the end time when the header is too narrow to fit it
                if (timeRange.cls['lunch']) {
                    return `<div class="time">${DateHelper.format(timeRange.startDate, 'LST')} <span class="end">- ${DateHelper.format(timeRange.endDate, 'LST')}</span></div> ${StringHelper.encodeHtml(timeRange.name)}`;
                }
                if (timeRange.id !== 'currentTime') {
                    return `${iconCls ? `<i class="${iconCls}"></i> ` : ''}${StringHelper.encodeHtml(timeRange.name)}`;
                }
                return timeRange.name;
            }
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Staff', field : 'name', width : '10em' }
    ],

    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },

    startDate  : new Date(2022, 1, 7, 8),
    endDate    : new Date(2022, 1, 7, 18),
    viewPreset : 'hourAndDay',

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord })  {
        return StringHelper.xss`
            <div class="b-sch-event-header">${DateHelper.format(eventRecord.startDate, this.displayDateFormat)}</div>
            <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
        `;
    },

    tbar : [
        {
            type : 'button',
            icon : 'b-icon-add',
            text : 'Add range',
            onAction({ source : button }) {
                scheduler.project.timeRangeStore.add({
                    name         : 'New range',
                    startDate    : DateHelper.add(scheduler.startDate, 8, 'h'),
                    duration     : 1,
                    durationUnit : 'h'
                });

                button.disable();
            }
        },
        {
            type : 'button',
            ref  : 'moveButton',
            text : 'Move lunch to 12pm',
            onAction() {
                scheduler.tbar.widgetMap.moveButton.text = `Move lunch to ${lunchAt}pm`;
                lunchAt = lunchAt === 11 ?  12 : 11;
                scheduler.project.timeRangeStore.getById(2).startDate = new Date(2022, 1, 7, lunchAt);
            }
        },
        {
            type : 'button',
            ref  : 'settingsButton',
            text : 'Settings',
            menu : [
                {
                    text    : 'Show current time line',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.timeRanges.showCurrentTimeLine = checked;
                    }
                },
                {
                    text    : 'Show header elements',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.timeRanges.showHeaderElements = checked;
                    }
                },
                {
                    text    : 'Show mouse indicator line',
                    checked : true,
                    onToggle({ checked }) {
                        scheduler.features.timeRanges.showMouseIndicatorLine = checked;
                    }
                }
            ]
        },
        '->',
        {
            type  : 'buttongroup',
            items : [
                {
                    type    : 'button',
                    icon    : 'b-icon-previous',
                    tooltip : 'View previous day',
                    onAction() {
                        scheduler.shiftPrevious();
                    }
                },
                {
                    type    : 'button',
                    ref     : 'todayButton',
                    text    : 'Today',
                    tooltip : 'View today, to see the current time line',
                    onAction() {
                        const today = DateHelper.clearTime(new Date());
                        today.setHours(5);
                        scheduler.setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
                    }
                },
                {
                    type    : 'button',
                    icon    : 'b-icon-next',
                    tooltip : 'View next day',
                    onAction() {
                        scheduler.shiftNext();
                    }
                }
            ]
        },
        {
            type    : 'button',
            text    : 'Start',
            tooltip : 'Return to initial view',
            onAction() {
                scheduler.setTimeSpan(new Date(2022, 1, 7, 8), new Date(2022, 1, 7, 18));
            }
        }
    ]
});
