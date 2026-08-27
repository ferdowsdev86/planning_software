/* global shared */

scheduler.features.dependencies.terminalShowDelay = 0;

shared.fireMouseEvent('mouseover', document.querySelector('[data-event-id="e22"]').firstElementChild);
shared.fireMouseEvent('mousedown', document.querySelector('[data-event-id="e22"] [data-side="end"]'));
shared.fireMouseEvent('mousemove', document.querySelector('[data-event-id="4"]'));

shared.fireMouseEvent('mouseover', document.querySelector('[data-event-id="4"]').firstElementChild);
shared.fireMouseEvent('mousemove', document.querySelector('[data-event-id="4"] [data-side="start"]'));

// raise flag for thumb generator indicating page is ready for taking screenshot
window.__thumb_ready = true;
