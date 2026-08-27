/**
 * Tooltip renderer component
 */
import { Component, Input } from '@angular/core';

@Component({
    selector : 'event-tooltip-renderer',
    template : `
        <p>{{ destination }}</p> <i class="fa fa-user"></i><sup>{{ guests }}</sup>
    `
})
export class EventRendererComponent {

    @Input() destination : string;
    @Input() guests : string;

    constructor() {
        this.destination = '';
        this.guests = '';
    }

}
