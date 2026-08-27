import { ViewEncapsulation } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Toast } from '@bryntum/schedulerpro';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule, {
    defaultEncapsulation : ViewEncapsulation.None
}).catch(err => console.error(err));


Toast.show({
    html : `<p>This demo uses the <a href='https://bryntum.com/products/grid/'>Bryntum Grid</a> component which is licensed separately.</p>
    `,
    timeout : 10000
});
