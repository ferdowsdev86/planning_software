import { type ReactNode, createContext, useState } from 'react';

// Options used by React renderers
type RenderOptions = {
    boldFont             : boolean
    colorful             : boolean
    showHeaderProgress   : boolean
    percentage           : number
    progressColor        : string
}

// Merge options with setters
type RenderContextProviderValue = RenderOptions & {
    setBoldFont             : (boldFont : boolean) => void
    setColorful             : (colorful : boolean) => void
    setShowHeaderProgress   : (showHeaderProgress : boolean) => void
    setPercentage           : (percentage : number) => void
    setProgressColor        : (progressColor : string) => void
}

// Provider props type
type RenderContextProviderProps = {
    children : ReactNode
}

const initialState: RenderOptions = {
    boldFont           : false,
    colorful           : true,
    showHeaderProgress : false,
    percentage         : 60,
    progressColor      : '#5a4fcf'
};

export const RenderContext = createContext<RenderContextProviderValue | null>(null);

// The Provider component
export const RenderContextProvider = ({ children }: RenderContextProviderProps) => {

    const
        [boldFont, setBoldFont]                     = useState(initialState.boldFont),
        [colorful, setColorful]                     = useState(initialState.colorful),
        [showHeaderProgress, setShowHeaderProgress] = useState(initialState.showHeaderProgress),
        [percentage, setPercentage]                 = useState(initialState.percentage),
        [progressColor, setProgressColor]           = useState(initialState.progressColor);

    const context : RenderContextProviderValue = {
        boldFont,
        colorful,
        showHeaderProgress,
        percentage,
        progressColor,
        setBoldFont,
        setColorful,
        setShowHeaderProgress,
        setPercentage,
        setProgressColor
    };

    return (
        <RenderContext.Provider value={context}>
            {children}
        </RenderContext.Provider>
    );
};
