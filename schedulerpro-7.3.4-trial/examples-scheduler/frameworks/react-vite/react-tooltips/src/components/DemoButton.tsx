import React from 'react';

interface DemoButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    text?: string;
    className?: string;
    style?: React.CSSProperties;
}

const DemoButton: React.FC<DemoButtonProps> = ({
    onClick,
    text = 'Demo Button',
    className = 'b-button b-text b-button-outlined',
    style = { width : '8em' }
}) => {
    return (
        <button
            onClick={onClick}
            className={className}
            style={style}
        >
            {text}
        </button>
    );
};

export default DemoButton;
