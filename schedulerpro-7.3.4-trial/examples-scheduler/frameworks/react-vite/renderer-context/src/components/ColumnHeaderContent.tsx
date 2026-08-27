import { useContext } from 'react';
import { RenderContext } from '../context/RenderContext';
import { CircularProgressbar } from 'react-circular-progressbar';
import { colors } from '../helpers/Colors';

export type ColumnHeaderContentProps = {
    text   : string
}

const ColumnHeaderContent = ({ text } : ColumnHeaderContentProps) => {
    const
        { showHeaderProgress, percentage, progressColor, colorful } = useContext(RenderContext)!,
        { textColor, progressBarTrailColor, progressBarColor } = colors.colorful,
        primary = colorful ? progressColor  : 'var(--b-neutral-50)';

    return (
        <div style={{ display : 'flex', alignItems : 'center', '--b-primary' : primary } as React.CSSProperties}>
            <div>{text}</div>
            {showHeaderProgress && <div className="progress">
                <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    styles={{
                        path : {
                            stroke : progressBarColor
                        },
                        trail : {
                            stroke       : progressBarTrailColor,
                            mixBlendMode : 'multiply'
                        },
                        text : {
                            fill     : textColor,
                            fontSize : '2em'
                        }
                    }}
                />
            </div>
            }
        </div>
    );
};

export default ColumnHeaderContent;
