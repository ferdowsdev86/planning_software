<template>
    <div class="vue-event-content">
        <div class="header">
            <div class="progress-outer">
                <div
                    class="progress-fill"
                    :style="{ width: `${eventRecord.progress ?? 0}%` }"
                />
            </div>
            <div class="fa fa-ellipsis" />
        </div>
        <div class="footer">
            <div
                v-if="eventRecord.type === 'meeting'"
                class="fa fa-people-group b-blue-icon"
            />
            <span>{{ StringHelper.encodeHtml(eventRecord.name) }}</span>
            <div
                class="avatars"
                v-html="getAvatars(eventRecord.resources)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { AvatarRendering, DomHelper, type SchedulerResourceModel, StringHelper } from '@bryntum/schedulerpro';
import { CustomEventModel } from '../lib/CustomEvent';

const avatarRenderer = new AvatarRendering({ size : '2em' });

const getAvatars = (resources: SchedulerResourceModel[]) : string => {
    let
        element = DomHelper.createElement({
            tag      : 'div',
            children : avatarRenderer.getResourceAvatar(resources)
        }) as HTMLDivElement | null;
    const html = element!.innerHTML;

    element = null;
    return html;
};

defineProps({
    eventRecord : {
        type    : CustomEventModel,
        default : null
    }
});

</script>
