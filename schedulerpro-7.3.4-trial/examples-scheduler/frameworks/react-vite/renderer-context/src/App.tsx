import { useContext } from 'react';
import { BryntumButton, BryntumCombo, BryntumDemoHeader, BryntumNumberField, BryntumScheduler } from '@bryntum/schedulerpro-react';
import { RenderContext } from './context/RenderContext';
import { schedulerProps } from './AppConfig';
import { progressColorComboOptions } from './helpers/Colors';

import './App.scss';

function App() {

    // Destructure values and setters from context
    const {
        setBoldFont,
        setColorful,
        setShowHeaderProgress,
        setPercentage,
        setProgressColor,
        boldFont,
        colorful,
        showHeaderProgress,
        percentage,
        progressColor
    } = useContext(RenderContext)!;

    return (
        <>
            {/* BryntumDemoHeader component is used for Bryntum example styling only and can be removed */}
            <BryntumDemoHeader />
            <div className="demo-app">
                <div className="demo-toolbar">
                    <BryntumButton
                        onAction={({ source }) => setBoldFont(source.pressed)}
                        text="Bold Font"
                        pressed={boldFont}
                        toggleable={true}
                    />
                    <BryntumButton
                        onAction={({ source }) => setColorful(source.pressed)}
                        text="Colorful"
                        pressed={colorful}
                        toggleable={true}
                    />
                    <BryntumButton
                        onAction={({ source }) => setShowHeaderProgress(source.pressed)}
                        text="Header Progress Bar"
                        pressed={showHeaderProgress}
                        toggleable={true}
                    />
                    {showHeaderProgress && (
                        <>
                            <BryntumNumberField
                                label='Percentage'
                                max={100}
                                min={0}
                                width={'auto'}
                                height={38}
                                inputWidth={'5em'}
                                value={percentage}
                                onAction={({ source }) => setPercentage(source.value)}
                            />
                            <BryntumCombo
                                label='Select color'
                                height={38}
                                width={'auto'}
                                value={progressColor}
                                onAction={({ source }) => setProgressColor(source.value as string)}
                                items={progressColorComboOptions}
                            />
                        </>
                    )}
                </div>
                <BryntumScheduler {
                    ...schedulerProps
                } />
            </div>
        </>
    );
}

export default App;
