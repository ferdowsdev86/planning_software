/**
 * Application config file
 */

import { StringHelper, SchedulerEventModel, SchedulerResourceModel } from '@bryntum/schedulerpro';

class AppResourceModel extends SchedulerResourceModel {

    bg?: string;
    icon?: string;
    textColor?: string;

    static override get fields()  {
        return [
            'bg',
            'icon',
            'textColor'
        ];
    }
}

export const schedulerProps = {
    // Enables smoother wheel and pinch zooming
    smoothZoom : true,
    eventStyle : null,
    eventColor : null,

    resourceImages : {
        path      : 'assets/users/',
        extension : '.png'
    },

    stripeFeature       : true,
    dependenciesFeature : {
        // Makes dependency lines easier to click. Note that configuring clickWidth > 0 can be costly in terms of
        // performance, if you have a lot of dependencies on screen at the same time. Using it draws two paths for
        // each dependency, instead of one.
        clickWidth        : 10,
        // Round the corners of the dependency lines. Note that configuring radius > 0 can be costly in terms of
        // performance, if you have a lot of dependencies on screen at the same time. It is cheaper to draw straight
        // lines, than lines with rounded corners.
        radius            : 10,
        // How far in px from the edge of the event bar to place the terminals
        // (negative numbers are further away from the bar, positive further inside)
        terminalOffset    : 4,
        // Size of dependency terminals in px
        terminalSize      : 14,
        // Time to wait after mouse enters an event bar, before showing the terminals
        // (using a short delay, to make UI feel less "jumpy" when moving mouse over multiple events)
        terminalShowDelay : 100,
        // Time to wait before hiding a terminal after mouse leaves the event bar / terminal.
        // Lets us use an animation for the hide operation
        terminalHideDelay : 300,

        // Enables simple deletion of dependencies by clicking on them
        enableDependencyDelete : true,

        // These are the default values, included here to show that they can be configured. If you have a lot of
        // dependencies on screen at the same time, you might want to opt out of these to make other scheduler
        // interactions smoother.
        drawOnScroll           : true,
        drawOnEventInteraction : true
    },
    dependencyMenuFeature : true,
    dependencyEditFeature : {
        showLagField : false
    },
    timeRangesFeature : true,
    eventDragFeature  : {
        constrainDragToResource : true
    },

    rowHeight : 60,
    barMargin : 14,

    columns : [
        {
            text  : 'Production line',
            width : 150,
            field : 'name'
        }
    ],

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 3),

    crudManager : {
        autoLoad         : true,
        loadUrl          : 'assets/data/data.json',
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true,
        resourceStore    : {
            modelClass : AppResourceModel
        }
    },

    viewPreset : {
        base            : 'hourAndDay',
        tickWidth       : 25,
        columnLinesFor  : 0,
        mainHeaderLevel : 1,
        headers         : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }
        ]
    },

    eventRenderer({ eventRecord, resourceRecord, renderData } : { eventRecord : SchedulerEventModel; resourceRecord : AppResourceModel; renderData : any }) : string {
        const
            { encodeHtml } = StringHelper,
            bgColor        = encodeHtml(resourceRecord.bg || '');

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${encodeHtml(resourceRecord.textColor || '')}`;
        renderData.iconCls.add('fa', `fa-${encodeHtml(resourceRecord.icon || '')}`);

        return StringHelper.encodeHtml(eventRecord.name);
    }

};
