import React from 'react';
import { Toast } from '@bryntum/schedulerpro';

const DemoWidget : React.FC = () => {
    const title = 'Click me and watch the Toast';

    const handleClick = (): void => {
        Toast.show('You have clicked react demo widget');
    };

    return (
        <div
            className="react-widget"
            title={title}
            style={{
                cursor : 'pointer'
            }}
            onClick={handleClick}
        >
            React demo widget (Click me!)
        </div>
    );
};

export default DemoWidget;
