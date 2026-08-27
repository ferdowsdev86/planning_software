import { useContext } from 'react';
import { type Model, type Row } from '@bryntum/schedulerpro';
import { RenderContext } from '../context/RenderContext';

export type ResourceProps = {
    record : Model
    row : Row
}

const colors = [
    '#c2410c',
    '#7e22ce',
    '#6d28d9',
    '#4338ca',
    '#4d7c0f',
    '#15803d',
    '#b45309',
    '#1d4ed8',
    '#b91c1c',
    '#be185d'
];

// The Resource component
const Resource = ({ record, row }: ResourceProps) => {

    // Get data from context
    const { boldFont, colorful } = useContext(RenderContext)!;

    // Calculate color and fontWeight
    const color      = colorful ? colors[row.index] : 'inherit';
    const fontWeight = boldFont ? 'bold' : 'normal';

    return (
        <div data-resource-id={record.id} style={{ color, fontWeight }}>
            {record.get('name')}
        </div>
    );
};

Resource.displayName = 'Resource';

export default Resource;
