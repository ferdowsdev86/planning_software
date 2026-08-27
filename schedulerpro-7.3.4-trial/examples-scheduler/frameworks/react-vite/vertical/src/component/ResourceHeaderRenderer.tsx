import React from 'react';
import { SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';

const ResourceHeaderRenderer = ({ resourceRecord }: { resourceRecord: SchedulerResourceModel }) => {
    return (
        <>
            <img
                src={`users/${resourceRecord.image ? resourceRecord.image : 'none.png'}`}
                alt={StringHelper.encodeHtml(resourceRecord.name)}
                className="b-resource-avatar b-resource-image"
                style={{
                    borderColor : resourceRecord.eventColor
                }}
            />
            <span
                className="b-resource-name"
            >{StringHelper.encodeHtml(resourceRecord.name)}
            </span>
        </>
    );
};

export default ResourceHeaderRenderer;
