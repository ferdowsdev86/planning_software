import React, { MutableRefObject, useEffect } from 'react';
import { unplannedGridProps } from '../Scheduler/schedulerConfig';
import { BryntumGrid } from '@bryntum/grid-react-thin';
import { BryntumScheduler } from '@bryntum/schedulerpro-react-thin';
import Drag from '../Drag/Drag';

interface Props {
    gridRef: MutableRefObject<BryntumGrid>
    schedulerRef: MutableRefObject<BryntumScheduler>
}

export const UnplannedGrid = (props: Props) => {
    const { gridRef, schedulerRef } = props;

    useEffect(() => {
        const
            grid      = gridRef.current?.instance,
            scheduler = schedulerRef.current?.instance;

        if (grid && scheduler) {
            grid.store = scheduler.eventStore.chain(event => event.resources.length === 0);
        }

        const drag = new Drag({
            grid         : props.gridRef.current?.instance,
            schedule     : props.schedulerRef.current?.instance,
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
