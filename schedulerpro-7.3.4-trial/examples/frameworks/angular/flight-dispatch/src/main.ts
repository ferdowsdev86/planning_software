import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { AppErrorHandler } from './app/error.handler';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers : [
        { provide : 'ErrorHandler', useClass : AppErrorHandler }
    ]
}).catch((err: unknown) => console.error(err));
