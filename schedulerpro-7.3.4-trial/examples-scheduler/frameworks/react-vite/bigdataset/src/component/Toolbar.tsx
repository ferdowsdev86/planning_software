import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Button, ButtonConfig, MenuItemConfig, Scheduler, SchedulerFeaturesType, Store } from '@bryntum/schedulerpro';
import { BryntumButton, BryntumButtonGroup, BryntumNumberField, BryntumScheduler, BryntumViewPresetCombo } from '@bryntum/schedulerpro-react';
import { generateResources } from '../lib/Generator';

type AppButtonProps = ButtonConfig & {
    dataConfig?: {
        resources: number
        events: number
    }
}

class AppButton extends Button {
    dataConfig?: {
        resources: number
        events: number
    };
}

interface ToolbarComponentProps {
    schedulerRef: RefObject<BryntumScheduler>
    mode: string
}

const ToolbarComponent = (props: ToolbarComponentProps) => {
    // Reference to the containing Scheduler
    const { mode, schedulerRef } = props;

    // References to the custom fields with resources and event counts
    const resourceCountRef = useRef<BryntumNumberField>(null);
    const eventCountRef    = useRef<BryntumNumberField>(null);

    // Show/Hide custom fields and preset combo flags
    const [showCustom, setShowCustom]           = useState(false);
    const [showPresetCombo, setShowPresetCombo] = useState(false);

    // Items for button group with presets
    const [presetButtons] = useState<AppButtonProps[]>([
        {
            text       : '1K events',
            pressed    : true,
            dataConfig : {
                resources : 200,
                events    : 5
            }
        },
        {
            text       : '5K events',
            dataConfig : {
                resources : 1000,
                events    : 5
            }
        },
        {
            text       : '10K events',
            dataConfig : {
                resources : 1000,
                events    : 10
            }
        },
        {
            text       : 'Custom',
            dataConfig : {
                resources : 0,
                events    : 0
            }
        }
    ]);

    // Items for features menu (to toggle features on/off)
    const [featuresMenu] = useState<MenuItemConfig[]>([
        {
            text     : 'Dependencies',
            checked  : false,
            onToggle : ({ checked }) => {
                toggleFeature(checked, 'dependencies', 'dependencyStore');
            }
        },
        {
            text     : 'Resource ranges',
            checked  : false,
            onToggle : ({ checked }) => {
                toggleFeature(checked, 'resourceTimeRanges', 'resourceTimeRangeStore');
            }
        },
        {
            text     : 'Time ranges',
            checked  : false,
            onToggle : ({ checked }) => {
                toggleFeature(checked, 'timeRanges', 'timeRangeStore');
            }
        },
        {
            text     : 'Non-working time',
            checked  : false,
            onToggle : ({ checked }) => {
                toggleFeature(checked, 'nonWorkingTime', null);
            }
        },
        {
            text     : 'Event non-working time',
            checked  : false,
            onToggle : ({ checked }) => {
                toggleFeature(checked, 'eventNonWorkingTime', null);
            }
        }
    ]);

    // Toggle feature handler
    const toggleFeature = useCallback(async(checked: boolean, feature: keyof SchedulerFeaturesType, store: keyof Scheduler | null) => {
        const scheduler = schedulerRef.current!.instance;

        scheduler.features[feature].disabled = !checked;

        if (store) {
            if (checked && !(scheduler[store] as Store).count) {
                const resources = resourceCountRef.current!.instance!.value;
                const events    = eventCountRef.current!.instance!.value;
                await generateResources(resources, events, scheduler);
            }
        }
    }, [schedulerRef]);

    // Handler for button group with preset counts (1K, 5K, 10K)
    const applyPreset = useCallback(
        ({ source : button }: { source: AppButton }) => {
            const { resources, events } = button.dataConfig!;
            setShowCustom(!resources);
            if (resources) {
                generateResources(resources, events, schedulerRef.current!.instance);

                // Set the values of custom fields so that they are updated when they become visible
                resourceCountRef.current!.instance.value = resources;
                eventCountRef.current!.instance.value    = events;
            }
        },
        [schedulerRef]
    );

    // Handler for change in custom count fields
    const customChangeHandler = useCallback(
        ({ userAction }: {
            userAction: boolean
        }) => {
            if (userAction) {
                const { value : resources } = resourceCountRef.current!.instance;
                const { value : events }    = eventCountRef.current!.instance;

                generateResources(resources, events, schedulerRef.current!.instance);
            }
        },
        [schedulerRef]
    );

    // Toggle Orientation click handler. Reloads the app
    const onToggleOrientation = useCallback(() => {
        const query = new URLSearchParams();
        if (mode !== 'vertical') {
            query.set('mode', 'vertical');
        }
        else {
            query.delete('mode');
        }
        // We need to reload to re-create the App and Scheduler
        window.location.search = query.toString();
    }, [mode]);

    // Runs when schedulerRef changes
    useEffect(() => {
        // BryntumViewPresetCombo need an existing scheduler therefore
        // we delay its show until we have the scheduler instance
        setShowPresetCombo(Boolean(schedulerRef.current?.instance));
    }, [schedulerRef]);

    return (
        <div className="demo-toolbar align-right" style={{ height : '52px' }}>
            <div style={{ display : 'flex' }}>
                <BryntumButtonGroup
                    toggleGroup={true}
                    onClick={applyPreset}
                    items={presetButtons}
                />
                <div style={{ width : '10px' }}/>
                <BryntumButton
                    text="Toggle orientation"
                    cls="b-skip-test"
                    onAction={onToggleOrientation}
                />
            </div>
            <div className="spacer"></div>
            <BryntumNumberField
                ref={resourceCountRef}
                placeholder="Number of resources"
                label="Resources"
                tooltip="Enter number of resource rows to generate and press [ENTER]"
                min={1}
                max={10000}
                width="auto"
                height={42}
                inputWidth="5em"
                keyStrokeChangeDelay={500}
                changeOnSpin={500}
                value={200}
                hidden={!showCustom}
                onChange={customChangeHandler}
            />
            <BryntumNumberField
                ref={eventCountRef}
                placeholder="Number of events"
                label="Events"
                tooltip="Enter number of events per resource to generate and press [ENTER]"
                min={1}
                max={100}
                width="auto"
                height={42}
                inputWidth="5em"
                keyStrokeChangeDelay={500}
                changeOnSpin={500}
                value={5}
                hidden={!showCustom}
                onChange={customChangeHandler}
            />
            <BryntumButton
                text="Features"
                height={42}
                menu={featuresMenu}
                hidden={!showCustom}
            />
            {showPresetCombo && <BryntumViewPresetCombo height={42}/>}
        </div>
    );
};

export default ToolbarComponent;
