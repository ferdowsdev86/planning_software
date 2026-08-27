import React from 'react';

interface DemoSelectedLabelProps {
    selectedEvent: string;
}

const DemoSelectedLabel: React.FC<DemoSelectedLabelProps> = ({ selectedEvent }) => {
    if (!selectedEvent) return null;

    return (
        <label className="selected-event">
            Selected event: <span>{selectedEvent}</span>
        </label>
    );
};

export default DemoSelectedLabel;
