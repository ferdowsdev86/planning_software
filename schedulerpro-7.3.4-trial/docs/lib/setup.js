import * as CoreBundle from './product/core.module.js';
import * as ChartBundle from './product/chart.module.js';
import * as GridBundle from './product/grid.module.js';
import * as SchedulerBundle from './product/scheduler.module.js';
import * as SchedulerProBundle from './product/schedulerpro.module.js';

import '../data/docs_schedulerpro.js';
import '../data/navigation.js';

const placeOnWindow = Bundle => {
    for (const clsName in Bundle) {
        window[clsName] = Bundle[clsName];
    }
};

window.product = 'schedulerpro';
window.productName = 'SchedulerPro';
window.bryntum.themeLocation = 'resources';
window.bryntum.editorPath = 'lib/monaco-editor';
window.bryntum.algoliaAppId = 'TXNBK0UT0J';
window.bryntum.algoliaSearchApiKey = '57f52a132dfe1821ccdd36bd4c20dda2';

placeOnWindow(CoreBundle);
placeOnWindow(ChartBundle);
placeOnWindow(GridBundle);
placeOnWindow(SchedulerBundle);
placeOnWindow(SchedulerProBundle);

export * from './product/core.module.js';
export * from './product/chart.module.js';
export * from './product/grid.module.js';
export * from './product/scheduler.module.js';
export * from './product/schedulerpro.module.js';
