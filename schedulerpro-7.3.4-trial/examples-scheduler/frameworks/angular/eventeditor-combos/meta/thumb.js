const scheduler = bryntum.query('schedulerpro');
scheduler.editEvent(scheduler.eventStore.getById(5));
// raise flag for thumb generator indicating page is ready for taking screenshot
window.__thumb_ready = true;
