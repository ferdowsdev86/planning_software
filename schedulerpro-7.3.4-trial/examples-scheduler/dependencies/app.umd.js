var {
    DomHelper,
    StringHelper,
    Scheduler
} = window.bryntum.schedulerpro;
const terminalHideDelay = 300,
    terminalShowDelay = 100;
const scheduler = new Scheduler({
    appendTo            : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom          : true,
    eventStyle          : null,
    eventColor          : null,
    useInitialAnimation : 'slide-from-left',
    multiEventSelect    : true,
    // Css class used in app styling for animating terminals, can be toggled from the UI
    cls                 : 'animate-terminals',
    features            : {
        stripe       : true,
        dependencies : {
            // Makes dependency lines easier to click. Note that configuring clickWidth > 0 can be costly in terms of
            // performance, if you have a lot of dependencies on screen at the same time. Using it draws two paths for
            // each dependency, instead of one.
            clickWidth             : 10,
            // Round the corners of the dependency lines. Note that configuring radius > 0 can be costly in terms of
            // performance, if you have a lot of dependencies on screen at the same time. It is cheaper to draw straight
            // lines, than lines with rounded corners.
            radius                 : 10,
            // How far in px from the edge of the event bar to place the terminals
            // (negative numbers are further away from the bar, positive further inside)
            terminalOffset         : 4,
            // Size of dependency terminals in px
            terminalSize           : 14,
            // Time to wait after mouse enters an event bar, before showing the terminals
            // (using a short delay, to make UI feel less "jumpy" when moving mouse over multiple events)
            terminalShowDelay,
            // Time to wait before hiding a terminal after mouse leaves the event bar / terminal.
            // Lets us use an animation for the hide operation
            terminalHideDelay,
            // Enables simple deletion of dependencies by clicking on them
            enableDependencyDelete : true,
            // These are the default values, included here to show that they can be configured. If you have a lot of
            // dependencies on screen at the same time, you might want to opt out of these to make other scheduler
            // interactions smoother.
            drawOnScroll           : true,
            drawOnEventInteraction : true,
            tooltipTemplate(dependencyModel) {
                const {
                    fromEvent,
                    toEvent
                } = dependencyModel;
                return StringHelper.xss`${fromEvent.name} (${fromEvent.id}) -> ${toEvent.name} (${toEvent.id})`;
            }
        },
        dependencyMenu : true,
        dependencyEdit : {
            showLagField : false
        },
        timeRanges : true,
        eventDrag  : {
            constrainDragToResource : true
        },
        eventDragSelect : true
    },
    rowHeight : 60,
    barMargin : 14,
    columns   : [{
        text  : 'Production line',
        width : 150,
        field : 'name'
    }],
    startDate   : new Date(2017, 11, 1),
    endDate     : new Date(2017, 11, 3),
    crudManager : {
        autoLoad : true,
        loadUrl  : 'data/data.json'
    },
    viewPreset : {
        base           : 'hourAndDay',
        tickWidth      : 25,
        columnLinesFor : 0,
        headers        : [{
            unit       : 'd',
            align      : 'center',
            dateFormat : 'ddd DD MMM'
        }, {
            unit       : 'h',
            align      : 'center',
            dateFormat : 'HH'
        }]
    },
    eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
    }) {
        const bgColor = resourceRecord.bg || '';
        renderData.style = `background-color:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
        renderData.iconCls.add('fa', `fa-${resourceRecord.icon}`);
        return StringHelper.encodeHtml(eventRecord.name);
    },
    listeners : {
    // Prevent showing terminals on milestones
        beforeShowTerminals({
            source
        }) {
            return !source.isMilestone;
        }
    },
    tbar : [{
        type : 'label',
        text : 'Marker'
    }, {
        type        : 'buttongroup',
        rendition   : 'padded',
        toggleGroup : true,
        items       : {
            defaultMarker : {
                text      : 'Default',
                pressed   : true,
                markerDef : null
            },
            // These buttons have custom marker definitions (SVG path definitions for the arrow heads)
            thinMarker : {
                text      : 'Thin',
                markerDef : 'M3,0 L8,3 L3,6'
            },
            circleMarker : {
                text      : 'Circle',
                markerDef : 'M2,3 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0'
            }
        },
        onToggle({
            source
        }) {
            if (source.pressed) {
                scheduler.features.dependencies.markerDef = source.markerDef;
            }
            scheduler.element.classList.toggle(`marker-${source.text.toLowerCase()}`, source.pressed);
        }
    }, {
        ref  : 'lineSettingsButton',
        type : 'button',
        text : 'Line settings',
        menu : {
            defaults : {
                labelWidth : '11em'
            },
            items : {
                stroke : {
                    type  : 'slider',
                    min   : 1,
                    max   : 3,
                    value : 1,
                    text  : 'Stroke',
                    unit  : 'px',
                    onInput({
                        value
                    }) {
                        // scheduler.features.dependencies.radius = value;
                        scheduler.timeAxisSubGridElement.style.setProperty('--b-dependency-stroke-width', value);
                    }
                },
                radius : {
                    type  : 'slider',
                    min   : 0,
                    max   : 10,
                    value : 10,
                    text  : 'Radius',
                    unit  : 'px',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.radius = value;
                    }
                },
                clickWidth : {
                    type  : 'slider',
                    min   : 1,
                    max   : 20,
                    value : 10,
                    text  : 'Click width',
                    unit  : 'px',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.clickWidth = value;
                        DomHelper.addTemporaryClass(scheduler.element, 'b-highlight-click-area', 1000, scheduler);
                    }
                }
            }
        }
    }, {
        ref  : 'terminalSettingsButton',
        type : 'button',
        text : 'Terminal settings',
        menu : {
            defaults : {
                labelWidth : '12em'
            },
            items : {
                size : {
                    type  : 'slider',
                    min   : 10,
                    max   : 16,
                    step  : 2,
                    value : 14,
                    text  : 'Terminal size',
                    unit  : 'px',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.terminalSize = value;
                        const eventRecord = scheduler.eventStore.getById(4);
                        eventRecord && scheduler.features.dependencies.showTerminals(eventRecord, scheduler.getElementFromEventRecord(eventRecord));
                        DomHelper.addTemporaryClass(scheduler.element, 'b-highlight-hover-area', 1000, scheduler);
                    }
                },
                offset : {
                    type  : 'slider',
                    min   : -8,
                    max   : 8,
                    value : 4,
                    text  : 'Terminal offset',
                    unit  : 'px',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.terminalOffset = value;
                        const eventRecord = scheduler.eventStore.getById(4);
                        eventRecord && scheduler.features.dependencies.showTerminals(eventRecord, scheduler.getElementFromEventRecord(eventRecord));
                        DomHelper.addTemporaryClass(scheduler.element, 'b-highlight-hover-area', 1000, scheduler);
                    }
                },
                showDelay : {
                    type  : 'slider',
                    min   : 0,
                    max   : 500,
                    step  : 100,
                    unit  : 'ms',
                    value : terminalShowDelay,
                    text  : 'Show delay',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.terminalShowDelay = value;
                    }
                },
                hideDelay : {
                    type  : 'slider',
                    min   : 300,
                    // Min 300 when animating terminals, otherwise they will hide before animation finishes
                    max   : 600,
                    step  : 100,
                    unit  : 'ms',
                    value : terminalHideDelay,
                    text  : 'Hide delay',
                    onInput({
                        value
                    }) {
                        scheduler.features.dependencies.terminalHideDelay = value;

                        // Used by demos styling to determine length of terminal hide animation
                        scheduler.element.style.setProperty('--terminal-hide-delay', `${value}ms`);
                    }
                },
                animateTerminals : {
                    type    : 'checkbox',
                    text    : 'Animate terminals',
                    checked : true,
                    onChange({
                        checked
                    }) {
                        scheduler.widgetMap.terminalSettingsButton.menu.widgetMap.hideDelay.min = checked ? 300 : 0;
                        scheduler.element.classList.toggle('animate-terminals', checked);
                    }
                }
            }
        }
    }, '->', {
        ref         : 'mouseUpAnywhere',
        type        : 'slidetoggle',
        checked     : true,
        icon        : 'fa fa-square',
        pressedIcon : 'fa fa-check-square',
        text        : 'Mouse up anywhere on target',
        tooltip     : `Uncheck to require a drop on a target event bar side circle to define the dependency type.
                       If dropped on the event bar, the defaultValue of the SchedulerDependencyModel <code>type</code> field will be used to
                       determine the target task side.`,
        onAction({
            checked
        }) {
            scheduler.features.dependencies.allowDropOnEventBar = checked;
        }
    }]
});