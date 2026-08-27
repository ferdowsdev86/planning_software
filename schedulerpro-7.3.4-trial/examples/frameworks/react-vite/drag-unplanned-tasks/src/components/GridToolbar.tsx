import { RefObject, useCallback, useEffect, useState } from 'react';
import { BryntumGrid, BryntumToolbar } from '@bryntum/schedulerpro-react';
import { Grid } from '@bryntum/schedulerpro';

type GridToolbarProps = {
    gridRef?: RefObject<BryntumGrid>
}

const GridToolbar = (props: GridToolbarProps) => {
    const { gridRef } = props;

    const [grid, setGrid] = useState<Grid>();

    useEffect(() => {
        setGrid(gridRef!.current!.instance);
    }, [gridRef]);

    const onExpandAll = useCallback(() => {
        grid!.expandAll();
    }, [grid]);

    const onCollapseAll = useCallback(() => {
        grid!.collapseAll();
    }, [grid]);

    return <BryntumToolbar
        items={[
            {
                type : 'widget',
                tag  : 'strong',
                html : 'Unplanned appointments',
                flex : 1
            },
            {
                type    : 'button',
                icon    : 'fa fa-angle-double-down',
                ref     : 'expand-all', // for testing purpose
                cls     : 'b-transparent',
                tooltip : 'Expand all groups',
                onClick : onExpandAll
            },
            {
                type    : 'button',
                icon    : 'fa fa-angle-double-up',
                ref     : 'collapse-all', // for testing purpose
                cls     : 'b-transparent',
                tooltip : 'Collapse all groups',
                onClick : onCollapseAll
            }
        ]}
    />;
};

export default GridToolbar;
