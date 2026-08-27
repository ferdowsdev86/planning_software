interface ProgressBarProps {
    backgroundColor : string
    completed : number
}

const ProgressBar = (props : ProgressBarProps) => {
    const { completed } = props;

    const containerStyles = {
        height          : 10,
        width           : '100%',
        backgroundColor : 'var(--b-neutral-90)',
        borderRadius    : 50
    };

    const fillerStyles = {
        height          : '100%',
        width           : `${completed}%`,
        backgroundColor : 'var(--b-resource-event-color)',
        borderRadius    : 'inherit',
        textAlign       : 'right' as const,
        minWidth        : '1.5em'
    };

    const labelStyles = {
        width      : '100%',
        textAlign  : 'center' as const,
        paddingTop : 2,
        color      : '#606263'
    };

    return (
        <div className='react-progress-bar'>
            <div style={containerStyles}>
                <div style={fillerStyles}></div>
            </div>
            <div style={labelStyles}>{`${completed}%`}</div>
        </div>
    );
};

export default ProgressBar;
