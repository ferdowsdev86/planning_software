import { forwardRef, RefObject, useEffect, useMemo, useState } from 'react';
import { SchedulerPro } from '@bryntum/schedulerpro';
import { BryntumSchedulerPro, BryntumToolbar } from '@bryntum/schedulerpro-react';

type SchedulerToolbarProps = {
    schedulerRef: RefObject<BryntumSchedulerPro>
}

const SchedulerToolbar = forwardRef<BryntumToolbar, SchedulerToolbarProps>((props, schedulerToolbarRef) => {
    const { schedulerRef } = props;

    // Save scheduler instance for easy access
    const [scheduler, setScheduler] = useState<SchedulerPro>();

    useEffect(() => setScheduler(schedulerRef.current!.instance), [schedulerRef]);

    const [config] = useMemo(() => ([
        {
            items : [
                {
                    type     : 'button',
                    ref      : 'zoomInButton',
                    icon     : 'b-icon-search-plus',
                    text     : 'Zoom in',
                    onAction : () => scheduler!.zoomIn()
                },
                {
                    type     : 'button',
                    ref      : 'zoomOutButton',
                    icon     : 'b-icon b-icon-search-minus',
                    text     : 'Zoom out',
                    onAction : () => scheduler!.zoomOut()
                }
            ]
        }
    ]), [scheduler]);

    return (
        <BryntumToolbar
            {...config}
            ref={schedulerToolbarRef}
        />
    );
});

SchedulerToolbar.displayName = 'SchedulerToolbar';

export default SchedulerToolbar;
