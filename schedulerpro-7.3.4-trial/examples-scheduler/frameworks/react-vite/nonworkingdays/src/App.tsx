import { useRef, useState } from 'react';
import { Button, ButtonGroup, DateHelper, Locale, LocaleKeys, LocaleManager } from '@bryntum/schedulerpro';
import { BryntumDemoHeader, BryntumScheduler, BryntumToolbar } from '@bryntum/schedulerpro-react';
import { useSchedulerProps } from './AppConfig';

import './App.scss';

type DayButton = Button & { index: number };

// The App component
function App() {
    const schedulerRef = useRef<BryntumScheduler>(null);
    const toolbarRef = useRef<BryntumToolbar>(null);

    const [customStyling, setCustomStyling] = useState(true);

    function toggleDisplayRanges({ checked } : { checked: boolean }) {
        const scheduler = schedulerRef.current!.instance;
        scheduler.features.nonWorkingTime.disabled = !checked;
    }

    function toggleShadeBars({ checked } : { checked: boolean }) {
        const scheduler = schedulerRef.current!.instance;
        scheduler.features.eventNonWorkingTime.disabled = !checked;
    }

    function onClickNonWorkingDays() {
        const toolbar = toolbarRef.current!.instance;

        //Collect an array of pressed button indices
        const pressed = (((toolbar.widgetMap.nonWorkingDays as unknown) as ButtonGroup).items as DayButton[])
            .filter(item => item.pressed)
            .map(item => item.index);

        const days: Record<number, boolean> = {};
        pressed.forEach((day) => {
            days[day] = true;
        });

        const locale = LocaleManager.locale as Locale;
        (locale.DateHelper as LocaleKeys).nonWorkingDays = days;

        LocaleManager.applyLocale(locale, true);
    }

    function handleToolbarToggle() {
        const tbar = toolbarRef.current!.instance;
        if (!tbar.element.style.height) {
            // Set initial height + flush for transition to work
            tbar.element.style.height = tbar.element.offsetHeight + 'px';
            tbar.element.offsetHeight;
        }

        tbar.element.classList.toggle('b-collapsed');
    }

    const schedulerProps = useSchedulerProps(handleToolbarToggle);

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <BryntumToolbar
                    ref={toolbarRef}
                    cls="b-top-toolbar"
                    items={[
                        {
                            type     : 'slidetoggle',
                            checked  : !customStyling,
                            text     : 'Custom styling',
                            onChange : () => setCustomStyling(!customStyling)
                        },
                        {
                            type     : 'slidetoggle',
                            checked  : true,
                            text     : 'Display ranges',
                            onChange : toggleDisplayRanges
                        },
                        {
                            type     : 'slidetoggle',
                            checked  : false,
                            text     : 'Shade bars',
                            onChange : toggleShadeBars
                        },
                        '->', // Fill to the right
                        {
                            type : 'widget',
                            cls  : 'b-has-label',
                            html : '<label>Non-working days</label>'
                        },
                        {
                            type     : 'buttongroup',
                            ref      : 'nonWorkingDays',
                            defaults : {
                                toggleable : true
                            },
                            items : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, index) => {
                                return {
                                    text    : name,
                                    pressed : DateHelper.nonWorkingDays[index],
                                    index
                                };
                            }),
                            onClick : onClickNonWorkingDays
                        }
                    ]}
                />
                <BryntumScheduler
                    ref={schedulerRef}
                    cls={customStyling ? 'custom-style' : ''}
                    {...schedulerProps}
                />
            </div>
        </>
    );
}

export default App;
