/**
 * Tooltip renderer component
 */
import { Component, Input } from '@angular/core';

@Component({
    selector : 'event-tooltip-renderer',
    template : `
        <div class="custom-tooltip">
        <h4>Check-in:</h4>
        {{ checkin }}
        <h4>Length of stay:</h4>
        {{ duration }} nights
        </div>
    `
})
export class EventTooltipRendererComponent {

    @Input() checkin  : Date;
    @Input() duration : number;

    constructor() {
        this.checkin = new Date();
        this.duration = 0;
    }

}
