/**
 * App component script
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { schedulerProps } from './app.config';

@Component({
    selector      : 'app-root',
    templateUrl   : './app.component.html',
    styleUrls     : ['./app.component.scss'],
    encapsulation : ViewEncapsulation.None
})

export class AppComponent  {
    public schedulerProps = schedulerProps;
}
