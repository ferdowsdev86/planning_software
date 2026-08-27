import shared from '../_shared/shared.module.js';
import { Scheduler, SchedulerResourceModel, DateHelper, LocaleManager } from '../../build/schedulerpro.module.js';

class Property extends SchedulerResourceModel {
    static fields = [
        // Using icons for resources
        {
            name         : 'image',
            defaultValue : false
        }
    ];
}

const scheduler = new Scheduler({
    appendTo   : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,

    startDate  : new Date(2022, 11, 1),
    endDate    : new Date(2022, 11, 20),
    barMargin  : 10,
    rowHeight  : 60,
    eventStyle : 'filled',

    viewPreset : 'weekAndDayLetter',

    features : {
        sort                : 'name',
        // Shade non-working days
        nonWorkingTime      : true,
        eventNonWorkingTime : {
            disabled : true
        },

        scheduleTooltip : {
            // Hide schedule tooltip when hovering non-working days
            hideForNonWorkingTime : true
        }
    },

    // CrudManager loads all data from a single source
    crudManager : {
        resourceStore : {
            modelClass : Property
        },

        autoLoad : true,

        loadUrl : 'data/data.json'
    },

    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    columns : [
        {
            type          : 'resourceInfo',
            width         : 220,
            text          : 'Properties',
            headerWidgets : [
                {
                    type      : 'button',
                    icon      : 'fa fa-cog',
                    rendition : 'text',
                    tooltip   : 'Toggle settings toolbar',
                    async onClick({ source : button }) {
                        const
                            { grid } = button.owner,
                            { element } = grid.tbar;

                        if (!element.style.height) {
                            // Set initial height + flush for transition to work
                            element.style.height = element.offsetHeight + 'px';
                            // Using void to prevent build optimizers from removing the reflow trigger
                            void element.offsetHeight;
                        }

                        element.classList.toggle('b-collapsed');
                    }
                }
            ]
        }
    ],

    tbar : [
        {
            type : 'slidetoggle',
            text : 'Custom styling',
            onChange({ checked }) {
                scheduler.cls = checked ? 'custom-style' : '';
            }
        },
        {
            type    : 'slidetoggle',
            text    : 'Display ranges',
            checked : true,
            onChange({ checked }) {
                scheduler.features.nonWorkingTime.disabled = !checked;
            }
        },
        {
            type : 'slidetoggle',
            text : 'Shade bars',
            onChange({ checked }) {
                scheduler.features.eventNonWorkingTime.disabled = !checked;
            }
        },
        '->',
        {
            type : 'label',
            html : 'Non-working days'
        },
        {
            type          : 'daybuttons',
            ref           : 'nonWorkingDays',
            rendition     : 'padded',
            dayNameLength : 3,
            value         : DateHelper.nonWorkingDaysAsArray,
            onChange      : 'up.onNonWorkingDayChange'
        }
    ],

    onNonWorkingDayChange({ source : dayButtons }) {
        const locale                            = LocaleManager;

        // Update nonWorkingDays in current locale
        locale.locale.DateHelper.nonWorkingDays = Object.fromEntries(dayButtons.valueAsDayNumbers.map(value => [value, 1]));

        // Force-apply current locale to update non-working intervals
        LocaleManager.applyLocale(locale, true);
    }
});
