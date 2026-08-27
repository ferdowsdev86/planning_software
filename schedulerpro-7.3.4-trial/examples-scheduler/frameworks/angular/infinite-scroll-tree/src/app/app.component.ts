import { Component, ViewEncapsulation } from '@angular/core';
import { schedulerProps } from './app.config';

@Component({
    standalone    : false,
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class AppComponent {
    schedulerProps = schedulerProps;
}
