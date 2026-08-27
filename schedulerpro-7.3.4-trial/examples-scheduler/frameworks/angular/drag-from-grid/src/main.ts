import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { Toast } from '@bryntum/schedulerpro';
import { AppModule } from './app/app.module';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));


Toast.show({
    html    : `<p>This demo uses the <a href="https://bryntum.com/products/grid/">Bryntum Grid</a> component which is licensed separately.</p>`,
    timeout : 10000
});
