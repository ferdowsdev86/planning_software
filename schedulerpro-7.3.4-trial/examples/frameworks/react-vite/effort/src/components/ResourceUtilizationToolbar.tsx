import { RefObject, useEffect, useMemo, useState } from 'react';
import { BryntumResourceUtilization, BryntumToolbar, BryntumToolbarProps } from '@bryntum/schedulerpro-react';
import { ResourceUtilization } from '@bryntum/schedulerpro';

const ResourceUtilizationToolbar = ({ resourceUtilizationRef }: { resourceUtilizationRef: RefObject<BryntumResourceUtilization> }) => {
    // Save scheduler instance for easy access
    const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization>();

    useEffect(() => setResourceUtilization(resourceUtilizationRef.current!.instance), [resourceUtilizationRef]);

    const config = useMemo<BryntumToolbarProps>(() => ({
        items : [
            {
                type     : 'slidetoggle',
                ref      : 'showBarTip',
                text     : 'Enable bar tooltip',
                tooltip  : 'Check to show tooltips when moving mouse over bars',
                checked  : true,
                onAction : ({ source }) => {
                    if (resourceUtilization) {
                        resourceUtilization.showBarTip = source.checked;
                    }
                }
            }
        ]
    }), [resourceUtilization]);

    return (
        <BryntumToolbar
            {...config}
        />
    );

};

export default ResourceUtilizationToolbar;
