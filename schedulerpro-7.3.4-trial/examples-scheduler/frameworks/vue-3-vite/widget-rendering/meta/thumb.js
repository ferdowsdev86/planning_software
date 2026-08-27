/* global DomHelper */

const init = () => {
    const eventEl = document.querySelector('div[data-resource-id="r2"] .b-sch-event-content');
    if (eventEl) {
        DomHelper.triggerMouseEvent(eventEl, 'click');
        window.__thumb_ready = true;
    }
    else {
        setTimeout(init, 500);
    }
};

init();
