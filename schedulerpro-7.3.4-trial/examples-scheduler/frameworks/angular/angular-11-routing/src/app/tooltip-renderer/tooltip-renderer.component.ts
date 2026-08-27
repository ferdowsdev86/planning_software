/**
 * Tooltip renderer component
 */
import { Component, Input } from '@angular/core';
import { StringHelper } from '@bryntum/schedulerpro';

@Component({
    selector : 'app-tooltip-renderer',
    template : `
        <div class="custom-tooltip">
            <h3>{{ encodedName }}</h3>
            <h3><label>Resource: </label> <span>{{ encodedResourceName }}</span></h3>
            <article><ng-content></ng-content></article>
        </div>
    `
})
export class TooltipRendererComponent {

    @Input() name: string;
    @Input() resourceName: string;

    get encodedName(): string {
        return StringHelper.encodeHtml(this.name);
    }

    get encodedResourceName(): string {
        return StringHelper.encodeHtml(this.resourceName);
    }
}
