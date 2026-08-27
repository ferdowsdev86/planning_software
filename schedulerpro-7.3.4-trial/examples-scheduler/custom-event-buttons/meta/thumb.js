/* global scheduler */

setTimeout(() => {
    scheduler.getElementFromEventRecord(scheduler.eventStore.getById(2)).parentElement.classList.add('b-active');
    window.__thumb_ready = true;
}, 300);
