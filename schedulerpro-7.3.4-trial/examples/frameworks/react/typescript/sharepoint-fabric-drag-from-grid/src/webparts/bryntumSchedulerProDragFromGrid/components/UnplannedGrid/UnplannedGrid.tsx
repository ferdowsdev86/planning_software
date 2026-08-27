import React, { MutableRefObject, useEffect } from 'react';
import { unplannedGridProps } from '../Scheduler/SchedulerProConfig';
import { BryntumGrid } from '@bryntum/grid-react-thin';
import { BryntumSchedulerPro } from '@bryntum/schedulerpro-react-thin';
import Drag from '../Drag/Drag';

interface Props {
    gridRef: MutableRefObject<BryntumGrid>
    schedulerProRef: MutableRefObject<BryntumSchedulerPro>
}

export const UnplannedGrid = (props: Props) => {
    const { gridRef, schedulerProRef } = props;

    useEffect(() => {
        const
            grid      = gridRef.current?.instance,
            schedulerPro = schedulerProRef.current?.instance;

        if (grid && schedulerPro) {
            grid.store = schedulerPro.eventStore.chain(event => event.resources.length === 0);
        }

        const drag = new Drag({
            grid         : props.gridRef.current?.instance,
            schedule     : props.schedulerProRef.current?.instance,
            constrain    : false,
            outerElement : props.gridRef.current?.instance?.element
        });

        return () => {
            drag.destroy();
        };
    }, []);

    return (
        <BryntumGrid
            ref={gridRef}
            {...unplannedGridProps}
        />
    );
};
