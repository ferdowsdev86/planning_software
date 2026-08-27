import { forwardRef, useCallback, RefObject, useEffect, useState } from 'react';
import { BryntumSchedulerPro, BryntumToolbar } from '@bryntum/schedulerpro-react';
import { DateHelper, Toast, SchedulerPro } from '@bryntum/schedulerpro';

type SchedulerToolbarProps = {
    schedulerRef: RefObject<BryntumSchedulerPro>
    toggleLayout: boolean
    setToggleLayout: React.Dispatch<React.SetStateAction<boolean>>
    mode: 'horizontal' | 'vertical'
    setMode: (mode: 'horizontal' | 'vertical') => void
}

const SchedulerToolbar = forwardRef<BryntumToolbar, SchedulerToolbarProps>((props, schedulerToolbarRef) => {
    // Some variables used in this demo
    const startHour = 7;
    const endHour   = 20;

    // destructure props
    const {
        schedulerRef,
        toggleLayout,
        setToggleLayout,
        mode,
        setMode
    } = props;

    // Save scheduler instance for easy access
    const [scheduler, setScheduler] = useState<SchedulerPro>();

    useEffect(() => {
        setScheduler(schedulerRef.current!.instance);
        if (!scheduler) {
            return;
        }
        const { project }      = scheduler!;
        const schedulerToolbar = (schedulerToolbarRef as RefObject<BryntumToolbar>).current!.instance;
        scheduler!.project.on({
            change : () => {
                const saveButton = schedulerToolbar.widgetMap?.['saveButton'];
                if (saveButton) {
                    saveButton.disabled = !Boolean(project.eventStore.changes);
                }
            },
            thisObj : project
        });
    }, [scheduler, schedulerRef, schedulerToolbarRef]);

    const onSave = useCallback(() => {
        Toast.show('TODO: Save data (see onSave() event for SchedulerPro)');
    }, []);

    const onSelect = useCallback(({ record }: { record: any }) => {
        const value     = record.value;
        const startDate = DateHelper.add(DateHelper.clearTime(scheduler!.startDate), startHour, 'h');
        const endDate   = DateHelper.add(startDate, value - 1, 'd');

        endDate.setHours(endHour);
        scheduler!.viewPreset = record.preset;
        scheduler!.setTimeSpan(startDate, endDate);

        // reset scroll
        scheduler!.scrollLeft = 0;
    }, [scheduler]);

    const onShiftPrevious = useCallback(() => {
        scheduler!.shiftPrevious();
    }, [scheduler]);

    const onShiftNext = useCallback(() => {
        scheduler!.shiftNext();
    }, [scheduler]);

    const onClickToday = useCallback(() => {
        const startDate = DateHelper.clearTime(new Date());
        scheduler!.setTimeSpan(DateHelper.add(startDate, startHour, 'h'), DateHelper.add(startDate, endHour, 'h'));
    }, [scheduler]);

    const onToggleLayout = useCallback(() => {
        setToggleLayout(!toggleLayout);
    }, [setToggleLayout, toggleLayout]);

    const onSwitchToVertical = useCallback(() => {
        setMode('vertical');
    }, [setMode]);

    const onSwitchToHorizontal = useCallback(() => {
        setMode('horizontal');
    }, [setMode]);

    // Keep the toggle-group button pressed states in sync with the current mode.
    // Bryntum toolbar items are not React-controlled elements, so their visual state must be
    // updated imperatively through the Bryntum widget API — the same mechanism the vanilla JS
    // example handles via the `pressed: 'up.isVertical'` / `pressed: 'up.isHorizontal'` bindings.
    useEffect(() => {
        const toolbar = (schedulerToolbarRef as RefObject<BryntumToolbar>).current?.instance;
        if (!toolbar) {
            return;
        }
        const verticalBtn   = toolbar.widgetMap?.['mode-vertical'] as any;
        const horizontalBtn = toolbar.widgetMap?.['mode-horizontal'] as any;
        if (verticalBtn) {
            verticalBtn.pressed = mode === 'vertical';
        }
        if (horizontalBtn) {
            horizontalBtn.pressed = mode === 'horizontal';
        }
    }, [mode, schedulerToolbarRef]);

    return <BryntumToolbar
        ref={schedulerToolbarRef}
        items={[
            {
                text      : 'Save',
                width     : 100,
                rendition : 'filled',
                ref       : 'saveButton',
                disabled  : true,
                onAction  : onSave
            },
            {
                type         : 'combo',
                ref          : 'preset',
                editable     : false,
                label        : 'Show',
                value        : 1,
                valueField   : 'value',
                displayField : 'name',
                items        : [
                    {
                        name   : '1 day',
                        value  : 1,
                        preset : {
                            base      : 'hourAndDay',
                            tickWidth : 45
                        }
                    },
                    {
                        name   : '3 days',
                        value  : 3,
                        preset : {
                            base : 'dayAndWeek'
                        }
                    },
                    {
                        name   : '1 week',
                        value  : 7,
                        preset : {
                            base : 'dayAndWeek'
                        }
                    }
                ],
                onSelect
            },
            '->',
            {
                type  : 'buttonGroup',
                items : [
                    {
                        icon     : 'fa fa-chevron-left',
                        tooltip  : 'Shift previous',
                        onAction : onShiftPrevious
                    },
                    {
                        type     : 'button',
                        text     : 'Today',
                        onAction : onClickToday
                    },
                    {
                        icon     : 'fa fa-chevron-right',
                        tooltip  : 'Shift next',
                        onAction : onShiftNext
                    }
                ]
            },
            '->',
            // Mode toggle — mirrors the vanilla JS buttonGroup with toggleGroup: true.
            // `pressed` sets the initial state; the useEffect above keeps it in sync thereafter.
            {
                type        : 'buttonGroup',
                rendition   : 'padded',
                toggleGroup : true,
                items       : [
                    {
                        icon     : 'fa fa-fw fa-arrows-alt-v',
                        tooltip  : 'Vertical mode',
                        ref      : 'mode-vertical',
                        pressed  : mode === 'vertical',
                        onAction : onSwitchToVertical
                    },
                    {
                        icon     : 'fa fa-fw fa-arrows-alt-h',
                        tooltip  : 'Horizontal mode',
                        ref      : 'mode-horizontal',
                        pressed  : mode === 'horizontal',
                        onAction : onSwitchToHorizontal
                    }
                ]
            },
            {
                icon     : 'fa fa-columns',
                tooltip  : 'Toggle layout',
                ref      : 'toggle-layout', // for testing purpose
                onAction : onToggleLayout
            }
        ]}
    />;

});

SchedulerToolbar.displayName = 'SchedulerToolbar';

export default SchedulerToolbar;
