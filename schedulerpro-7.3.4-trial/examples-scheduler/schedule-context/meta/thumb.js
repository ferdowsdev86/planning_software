globalThis.shared.fireMouseEvent('mouseover', document.querySelector('.b-grid-row[aria-rowindex="5"] .b-sch-time-axis-cell'));

// raise flag for thumb generator indicating page is ready for taking screenshot
setTimeout(() => window.__thumb_ready = true, 100);
