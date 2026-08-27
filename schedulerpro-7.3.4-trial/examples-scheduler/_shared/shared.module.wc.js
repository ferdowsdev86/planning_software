import '../_shared/product.module.js';
import { LocaleHelper, Localizable, Base, GlobalEvents, AjaxHelper, AsyncHelper, BrowserHelper, DomHelper, ResizeHelper, VersionHelper, StringHelper, DataGenerator, Rectangle, Events, Toolbar, DemoCodeEditor, Toast, Tooltip, Panel, Widget, HintFlow, Button } from '../../build/schedulerpro.wc.module.js';
/* global RC */
// Load product config

// Load localization

// import ResizeHelper from '../../lib/Core/helper/ResizeHelper.js';
// import Panel from '../../lib/Core/widget/Panel.js';



const
    realBaseConstruct = Base.prototype.construct,
    baseConstruct     = instance => {
        if (instance.$$name && !instance.ignoreLearn) {
            bryntum.usedClasses = bryntum.usedClasses || {};
            const meta = bryntum.usedClasses[instance.$$name] = bryntum.usedClasses[instance.$$name] || {
                name  : instance.$$name,
                count : 0
            };
            meta.count++;
            if (instance.isColumn) {
                meta.type = 'Column';
            }
            else if (instance.isWidget) {
                meta.type = 'Widget';
            }
            else if (instance.isInstancePlugin) {
                meta.type = 'Feature';
            }
        }
    },
    demoName          = location.href,
    lessonsCompleted  = JSON.parse(BrowserHelper.getLocalStorageItem('b-example-lessonsCompleted')) || {};

Base.prototype.construct = function(config) {
    if (this.isMonthView) {
        if (!config.eventHeight && !config.responsiveEventHeight) {
            config.responsiveEventHeight = {
                threshold : 3,
                minHeight : 14
            };
        }
        if (window.innerHeight <= 768 && !config.eventHeight) {
            config.eventHeight = 19;
        }
    }

    // Allow forcing vertical mode for easy dual-mode testing of scheduler demos via a `?vertical` query param.
    // Guarded by `isSchedulerBase` so it only affects Scheduler / Scheduler Pro (not Grid or Gantt).
    if (config && this.isSchedulerBase && BrowserHelper.queryString.vertical != null) {
        config.mode = 'vertical';
    }

    const result = realBaseConstruct.call(this, ...arguments);

    if (!this.isModel) {
        baseConstruct(this);
    }

    return result;
};

let
    earlyErrorEvent,
    autoApply    = BrowserHelper.getLocalStorageItem('b-example-autoApply') !== 'false',
    playHintFlow = globalThis.matchMedia('(min-width: 900px)').matches && globalThis.matchMedia('(min-height: 700px)').matches && !lessonsCompleted[demoName];

const
    // Only run hintflow when at least 900x700
    errorListener           = errorEvent => earlyErrorEvent = errorEvent,
    // Disable RootCause for these location matches
    disableRootCause        = [
        'bigdataset',
        'code',
        'csp',
        'norootcause',
        'screenshot'
    ],
    // Disable RootCause actions recording for these location matches
    disableRootCauseActions = [
        'gantt-schedulerpro',
        'resourcehistogram',
        'drag-between-schedulers'
    ],
    locationRe              = arr => new RegExp(`[/?&](${arr.join('|')})`),
    shouldShow              = (item, filterValue) => !item.isMenuItem || item.cls?.['b-docs-category'] || item.text.toLowerCase().includes(filterValue);

window.addEventListener('error', errorListener);

if (location.protocol === 'file:') {
    alert('ERROR: You must run examples on a webserver (not using the file: protocol)');
}

// needed for tests
window.__BRYNTUM_EXAMPLE = true;

// All toasts should be living in the document body floatroot
Toast.initClass().$meta.config.rootElement = document.body;

const
    bryntumUrl       = 'https://bryntum.com',
    hintKey          = 'preventhints-' + document.location.href,
    defaultTheme     = globalThis.matchMedia?.('(prefers-contrast: more)')?.matches ? 'high-contrast-light' : 'svalbard-light',
    { queryString }  = BrowserHelper,
    isTestEnv        = window.__applyTestConfigs = VersionHelper.isTestEnv,
    testMode         = queryString.test != null,
    maxVideoDuration = 1000 * 60 * 5,
    // In our source structure on bryntum.com...
    browserPaths     = [
        '/examples/',
        '/grid/',
        '/scheduler/',
        '/schedulerpro/',
        '/gantt/',
        '/calendar/',
        '/taskboard/'
    ],
    themes           = {
        'material3-light'     : 'Material 3 Light',
        'material3-dark'      : 'Material 3 Dark',
        'stockholm-light'     : 'Stockholm Light',
        'stockholm-dark'      : 'Stockholm Dark',
        'svalbard-light'      : 'Svalbard Light',
        'svalbard-dark'       : 'Svalbard Dark',
        'visby-light'         : 'Visby Light',
        'visby-dark'          : 'Visby Dark',
        'fluent2-light'       : 'Fluent 2 Light',
        'fluent2-dark'        : 'Fluent 2 Dark',
        'high-contrast-light' : 'High Contrast Light',
        'high-contrast-dark'  : 'High Contrast Dark'
    },
    pathName         = location.pathname,
    isDemoBrowser    = browserPaths.some(path => pathName.endsWith(path) || Boolean(pathName.match(path + 'index.*html$'))),
    isBryntumCom     = BrowserHelper.isBryntumOnline(['online']),
    isUmd            = pathName.endsWith('umd.html'),
    // No code editor when we are on a small screen
    noEditor         = queryString.noEditor != null || window.matchMedia('(max-width: 700px)').matches || document.location.href.includes('csp');

if (!playHintFlow) {
    document.body.classList.add('b-no-hint-flow');
}

// Shared tooltip will show overflowed text content when an overflowing element which has
// text-overflow : ellipsis is hovered. Only in our examples index pages though, not in examples.
Tooltip.showOverflow = isDemoBrowser;

// Prevent google translate messing up the DOM in our examples, https://github.com/facebook/react/issues/11538
document.body.classList.add('notranslate');

class Shared extends Localizable(Events()) {

    // Polyfill for RootCause's `applyIf`, which is sometimes referenced but not exported by the
    // RootCause runtime. Copies own enumerable, non-undefined properties from each `source` into
    // `dest` only when `dest` does not already own that key.
    //
    // NOTE: when updating this function, keep `resources/templates/examples/rootcause.ejs.js#startRootCause` in sync.
    //
    // https://github.com/bryntum/support/issues/13186
    static applyIf = (dest = {}, ...sources) => {
        for (const source of sources) {
            if (!source) {
                continue;
            }

            for (const [key, value] of Object.entries(source)) {
                if (!Object.prototype.hasOwnProperty.call(dest, key) && value !== undefined) {
                    dest[key] = value;
                }
            }
        }

        return dest;
    };

    //region Init

    constructor() {
        super();

        // Delay setup until all CSS has loaded, when viewing demos using sources
        if (DomHelper.themeLoaded) {
            GlobalEvents.once('cssLoad', () => this.setup());
        }
        else {
            const themeLink = document.head.querySelector('link[data-bryntum-theme]');
            // If theme is already loaded, or we for some reason have no theme link, just run setup
            if (themeLink?.sheet || !themeLink) {
                this.setup();
            }
            // Otherwise wait for theme to load
            else {
                themeLink.addEventListener('load', () => this.setup());
            }
        }
    }

    setup() {
        this.initRootCause();

        const
            me       = this,
            reset    = 'reset' in queryString,
            { body } = document,
            autoEdit = 'code' in queryString;

        me.product = window.bryntum.product;
        // Core is available for all full and thin products
        me.product.version = VersionHelper.getVersion('core');

        // Allow running with ?rtl query param
        if (queryString.rtl != null) {
            body.style.direction = 'rtl';
        }

        me.rtl = getComputedStyle(body).direction === 'rtl';

        if (reset) {
            BrowserHelper.removeLocalStorageItem('b-example-language');
            BrowserHelper.removeLocalStorageItem('b-example-new-theme');
            BrowserHelper.removeLocalStorageItem('b-example-autoApply');
            BrowserHelper.removeLocalStorageItem('b-example-primaryColor');
        }

        me.onDocumentMouseDown = me.onDocumentMouseDown.bind(me);
        me.developmentMode = queryString.develop != null;
        me.preload = queryString.preload != null;
        me.preloadMs = me.preload ? parseInt(queryString.preload) : 5000;
        me.testMode = testMode;

        // Auto show code editor if ?code=1 in URL
        if (autoEdit) {
            me.showCodeEditor();
        }
        // Load the code editor in the background if we are running an actual example
        // and we're not running a test.
        // We don't expect a user to get across to the code button before 5 seconds has elapsed.
        else if (!noEditor && !isDemoBrowser && !testMode || me.preload) {
            setTimeout(() => {
                me.createEditor();
            }, me.preloadMs);
        }

        const primaryColor = BrowserHelper.getLocalStorageItem('b-example-primaryColor');
        if (primaryColor) {
            document.documentElement.style.setProperty('--b-primary', primaryColor);
        }

        body.classList.add(StringHelper.cls`b-theme-${DomHelper.themeInfo.filename}`);

        // Enables special styling when generating screenshots
        if ('screenshot' in queryString) {
            body.classList.add('b-screenshot');
            window.bryntum.noAnimations = true;
        }

        if ('hideheader' in queryString) {
            body.classList.add('b-hide-header');
        }

        // Used by BannerMaker to hide demo toolbar
        if ('hide-toolbar' in queryString) {
            body.classList.add('b-hide-toolbar');
        }

        // Subscribe on locale update to save it into the localStorage
        me.localeManager.on('locale', localeConfig => {
            BrowserHelper.setLocalStorageItem('b-example-language', localeConfig.localeName);

            // Don't reload page for tests unless `reloadRtl` flag is set
            if (!VersionHelper.isTestEnv || window.bryntum.reloadRtl) {
                // If we switch to a locale with an opposite writing direction
                // we have to reload the page to apply the new direction
                if (localeConfig.localeRtl !== me.rtl) {
                    const searchParams = new URLSearchParams(window.location.search);
                    localeConfig.localeRtl ? searchParams.append('rtl', '') : searchParams.delete('rtl');
                    const newSearch = searchParams.size ? searchParams.toString().replace('rtl=', 'rtl') : '';
                    window.location.search = newSearch;
                }
            }
        });

        // Apply default locale first time when the page is loading
        if (!testMode) {
            me.localeManager.applyLocale(BrowserHelper.getLocalStorageItem('b-example-language') || LocaleHelper.localeName, false, true);
        }

        const overrideRowCount = queryString.rowCount;

        if (overrideRowCount) {
            const
                parts = overrideRowCount.split(',');

            if (parts.length === 1) {
                DataGenerator.overrideRowCount = parseInt(parts[0]);
            }
            else {
                DataGenerator.overrideRowCount = parts.map(p => parseInt(p));
            }
        }

        const container = me.container = document.getElementById('container');

        // Ensure user is not experimenting with HTML contents
        if (container) {
            me.insertHeader();
        }

        function whenReady() {
            // Don't load hints for the example browser (or if viewing with ?develop or in tests)
            if (!isDemoBrowser && !('screenshot' in queryString) && !me.developmentMode && !testMode) {
                me.loadHints();
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', whenReady);
        }
        else {
            whenReady();
        }

        if (!isBryntumCom && !VersionHelper.isTestEnv && !me.developmentMode) {
            me.performVersionCheck();
        }

        if (!isDemoBrowser) {
            me.injectFavIcon();
        }

        me.loadAppConfig();

        if (!location.href.match('examples')) {
            console.warn(
                'Bryntum demo code used outside of the examples directory, the %cshared.js%c module is only intended for demos. Please remove the import to ensure that it does not affect your app',
                'font-family: monospace; font-weight: bold',
                'font-family: inherit; font-weight: normal'
            );
        }

        if (isBryntumCom && !VersionHelper.isTestEnv) {
            console.log(
                `%cDebugging Tips%c
You can access the widget used in the demo on the console using %cwindow.${me.product.ref || me.product.name}%c.
You can access any widget using %cbryntum.get(widgetId)%c or %cbryntum.query('widgettype')%c or %cbryntum.fromElement(el)%c.
You can access the API documentation at ${bryntumUrl}/products/${me.product.name}/docs`,
                'font-family: system-ui; font-size: 1.3em; font-weight: bold; line-height: 2; background-repeat: no-repeat; background-position: left center; padding-inline-start: 2.1em; background-image: url("data:image/svg+xml;utf8,<svg width=\'20\' height=\'20\' viewBox=\'0 0 354.9 144.52\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'white\' d=\'m305.63 144.52c-12.47 0-23.53-4.83-31.58-13.28v11.06h-25.54v-142.3h26.75v48.58c7.84-7.64 18.5-12.07 30.37-12.07 27.15 0 49.28 23.33 49.28 54.1s-22.12 53.9-49.28 53.9zm-3.82-83.47c-14.68 0-26.55 13.27-26.55 29.77s11.87 29.16 26.55 29.16 26.55-12.67 26.55-29.16-11.87-29.77-26.55-29.77z\'/><path fill=\'white\' d=\'m148.02 0h74.01v29.78h-74.01z\'/><path fill=\'white\' d=\'m0 56.26h222.03v29.78h-222.03z\'/><path fill=\'white\' d=\'m74.01 112.52h148.02v29.6h-148.02z\'/></svg>"), url("data:image/svg+xml;utf8,<svg width=\'23\' height=\'23\' xmlns=\'http://www.w3.org/2000/svg\'><rect fill=\'%230076f8\' rx=\'5\' ry=\'5\' x=\'0\' y=\'0\' width=\'100%\' height=\'100%\'></rect></svg>");', 'font-family: system-ui',
                'line-height: 2; font-family: courier; color: light-dark(orangered, orange)', 'font-family: system-ui',
                'line-height: 2; font-family: courier; color: light-dark(orangered, orange)', 'font-family: system-ui',
                'line-height: 2; font-family: courier; color: light-dark(orangered, orange)', 'font-family: system-ui',
                'line-height: 2; font-family: courier; color: light-dark(orangered, orange)', 'font-family: system-ui; line-height: 2;'
            );
        }
    }

    async loadAppConfig() {
        const
            me           = this,
            appConfigUrl = `${isDemoBrowser ? '_shared/browser/' : ''}app.config.json`;
        try {
            // Loading app configuration
            me.appConfig = (await AjaxHelper.get(appConfigUrl, { parseJson : true })).parsedJson;
        }
        catch (error) {
            me.appConfig = {
                title       : 'Demo browser',
                description : 'Use the thumbnails to open demos.'
            };
            // No info menu available without this data
            me.container.classList.add('b-nodescription');
        }

        if (me.container) {
            me.loadDescription();
            // Adjust CodePen button
            me.codePenButton.hidden = isDemoBrowser ||
                me.appConfig.disableCodePen ||
                !DemoCodeEditor.isModule && me.appConfig.merge;
        }
    }

    /**
     * Registers the passed URL to return the passed mocked up Fetch Response object to the
     * AjaxHelper's promise resolve function.
     * @param {String} url The url to return mock data for
     * @param {Object|Function} response A mocked up Fetch Response object which must contain
     * at least a `responseText` property, or a function to which the `url` and a `params` object
     * and the `Fetch` `options` object is passed which returns that.
     * @param {String} response.responseText The data to return.
     * @param {Boolean} [response.synchronous] resolve the Promise immediately
     * @param {Number} [response.delay=100] resolve the Promise after this number of milliseconds.
     */
    mockUrl(url, response) {
        AjaxHelper.mockUrl.apply(AjaxHelper, arguments);
    }

    injectFavIcon() {
        DomHelper.createElement({
            tag    : 'link',
            parent : document.head,
            rel    : 'icon',
            href   : '../_shared/images/favicon.png',
            sizes  : '64x64'
        });
    }

    //endregion

    //region Header with tools

    insertHeader() {
        const
            me           = this,
            { pathname } = document.location,
            pathElements = pathname.split('/').reduce((result, value) => {
                if (value && !value.endsWith('.html')) {
                    result.push(value);
                }
                return result;
            }, []),
            exampleName  = document.title.split(' - ')[1] || document.title,
            exampleId    = pathElements[pathElements.length - 1];

        // Remove any pre-rendered header
        document.querySelector('header.demo-header')?.remove();

        const
            logoSvg = `<svg viewBox="0 0 354.9 144.52" xmlns="http://www.w3.org/2000/svg">
                            <g><path d="m305.63 144.52c-12.47 0-23.53-4.83-31.58-13.28v11.06h-25.54v-142.3h26.75v48.58c7.84-7.64 18.5-12.07 30.37-12.07 27.15 0 49.28 23.33 49.28 54.1s-22.12 53.9-49.28 53.9zm-3.82-83.47c-14.68 0-26.55 13.27-26.55 29.77s11.87 29.16 26.55 29.16 26.55-12.67 26.55-29.16-11.87-29.77-26.55-29.77z"/><path d="m148.02 0h74.01v29.78h-74.01z"/><path d="m0 56.26h222.03v29.78h-222.03z"/><path d="m74.01 112.52h148.02v29.6h-148.02z"/></g>
                        </svg>`,
            // In the demo browser, the logo links to the Bryntum home page and the product name is a dropdown
            // switching between the products' example browsers (matching the docs browser header).
            // In an example, the whole title links back to the demo browser.
            header  = DomHelper.insertFirst(document.getElementById('container'), {
                tag       : 'header',
                className : 'demo-header b-bryntum',
                html      : isDemoBrowser ? `
                <a href="#start-of-content" id="skip-to-content" aria-labelledby="example-description">Skip to content</a>
                <div id="title" class="title">
                    <a id="home-link" href="${bryntumUrl}" aria-label="Bryntum home page">
                        ${logoSvg}
                    </a>
                    <h1>
                        <button id="product-selector">${me.product.fullName}</button>
                        <span id="versionId">${me.product.version}</span>
                    </h1>
                </div>
            ` : `
                <a href="#start-of-content" id="skip-to-content" aria-labelledby="example-description">Skip to content</a>
                <a id="title" class="title" href="../${isUmd ? 'index.umd.html' : ''}${this.rtl ? '?rtl' : ''}#example-examples-scheduler-${exampleId}">
                    <h1>
                        ${logoSvg}
                        <span>${exampleName}</span>
                    </h1>
                </a>
            `
            });

        document.getElementById('skip-to-content')?.addEventListener('click', () => {
            const focusTarget = Array.from(bryntum.query(bryntum.product.name).element.querySelectorAll('[aria-label],[aria-labelledby],input,button,a')).find(DomHelper.isFocusable);
            focusTarget?.focus();
        });

        me.header = header;

        if (isDemoBrowser) {
            const productSelectorElement = header.querySelector('#product-selector');

            productSelectorElement.innerHTML = '';

            me.productSelector = new Button({
                adopt       : productSelectorElement,
                text        : me.product.fullName,
                menuIcon    : 'b-icon-collapse-down',
                rendition   : 'text',
                ignoreLearn : true,
                menu        : {
                    items : [
                        { text : 'Bryntum Grid', href : `${bryntumUrl}/products/grid/examples/` },
                        { text : 'Bryntum Scheduler', href : `${bryntumUrl}/products/scheduler/examples/` },
                        { text : 'Bryntum Scheduler Pro', href : `${bryntumUrl}/products/schedulerpro/examples/` },
                        { text : 'Bryntum Gantt', href : `${bryntumUrl}/products/gantt/examples/` },
                        { text : 'Bryntum Calendar', href : `${bryntumUrl}/products/calendar/examples/` },
                        { text : 'Bryntum Task Board', href : `${bryntumUrl}/products/taskboard/examples/` },
                        {
                            text      : 'All products',
                            href      : `${bryntumUrl}/examples/`,
                            separator : true
                        }
                    ]
                }
            });
        }

        const
            toolsContainer = new Toolbar({
                appendTo  : header,
                cls       : 'tools-container',
                ariaLabel : 'Example tools',
                owner     : me,
                layout    : 'hbox',
                rendition : {
                    button : 'text'
                },
                items : [
                    
                    {
                        id        : 'trial-button',
                        text      : 'L{DownloadTrial}',
                        href      : `${bryntumUrl}/download/?product=${me.product.name}`,
                        // color     : 'b-green',
                        rendition : 'filled',
                        hidden    : !(isBryntumCom || me.testMode)
                    },
                    
                    {
                        ref         : 'learnButton',
                        text        : 'L{Learn}',
                        cls         : 'learnButton',
                        ignoreLearn : true,
                        hidden      : isDemoBrowser,
                        rendition   : 'text',
                        menu        : {
                            width    : '20em',
                            autoShow : false,
                            align    : {
                                anchor : true
                            },
                            cls   : 'docsmenu',
                            title : 'L{UsedClasses}',
                            tbar  : [
                                {
                                    type                 : 'textfield',
                                    clearable            : true,
                                    keyStrokeChangeDelay : 300,
                                    width                : '100%',
                                    placeholder          : 'L{Filter}',
                                    triggers             : {
                                        filter : {
                                            cls : 'b-icon b-icon-filter'
                                        }
                                    },
                                    listeners : {
                                        change  : me.filterLearnMenu,
                                        keydown : me.onLearnFilterKeydown
                                    }
                                }
                            ],
                            listeners : {
                                async beforeShow() {
                                    if (!this.items.length) {
                                        const
                                            docsPrefix                                   = isBryntumCom ? `/docs/${me.product.name}` : '../../docs',
                                            result                                       = await fetch('../_shared/data/classes.json'),
                                            publicClasses                                = await result.json(),
                                            items                                        = [],
                                            classMeta                                    = [],
                                            typeWeight                                   = {
                                                Main    : 1,
                                                Column  : 2,
                                                Feature : 3,
                                                Widget  : 4
                                            },
                                            // weights to sort classes by products
                                            productWeight                                = {
                                                grid         : 1,
                                                scheduler    : 2,
                                                calendar     : 3,
                                                taskboard    : 3,
                                                schedulerpro : 4,
                                                gantt        : 5
                                            },
                                            { hideClassesRegExp, featuredClassesRegExp } = me;

                                        for (const meta of Object.values(bryntum.usedClasses)) {
                                            const
                                                { name } = meta,
                                                // Docs app needs "/" as delimiter
                                                fullName = publicClasses[name]?.replaceAll('.', '/');

                                            if (meta.type && fullName &&
                                                // check if the showcases the class
                                                // skip unrelated classes ..to make the menu less busy
                                                (!featuredClassesRegExp ||
                                                    (meta.isFeatured = fullName.match(featuredClassesRegExp)) ||
                                                    !hideClassesRegExp ||
                                                    !fullName.match(hideClassesRegExp))) {
                                                // fill weight to order entries properly
                                                meta.weight = productWeight[fullName.split('/')[0].toLowerCase()] || 0;

                                                // put the demo featured classes into a special section
                                                if (meta.isFeatured) {
                                                    meta.type = 'Main';
                                                    meta.weight += 100;
                                                }

                                                classMeta.push(meta);
                                            }
                                        }

                                        // Sort by:
                                        // 1) type
                                        // 2) to show the demo featured classes first
                                        // 3) the to show the product classes ..then classes closer to the product etc...
                                        // 4) by name
                                        classMeta.sort((a, b) => {
                                            const
                                                aTypeWeight = typeWeight[a.type],
                                                bTypeWeight = typeWeight[b.type];

                                            return aTypeWeight > bTypeWeight ? 1
                                                : aTypeWeight < bTypeWeight ? -1
                                                    : a.weight > b.weight ? -1
                                                        : a.weight < b.weight ? 1
                                                            : a.name > b.name ? 1 : -1;
                                        });

                                        let category;

                                        for (const meta of classMeta) {
                                            const
                                                {
                                                    name,
                                                    type
                                                }    = meta,
                                                icon = 'fa fa-' + (type === 'Main' ? 'star' : type === 'Feature' ? 'magic' : type === 'Widget' ? 'cubes' : 'columns');

                                            if (type !== category) {
                                                category = type;
                                                items.push({
                                                    text : type,
                                                    icon,
                                                    cls  : 'b-docs-category'
                                                });
                                            }

                                            items.push({
                                                text   : name,
                                                icon   : meta.isFeatured ? 'fa fa-star' : null,
                                                href   : `${docsPrefix}/#${publicClasses[name].replaceAll('.', '/')}`,
                                                target : 'docs'
                                            });
                                        }

                                        this.items = items;
                                    }
                                }
                            }
                        }
                    },
                    {
                        ref         : 'codePenButton',
                        icon        : 'b-icon-codepen',
                        hidden      : window.isDemoBrowser,
                        owner       : me,
                        ignoreLearn : true,
                        tooltip     : 'L{Tooltip.openInCodePen}',
                        async onClick({ source }) {
                            const
                                { element }       = me,
                                { name, version } = me.product,
                                nextSfx           = ['alpha', 'beta'].some(v => version.includes(v)) ? '-next' : '',
                                productUrl        = `${bryntumUrl}/products/${name}${nextSfx}`,
                                buildUrl          = `${productUrl}/build`;

                            let { codeEditor } = me;

                            if (!codeEditor) {
                                const { icon } = source;
                                // Show a spinner while waiting for it
                                source.icon = 'b-icon-spinner';
                                codeEditor = await shared.createEditor();
                                await codeEditor.editorReady;
                                source.icon = icon;
                            }

                            const
                                loadedCode        = codeEditor?.codeCache['app.js'] || codeEditor?.codeCache['app.module.js'],
                                hash              = Math.floor(new Date().getTime() / 3600000),
                                htmlResponse      = await AjaxHelper.get('index.html'),
                                htmlString        = await htmlResponse.text(),
                                parser            = new DOMParser(),
                                doc               = parser.parseFromString(htmlString, 'text/html'),
                                refineHTMLSnippet = html => {
                                    const codePenHTML = document.createElement('div');
                                    codePenHTML.innerHTML = html;

                                    [...codePenHTML.querySelectorAll('script')].forEach(script => {
                                        const src = script.getAttribute('src');
                                        if (
                                            src?.includes('app.module.js') ||
                                            src?.includes('../_shared/locales/examples.locales.umd.js')
                                        ) {
                                            script.remove();
                                        }
                                    });

                                    return codePenHTML.innerHTML;
                                },
                                htmlBody          = refineHTMLSnippet(doc.body.innerHTML).trimEnd(),
                                demoName          = pathName.match(/(?:examples\/)([^/?#]+)/)?.[1],
                                importStatements  = (() => {
                                    // Parse source code imports and generate import header for CodePen
                                    const
                                        thinImports   = [...loadedCode.matchAll(/\/build\/thin\/(.*?)'/gm).map(m => m[1])],
                                        isThin        = thinImports.length,
                                        moduleImports = isThin ? thinImports : [`${name}.module.js`],
                                        imports       = moduleImports.map(file => {
                                            const
                                                name    = file.split('.')[0],
                                                varName = name.charAt(0).toUpperCase() + name.slice(1) + 'Module',
                                                url     = `${buildUrl}${isThin ? '/thin' : ''}/${file}?${hash}`;
                                            return `import * as ${varName} from '${url}';`;
                                        }),
                                        assign        = `Object.assign(window, ${moduleImports.map(f => {
                                            const name = f.split('.')[0];
                                            return name.charAt(0).toUpperCase() + name.slice(1) + 'Module';
                                        }).join(', ')});`;

                                    return [
                                        '// Import bundles and expose all Bryntum classes on window to simplify coding at CodePen',
                                        ...imports,
                                        assign,
                                        ''
                                    ].join('\n');
                                })(),
                                demoCode          = loadedCode
                                    .replace(/^\s*import\s+.*?;.*$/gm, '')
                                // Replace relative links with absolute paths
                                    .replace(/(resourceImagePath\s*:\s*)['"][^'"]*['"](\s*,?)/, `$1'${productUrl}/examples/_shared/images/users/'$2`)
                                    .replace(/\.\.\/_datasets\/([^/]+\.json)/g, `${productUrl}/examples/_datasets/$1`)
                                    .replace(/(?:\.\.?\/)*data\/[^/]+\.json/g, `${productUrl}/examples/${demoName.toLowerCase()}/$&`)
                                // Fix CORS issue for remote data loading
                                    .replace(/(\s*)readUrl\s*:/g, `$1fetchOptions : { credentials : 'omit' },  // required to bypass CORS at CodePen$1readUrl :`)
                                    .replace(/^(\s*)loadurl\s*:\s*(['"].+?['"])/gim, `$1transport: {\n$1\tload: {\n$1\t\turl: $2\n$1\t}\n$1}`)
                                    .replace(/(^\s*)(url\s*:\s*['"][^'"]*['"])(,?)/gim, `$1$2,\n$1credentials : 'omit'$3 // required to bypass CORS at CodePen`)
                                    .trimStart(),
                                themeName   = DomHelper.themeInfo.filename || 'svalbard-light',
                                demoStyles        = (me.appConfig.source ?? [])
                                    .filter(file => file.endsWith('.css'))
                                    .map(file =>
                                        `<link rel="stylesheet" href="${productUrl}/examples/${demoName.toLowerCase()}/${file}?${hash}">`
                                    ),
                                formConfig        = {
                                    tag      : 'form',
                                    style    : 'display:none',
                                    action   : 'https://codepen.io/pen/define?editors=101',
                                    target   : '_blank',
                                    parent   : element,
                                    method   : 'post',
                                    children : [{
                                        tag   : 'input',
                                        type  : 'hidden',
                                        name  : 'data',
                                        // Docs https://blog.codepen.io/documentation/prefill/
                                        value : StringHelper.safeJsonStringify({
                                            title : `${document.getElementById('title').innerText.replace('\n', ' ')}`,
                                            html  : [
                                                '<html lang="en">',
                                                '<head>',
                                                `<link rel="stylesheet" href="${productUrl}/build/fontawesome/css/fontawesome.css?${hash}">`,
                                                `<link rel="stylesheet" href="${productUrl}/build/fontawesome/css/solid.css?${hash}">`,
                                                `<link rel="stylesheet" href="${productUrl}/build/${name.toLowerCase()}.css?${hash}">`,
                                                `<link rel="stylesheet" href="${productUrl}/build/${themeName}.css?${hash}" data-bryntum-theme>`,
                                                `<link rel="stylesheet" href="${productUrl}/examples/_shared/shared.css?${hash}">`,
                                                demoStyles,
                                                '</head>',
                                                '<body>',
                                                htmlBody,
                                                me.localeManager.locale.localeName !== 'En' ? `<script src="${productUrl}/examples/_shared/locales/examples.locale.${me.localeManager.locale.localeName}.umd.js?${hash}"></script>` : '',
                                                '</body>',
                                                '</html>'
                                            ].join('\n'),
                                            js : [
                                                importStatements,
                                                '// Apply current theme',
                                        `document.body.classList.add("b-theme-${themeName}");\n`,
                                        demoCode,
                                        me.localeManager.locale.localeName !== 'En' ? `LocaleManager.applyLocale('${me.localeManager.locale.localeName}'); // Apply localization` : ''
                                            ].join('\n')
                                        })
                                    }]
                                },
                                form              = DomHelper.createElement(formConfig);

                            if (me.testMode) {
                                me.codePenFormConfig = formConfig;
                            }
                            else {
                                document.body.appendChild(form);
                                form.submit();
                            }

                            form.remove();
                        }
                    },
                    {
                        ref     : 'lightDarkButton',
                        hidden  : document.body.matches('.b-theme-custom'),
                        icon    : DomHelper.isDarkTheme ? 'fa fa-sun' : 'fa fa-moon',
                        tooltip : 'L{Tooltip.toggleLightDark}',
                        onClick({ source }) {
                            DomHelper.toggleLightDarkTheme();
                        }
                    },
                    // {
                    //     ref         : 'fullscreenButton',
                    //     id          : 'fullscreen-button',
                    //     icon        : 'b-icon-fullscreen',
                    //     tooltip     : 'L{Tooltip.fullscreenButton}',
                    //     ignoreLearn : true,
                    //     onClick() {
                    //         if (Fullscreen.enabled) {
                    //             if (!Fullscreen.isFullscreen) {
                    //                 Fullscreen.request(document.body);
                    //             }
                    //             else {
                    //                 Fullscreen.exit();
                    //             }
                    //         }
                    //     }
                    // },
                    // {
                    //     ref  : 'styleButton',
                    //     icon : 'fa fa-paint-brush',
                    //     async onClick() {
                    //         if (!me.styleEditor || me.styleEditor.collapsed) {
                    //             await me.showStyleEditor();
                    //         }
                    //         else {
                    //             await me.styleEditor.collapse();
                    //         }
                    //     }
                    // },
                    {
                        ref     : 'codeButton',
                        icon    : 'b-icon-code',
                        cls     : 'b-no-monkeys',
                        tooltip : {
                            html  : 'L{Tooltip.codeButton}',
                            align : 't100-b100'
                        },
                        preventTooltipOnTouch : true,
                        hidden                : isDemoBrowser || noEditor,
                        ignoreLearn           : true,
                        async onClick({ source }) {
                            let { codeEditor } = shared;

                            if (!codeEditor || codeEditor.collapsed) {
                                const { icon } = source;

                                // Show a spinner while waiting for it
                                if (!codeEditor) {
                                    source.icon = 'b-icon-spinner';
                                }
                                codeEditor = await shared.showCodeEditor();
                                source.icon = icon;
                            }
                            else {
                                await codeEditor.collapsePanel();
                            }
                        }
                    },
                    {
                        ref         : 'infoButton',
                        icon        : 'b-icon-cog',
                        ignoreLearn : true,
                        menuIcon    : null,
                        tooltip     : {
                            html  : 'L{Tooltip.infoButton}',
                            align : 't100-b100'
                        },
                        preventTooltipOnTouch : true,
                        owner                 : me,
                        menu                  : {
                            type          : 'popup',
                            anchor        : true,
                            align         : 't100-b100',
                            cls           : 'info-popup',
                            tools         : null,
                            labelPosition : 'above',
                            scrollable    : {
                                y : true
                            },
                            draggable              : false,
                            resizable              : false,
                            width                  : '26em',
                            highlightReturnedFocus : false,
                            onBeforeShow() {
                                // Set up the aria description
                                this.ariaDescription = shared.description;
                                // Add Ajax-loaded items at last minute.
                                this.items = infoButton.menuItems;
                                delete this.onBeforeShow;
                            }
                        }
                    }
                ]
            });

        const { trialButton,  fullscreenButton, styleButton, codeButton, infoButton, codePenButton, lightDarkButton } = toolsContainer.widgetMap;

        Object.assign(me, { fullscreenButton, codePenButton, styleButton, codeButton, infoButton, lightDarkButton, trialButton });
    }

    filterLearnMenu({ source, value }) {
        source.up('menu').items.forEach(i => i[shouldShow(i, value) ? 'show' : 'hide']());
    }

    onLearnFilterKeydown({ event, source }) {
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            source.nextSibling.focus();
        }
    }

    //endregion

    //region Hints

    async initHints() {
        const
            me        = this,
            { hints } = me;

        if (!hints || me.preventHints || me.toolTips?.length > 0) {
            return;
        }

        // If a hint flow is defined, we can't run it at any time
        if (hints.hints) {
            Toast.show({
                html        : 'Hints can only be run from the start of the app',
                rootElement : document.body,
                timeout     : 10000
            });
            return;
        }

        me.toolTips = [];

        const
            missingTargets  = Object.keys(hints).filter(key => !(key && DomHelper.down(document.body, key))),
            targetsAreReady = missingTargets.length === 0;

        // if some targets are not there yet - reschedule this call
        if (!targetsAreReady) {
            if (!('retryCount' in me)) {
                me.retryCount = 0;
            }
            const
                DELAY   = 500,
                RETRIES = 10;

            if (++me.retryCount < RETRIES) {
                me.hintTimer = setTimeout(() => me.initHints(), DELAY);
                return;
            }

        }
        delete me.retryCount;

        // Hide all hints on click anywhere, it also handles touch.
        // Add it first so that it can interrupt and stop the hint showing.
        document.body.addEventListener('mousedown', me.onDocumentMouseDown, true);

        for (const [key, hint] of Object.entries(hints)) {
            const target = key && DomHelper.down(document.body, key);

            if (target) {
                const tooltipCfg = {
                    forElement   : target,
                    scrollAction : 'hide',
                    align        : 't-b',
                    tools        : null,
                    rendition    : 'rich',
                    html         : {
                        children : [hint.title ? {
                            html      : hint.title,
                            className : 'header'
                        } : null, {
                            html      : hint.content,
                            className : 'description'
                        }]
                    },
                    autoShow    : true,
                    cls         : 'b-demo-hint',
                    textContent : true,
                    autoClose   : false,
                    ...hint
                };

                // we've just combined "title" & "content" into "html" above
                delete tooltipCfg.title;
                delete tooltipCfg.content;

                me.toolTips.push(new Tooltip(tooltipCfg));

                // The delay here essentially causes mousedown dismiss handler to not add immediately so hints stay
                // up even if there were an immediate click
                await AsyncHelper.sleep(me.toolTips.length * (VersionHelper.isTestEnv ? 10 : 500));

                // If, during the asynchronicity, interaction happened, we must escape.
                if (me.preventHints) {
                    return;
                }
            }
        }


    }



    onDocumentMouseDown(event) {
        // Allow clicking links inside hints
        if (event.target.matches('a')) {
            return;
        }
        this.cleanupHints();
    }

    cleanupHints() {
        const me = this;

        if (!me.preventHints) {
            // If hints are in the delay stage, prevent them.
            clearTimeout(me.hintTimer);

            if (me.toolTips) {
                me.toolTips.forEach(tip => tip.hide?.().then(() => tip.destroy()));
                me.toolTips.length = 0;
                me.preventHints = true;

                document.body.removeEventListener('mousedown', me.onDocumentMouseDown, true);
                //window.removeEventListener('scroll', me.onWindowScroll, true);
            }
        }
    }

    async loadHints(test = false) {
        const me = this;
        me.hints = {};
        me.hasHints = false;

        if (!me.preventHints) {
            try {
                me.hints = (await AjaxHelper.get('meta/hints.json', { parseJson : true })).parsedJson;

                // Divert to hint flow if hints are in the new format
                if (me.hints.hints) {
                    document.body.classList.add('b-hint-flow');
                    if (playHintFlow) {
                        me.hintFlow = new HintFlow({
                            ...me.hints,
                            listeners : {
                                completed() {
                                    const
                                        { infoButton }    = me,
                                        playHintsCheckbox = infoButton.menu.widgetMap.playHintFlow || infoButton.menuItems.find(i => i.ref === 'playHintFlow');

                                    playHintFlow = !(lessonsCompleted[demoName] = true);
                                    playHintsCheckbox.checked = false;
                                    localStorage.setItem('b-example-lessonsCompleted', JSON.stringify(lessonsCompleted));
                                }
                            }
                        });
                    }
                    return me.hints;
                }

                me.hasHints = Boolean(Object.keys(me.hints).length);

                if (!test && !localStorage.getItem(hintKey)) {
                    // Delay a little to allow Ajax-loaded UIs to arrive so that
                    // hint selectors exist.
                    me.hintTimer = setTimeout(() => me.initHints(), 100);
                }
            }
            catch (e) {
                // Hints fetch aborted, no harm
            }
        }
        return me.hints;
    }

    //endregion

    //region Description

    buildClassesRegExp(classes) {
        const paths = classes.map(spec => spec.path || spec.name || spec).join('|');

        return new RegExp(`^(${paths})$`);
    }

    loadDescription() {
        const
            me       = this,
            {
                infoButton,
                appConfig,
                theme
            }        = me,
            locales  = [],
            { body } = document;

        // App description
        me.description = appConfig.description;

        DomHelper.createElement({
            parent        : document.body,
            id            : 'example-description',
            'aria-hidden' : true,
            text          : `${appConfig.description}. Skip to content`
        });

        const { featured, hide } = appConfig.usedClasses || {};

        me.featuredClassesRegExp = featured && me.buildClassesRegExp(featured);
        me.hideClassesRegExp = hide && me.buildClassesRegExp(hide);

        Object.keys(me.localeManager.locales).forEach(key => {
            const locale = me.localeManager.locales[key];
            locales.push({
                value : key,
                text  : locale.localeDesc,
                data  : locale
            });
        });

        let localeValue = me.localeManager.locale.localeName,
            themeCombo;
        const storedLocaleValue = BrowserHelper.getLocalStorageItem('b-example-language');

        // Check that stored locale is actually available among locales for this demo
        if (storedLocaleValue && locales.some(l => l.key === storedLocaleValue)) {
            localeValue = storedLocaleValue;
        }

        // Leave as a config on the button during app startup.
        // Items will be added just in time in onBeforeShow to speed app startup.
        const buttonMenuItems = [
            {
                type  : 'widget',
                cls   : 'example-description',
                style : 'grid-column : span 2',
                html  : `<div class="header">${appConfig.title}</div><div class="description">${appConfig.description}</div>`
            },
            // Do not create theme combo ONLY for non-standard theme
            ...((!themes[theme] || body.matches('.b-theme-custom')) ? [] : [themeCombo = {
                type          : 'combo',
                ref           : 'themeCombo',
                label         : 'L{Theme}',
                labelPosition : 'above',
                editable      : false,
                value         : theme,
                items         : themes,
                style         : 'grid-column : span 2',
                onAction({ value }) {
                    me.applyTheme(value);
                    infoButton.menu.hide();
                }
            }]),
            {
                type           : 'colorfield',
                ref            : 'primaryColor',
                label          : 'L{Shared.primaryColor}',
                value          : DomHelper.primaryColor,
                style          : 'grid-column : span 2',
                addNoColorItem : false,
                picker         : {
                    columns : 'auto'
                },
                colors : [
                    ['#e53935', 'Red'],
                    ['#d81b60', 'Pink'],
                    ['#c200c2', 'Magenta'],
                    ['#8e24aa', 'Purple'],
                    ['#5e35b1', 'Violet'],
                    ['#4527a0', 'Deep-purple'],
                    ['#3949ab', 'Indigo'],
                    ['#1e88e5', 'Blue'],
                    ['#03a9f4', 'Light-blue'],
                    ['#3bc9db', 'Cyan'],
                    ['#00897b', 'Teal'],
                    ['#43a047', 'Green'],
                    ['#8bc34a', 'Light-green'],
                    ['#c0ca33', 'Lime'],
                    ['#fdd835', 'Yellow'],
                    ['#ffb300', 'Amber'],
                    ['#fb8c00', 'Orange'],
                    ['#f4511e', 'Deep-orange'],
                    ['#757575', 'Gray'],
                    ['#000000', 'Black']
                ],
                onChange({ value }) {
                    document.documentElement.style.setProperty('--b-primary', value);
                    GlobalEvents.trigger('primaryColorChange', { primaryColor : value });
                    BrowserHelper.setLocalStorageItem('b-example-primaryColor', value);
                }
            },
            {
                type          : 'combo',
                ref           : 'localeCombo',
                label         : 'L{Language}',
                labelPosition : 'above',
                editable      : false,
                store         : {
                    data    : locales,
                    sorters : [{
                        field     : 'text',
                        ascending : true
                    }]
                },
                displayField : 'text',
                valueField   : 'value',
                value        : localeValue,
                style        : 'grid-column : span 2',
                picker       : {
                    cls : 'b-locale-picker'
                },
                // Show the locale code as well as the name
                listItemTpl : locale => {
                    return `<div>${locale.text}</div><div>${locale.value}</div>`;
                },
                onAction : ({ value }) => {
                    me.localeManager.applyLocale(value);
                    Toast.show({
                        html        : me.L('L{Locale changed}'),
                        rootElement : document.body
                    });
                    infoButton.menu.hide();
                },
                // The filtering also checks the locale code
                // So that on a US/UK keyboard, you can use "ar" to find Arabic etc.
                primaryFilter(record) {
                    const value = this.value.toLowerCase();

                    return record.text.toLowerCase().startsWith(value) ||
                        record.value.toLowerCase().startsWith(value);
                }
            }
        ];

        if (!isDemoBrowser) {
            buttonMenuItems.push({
                type     : 'slidetoggle',
                ref      : 'playHintFlow',
                text     : 'L{runHints}',
                checked  : playHintFlow,
                onAction : ({ checked }) => {
                    lessonsCompleted[demoName] = !checked;
                    localStorage.setItem('b-example-lessonsCompleted', JSON.stringify(lessonsCompleted));
                }
            });

            buttonMenuItems.push(...[{
                type     : 'button',
                ref      : 'hintButton',
                text     : 'L{Display hints}',
                // rendition : 'outlined',
                onAction : () => {
                    infoButton.menu.hide();
                    me.preventHints = false;
                    me.initHints();
                }
            }, {
                type      : 'slideToggle',
                ref       : 'hintCheck',
                text      : 'L{Automatically}',
                alignSelf : 'center',
                minWidth  : 'fit-content',
                tooltip   : 'L{Tooltip.hintCheck}',
                checked   : !localStorage.getItem(hintKey),
                onAction  : ({ checked }) => {
                    if (checked) {
                        localStorage.removeItem(hintKey);
                    }
                    else {
                        localStorage.setItem(hintKey, true);
                    }
                }
            }]);
        }

        infoButton.menuItems = buttonMenuItems;

        // React to theme changes
        GlobalEvents.on({
            theme : ({ theme, prev }) => {
                themeCombo && (themeCombo.value = theme);
                BrowserHelper.setLocalStorageItem('b-example-new-theme', theme);
                body.classList.add(StringHelper.cls`b-theme-${theme}`);
                // display after loading theme to not show initial transition from default theme
                body.classList.remove(StringHelper.cls`b-theme-${prev}`);
                if (isDemoBrowser) {
                    body.style.visibility = 'visible';
                }

                me.prevTheme = prev;

                me.trigger('theme', {
                    theme,
                    prev
                });
            },
            // call before other theme listeners
            prio : 1
        });
    }

    //endregion

    //region Theme applying

    applyTheme(newThemeName) {
        // Graceful fallback for old themes
        if (!newThemeName.endsWith('-dark') && !newThemeName.endsWith('-light')) {
            newThemeName = 'svalbard-light';
        }

        return DomHelper.setTheme(newThemeName, this.getStoredThemeId(defaultTheme));
    }

    getStoredThemeId(defaultThemeId) {
        const theme = queryString.theme || (!testMode && BrowserHelper.getLocalStorageItem('b-example-new-theme')) || defaultThemeId;

        if (!themes[theme]) {
            return defaultThemeId;
        }

        return theme;
    }

    get autoApply() {
        return autoApply;
    }

    set autoApply(newValue) {
        const { widgetMap } = this.codeEditor;

        autoApply = Boolean(newValue);

        widgetMap.applyMenu.menu.widgetMap.autoApply.checked = autoApply;
        widgetMap.applyButton.hidden = autoApply;
    }

    get theme() {
        return DomHelper.themeInfo.filename;
    }

    // Utility method for when creating thumbs.
    // Eg: shared.fireMouseEvent('mouseover', document.querySelector('.b-task-rollup'));
    fireMouseEvent(type, target, offset = [0, 0], showCursor = false) {
        // Allow passing a string selector or an element
        target = typeof target === 'string' ? document.querySelector(target) : target;

        const
            me         = this,
            { center } = Rectangle.from(target),
            event      = {
                clientX : center.x + offset[0],
                clientY : center.y + offset[1],
                bubbles : true
            };

        // We have begun to use pointerxxxx events, so we need both
        if (type.startsWith('mouse')) {
            target.dispatchEvent(new PointerEvent(`pointer${type.substring(5)}`, event));
        }
        if (showCursor) {
            if (!me.cursorElement) {
                me.cursorElement = document.createElement('div');
                me.cursorElement.className = 'fa fa-mouse-pointer';
                Object.assign(me.cursorElement.style, {
                    position   : 'fixed',
                    lineHeight : '1em',
                    zIndex     : 99999,
                    fontFamily : 'var(--b-widget-icon-font-family, FontAwesome)',
                    fontSize   : '150%',
                    color      : '#48c'
                });
            }
            Object.assign(me.cursorElement.style, {
                top  : `${event.clientY}px`,
                left : `${event.clientX}px`
            });
            document.body.appendChild(me.cursorElement);
        }
        else {
            me.cursorElement?.remove();
        }
        target.dispatchEvent(new MouseEvent(type, event));
    }

    //endregion

    // region RootCause

    // Shared RootCause code for frameworks should be updated here scripts/templates/rootcause.ejs.js

    initRootCause() {
        const
            recordVideo       = queryString.video === '1',
            disabled          = !recordVideo && locationRe(disableRootCause).test(window.location.href),
            isRootCauseReplay = (() => {
                try {
                    const a = window.top.location.href; // NOSONAR unused variable
                }
                catch (e) {
                    return true;
                }
                return false;
            })();

        if ((isBryntumCom || isRootCauseReplay) && !disabled && !VersionHelper.isTestEnv && !document.cookie.includes('cookie_notice_accepted=false')) {
            const
                script = document.createElement('script');

            script.async = true;
            script.crossOrigin = 'anonymous';
            script.src = 'https://app.therootcause.io/rootcause-full.js';
            script.addEventListener('load', this.startRootCause.bind(this));

            document.head.appendChild(script);
        }
    }

    startRootCause() {
        if (queryString.bugbash) {
            const date = new Date();

            // Bug bash cookie lasting 1d
            date.setTime(date.getTime() + (24 * 60 * 60 * 1000));

            document.cookie = 'bugbash=1' + '; expires=' + date.toUTCString() + '; path=/';
        }

        const
            isBugBash    = Boolean(BrowserHelper.getCookie('bugbash')),
            bugBushId    = 'd0ed295cf2ef50d15c2ce571b288ee37c3853cf8',
            appId        = (isBugBash ? bugBushId : this.product.appId) || 'unknown',
            { version }  = this.product,
            recordEvents = isBugBash || !('ontouchstart' in document.documentElement), // Skip event recording on touch devices as RC could cause lag
            recordVideo  = isBugBash || queryString.video === '1';

        if (!window.RC) {
            console.log('RootCause not initialized');
            return;
        }

        // https://github.com/bryntum/support/issues/13186
        window.RC.applyIf = Shared.applyIf;

        window.logger = new RC.Logger({
            captureScreenshot               : true,
            recordUserActions               : recordEvents && !locationRe(disableRootCauseActions).test(window.location.href),
            logAjaxRequests                 : true,
            applicationId                   : appId,
            maxNbrLogs                      : isBryntumCom ? 1 : 0,
            autoStart                       : isBryntumCom,
            treatFailedAjaxAsError          : true,
            treatResourceLoadFailureAsError : false,
            showFeedbackButton              : recordVideo,
            recordSessionVideo              : recordVideo,
            showIconWhileRecording          : false,
            recorderConfig                  : {
                recordScroll             : false,
                // Ignore our own auto-generated ids since they are not stable
                shouldIgnoreDomElementId : (id) => /^(b_|b-)/.test(id),
                ignoreCssClasses         : [
                    'focus',
                    'hover',
                    'dirty',
                    'selected',
                    'resizable',
                    'committing',
                    'b-active',
                    'b-sch-terminals-visible'
                ]
            },
            version,
            ignoreErrorMessageRe : /Script error|Unexpected token var|ResizeObserver/i,
            // Ignore non-bryntum domain errors and monaco-editor files
            ignoreFileRe         : /^(?:(?!bryntum).)*$|monaco-editor/,

            onBeforeLog(data) {
                // Avoid weird errors coming from the browser itself or translation plugins etc
                // '.' + 'js' to avoid cache-buster interference
                if (data.isJsError && (!data.file || !data.file.includes('.' + 'js') || data.file.includes('chrome-extension'))) {
                    return false;
                }
            },

            onErrorLogged(responseText, loggedErrorData) {
                if (loggedErrorData.isFeedback) {
                    let data;

                    try {
                        data = JSON.parse(responseText);
                    }
                    catch (e) {
                    }

                    if (data) {
                        Toast.show({
                            html        : `<h3>Thank you!</h3><p class="feedback-savedmsg">Feedback saved, big thanks for helping us improve. <a target="_blank" href="${data.link}"><i class="fa fa-link"></i>Link to session</a></p>`,
                            timeout     : 10000,
                            rootElement : document.body
                        });
                    }
                }
            }
        });

        if (recordVideo) {
            setTimeout(() => {
                window.logger.stop();
            }, maxVideoDuration);
        }

        // Abort early error listener
        window.removeEventListener('error', errorListener);

        if (earlyErrorEvent?.error) {
            window.logger.logException(earlyErrorEvent.error);
        }
    }

    // endregion

    onThumbError(e) {
        if (e.target.src.includes('thumb')) {
            e.target.style.display = 'none';
        }
    }

    // region version check
    performVersionCheck() {
        if (!window.navigator.onLine || testMode || BrowserHelper.isCSP) {
            return;
        }

        const lastCheck = BrowserHelper.getLocalStorageItem('b-latest-version-check-timestamp');

        // Only 1 version check every other day
        if (lastCheck && Date.now() - new Date(Number(lastCheck)) < 1000 * 60 * 60 * 24 * 2) {
            return;
        }

        BrowserHelper.setLocalStorageItem('b-latest-version-check-timestamp', Date.now());

        AjaxHelper.get(`${bryntumUrl}/latest/?product=${this.product.onlineId}`, {
            parseJson   : true,
            credentials : 'omit'
        }).then(response => this.notifyIfLaterVersionExists(response)).catch(() => {});
    }

    notifyIfLaterVersionExists(response) {
        const latestVersion = response.parsedJson?.name;

        if (latestVersion && VersionHelper.checkVersion(latestVersion, '<')) {
            const toast = Toast.show({
                cls         : 'version-update-toast',
                html        : `<h4>Update available! <i class="fa fa-times"></i></h4>A newer version ${latestVersion} is available. Download from our <a href="https://customerzone.bryntum.com">Customer Zone</a>.`,
                rootElement : document.body,
                timeout     : 15000
            });

            // Clicking the toast snoozes it for 1w
            toast.element.addEventListener('click', () => {
                const
                    nextReminderDate = new Date().setDate(new Date().getDate() + 7);

                BrowserHelper.setLocalStorageItem('b-latest-version-check-timestamp', nextReminderDate);
            });
        }
    }

    // endregion

    //region Code Editor

    async showCodeEditor(noAnimation) {
        const codeEditor = await this.createEditor();
        await codeEditor.editorReady;
        await codeEditor.expandPanel(noAnimation ? { animation : null } : undefined);
        codeEditor.focus();
        return codeEditor;
    }

    async createEditor() {
        let { codeEditor } = this;
        if (!codeEditor) {
            codeEditor = this.codeEditor = new VanillaCodeEditor({
                mode             : 'vanilla',
                codePath         : '../_shared/browser/lib/monaco-editor',
                appendTo         : document.body,
                // Needs to be owned by this class so that it does not get destroyed when
                // a syntax error causes widget destruction
                owner            : this,
                preferredSources : [
                    /app.*\.js/
                ]
            });
            Widget.disableThrow = true;
            await codeEditor.initialLoadCode();

            const { monacoInstance } = codeEditor;

            // Add CTRL/CMD+S handler to the Monaco instance to update the example app
            codeEditor.editor.addCommand(
                monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,  // Ctrl/Cmd + S
                function() {
                    codeEditor.applyChanges();
                }
            );

        }
        return codeEditor;
    }

    //endregion
}

/**
 * VanillaCodeEditor extends DemoCodeEditor and implements `applyChanges` method to enable code editing.
 */
class VanillaCodeEditor extends DemoCodeEditor {

    static $name = 'VanillaCodeEditor';

    static configurable = {

        header : false,

        tbar : {
            items : {
                applyButton : {
                    type     : 'button',
                    text     : 'L{CodeEditor.apply}',
                    icon     : 'b-icon b-icon-sync',
                    disabled : true,
                    onAction : 'up.applyChanges',
                    hidden   : autoApply,
                    weight   : 100
                },
                applyMenu : {
                    icon      : 'b-icon-menu',
                    ariaLabel : 'L{settings}',
                    menuIcon  : null,
                    rendition : 'text',
                    menu      : {
                        items : {
                            autoApply : {
                                text    : 'L{CodeEditor.autoApply}',
                                checked : autoApply,
                                onItem  : 'up.onAutoApplyAction'
                            }
                        }
                    },
                    weight : 100
                },
                download : {
                    cls       : 'b-icon b-icon-download',
                    href      : '#',
                    rendition : 'text',
                    tooltip   : 'L{CodeEditor.downloadCode}',
                    weight    : 100
                }
            }
        }
    };

    construct(config = {}) {
        super.construct(...arguments);
        // Need at least 700ms to allow for syntax checking.
        this.update = this.buffer('applyChanges', isBryntumCom ? 1500 : 700);
    }

    onAutoApplyAction({ item }) {
        const { checked } = item;

        this.widgetMap.applyButton.hidden = checked;

        // Save choice
        BrowserHelper.setLocalStorageItem('b-example-autoApply', checked);

        if (checked) {
            this.applyChanges();
        }
    }

    applyChanges() {
        if (this.readOnly) {
            return;
        }

        const
            me           = this,
            errorMarkers = me.monacoInstance.editor.getModelMarkers({});

        document.body.classList.remove('b-code-changes-pending');

        // Do not execute code if there are syntax errors
        if (errorMarkers.some(m => m.severity > 1)) {
            me.element.classList.add('invalid');
            me.status = `Syntax errors`;
            return;
        }

        me.element.classList.remove('invalid');
        me.status = 'Idle';

        // Add a warning note to investigators of bugs where demo code was modified
        if (globalThis.logger?.active && !me.addedCodeChangeTag) {
            globalThis.logger.addTag('Code changed', 'true');
            me.addedCodeChangeTag = true;
        }

        switch (me.fileExt) {
            case 'js':
                me.updateJS();
                break;

            case 'css':
                me.updateCSS();
                break;
        }
        me.widgetMap.applyButton.disable();

        me.updateDownloadLink();
    }

    updateCSS() {
        const
            me = this;

        if (!me.cssElement) {
            me.cssElement = DomHelper.createElement({
                parent : document.head,
                tag    : 'style',
                type   : 'text/css'
            });
        }

        me.codeCache[me.filename] = me.cssElement.innerHTML = me.codeModel.getValue();
    }

    async updateJS() {
        const
            me               = this,
            { shared }       = globalThis,
            code             = me.codeModel.getValue() + '\nexport default null;\n',
            // Elements added by demo code
            renderedElements = new Set(document.querySelectorAll('[data-app-element=true]')),
            // Widgets added by demo code
            renderedWidgets  = new Set();

        shared.cleanupHints();

        me.codeCache[me.filename] = me.codeModel.getValue();

        // Store all current uncontained widgets to be able to cleanup on import fail. If the import fails because of a
        // syntax error some code might have executed successfully and we might get unwanted widgets rendered
        document.querySelectorAll('.b-widget.b-outer').forEach(element => {
            const widget = Widget.fromElement(element, 'widget');

            if (widget !== me && !widget.closest(w => w.owner === shared)) {
                renderedWidgets.add(widget);

                // Allow existing outer widgets to be crushed by the incoming outer widgets so that
                // calculations based on height will be correct. If the incoming code fails, and no
                // widgets are incoming, they will not be crushed.
                if (!widget.element.classList.contains('demo-header')) {
                    DomHelper.applyStyle(widget.element, {
                        flex      : '1 1 0',
                        minHeight : 0
                    });
                }
            }
        });

        try {
            me.status = '<i class="b-icon b-icon-spinner"></i>Applying changes';

            // Keeping comment out code around in case we need it to later on support multi module editing
            // // Post to store in backend session
            // const response = await AjaxHelper.post(`../_shared/module.php?file=${me.filename}`, code, { parseJson : true });
            //
            // // Safari doesn't send cookies in import requests, so we extract it and
            // // pass it as part of the URL.
            // if (!me.phpSessionId) {
            //     me.phpSessionId = /PHPSESSID=([^;]+)/.exec(document.cookie)[1];
            // }
            //
            // if (response.parsedJson.success) {

            const
                imports   = code.match(/import .*/gm),
                pathParts = document.location.pathname.split('/'),
                base      = `${document.location.protocol}//${document.location.host}`;

            let rewrittenCode = code;

            // Rewrite relative imports as absolute, to work with createObjectURL approach below

            imports?.forEach(imp => {
                const
                    parts = imp.split('../');
                if (parts.length) {
                    const
                        // ../_shared needs Grid/examples, while ../../lib needs Grid/
                        absolute  = pathParts.slice().splice(0, pathParts.length - parts.length).join('/'),
                        // import xx from 'http://lh/Grid/lib...'
                        statement = `${parts[0]}${base}${absolute}/${parts[parts.length - 1]}`;

                    rewrittenCode = rewrittenCode.replace(imp, statement);
                }
            });

            // Retrieve module from object url. Wrapped in eval() to hide it from FF, it refuses to load otherwise
            const objectUrl = URL.createObjectURL(new Blob([rewrittenCode], { type : 'text/javascript' }));

            await eval(`import(objectUrl)`); // eslint-disable-line no-eval

            URL.revokeObjectURL(objectUrl);

            DomHelper.removeEachSelector(document, '#tools > .remove-widget');

            me.widgetMap.applyButton.disable();

            const projects = [];
            // Destroy pre-existing demo tools, grids etc. after the import, to lessen flickering
            for (const widget of renderedWidgets) {
                if (!widget.isDestroyed && widget.owner !== shared) {
                    const { project } = widget;

                    // Destroy project (possibly created standalone), might be loading or syncing on timeout
                    if (project && !project.isDestroyed) {
                        widget.element.classList.add('b-hide-display');
                        // When sharing an eventStore, it gets chained, but we can still be using the same assignment
                        // store, which might have gotten destroyed by the original project. Not sure it is a "real"
                        // issue, handling it here
                        if (!project.assignmentStore.isDestroyed) {
                            await project.commitAsync();
                        }
                        projects.push(project);
                    }

                    widget.destroy();
                }
            }

            for (const project of projects) {
                project.destroy?.();
            }

            // Destroy any additional elements added by the demo
            renderedElements.forEach(element => element.remove());

            // If we have gotten this far the code is valid
            me.element.classList.remove('invalid');
            me.status = 'Idle';
            // }
        }
        catch (e) {
            // Exception, either some network problem or invalid code
            me.element.classList.add('invalid');
            me.status = e.message;

            if (!VersionHelper.isTestEnv) {
                console.warn(e.message);
            }

            // Remove any widgets created by the failed import (might have successfully added some)
            DomHelper.forEachSelector(document.body, '.b-widget.b-outer', element => {
                const widget = Widget.fromElement(element);
                // Only care about top level components
                if (widget && !widget.isDestroyed && !widget.owner && !renderedWidgets.has(widget)) {
                    try {
                        widget.destroy();
                    }
                    catch (e) {
                        // We might be in a case where a misconfigured Widget throws an exception mid-setup
                    }
                }
            });
            // Restore previous widget set to visibility
            renderedWidgets.forEach(widget => {
                if (!widget.element.classList.contains('demo-header')) {
                    DomHelper.applyStyle(widget.element, {
                        flex      : '',
                        minHeight : '10px'
                    });
                }
            });
        }
    }

    updateDownloadLink() {
        const
            me = this,
            downloadLink = me.downloadLink || (me.downloadLink = me.widgetMap.download.element);

        if (me.isFramework) {
            me.widgetMap.download.hidden = true;
        }
        else {
            downloadLink.download = me.filename;
            downloadLink.href = `data:text/${me.filename.endsWith('.css') ? 'css' : 'javascript'};charset=utf-8,${escape(me.codeModel.getValue())}`;
        }
    }

    async loadCode(filename) {
        await super.loadCode(filename);
        const
            me                   = this,
            { widgetMap, model } = me;

        model.onDidChangeContent(() => {
            if (me.widgetMap.applyMenu.menu.widgetMap.autoApply.checked) {
                document.body.classList.add('b-code-changes-pending');
                me.update();
            }
            else {
                widgetMap.applyButton.enable();
            }
        });

        me.updateDownloadLink();
    }

    toggleReadOnly() {
        super.toggleReadOnly();
        this.widgetMap.applyMenu.hidden = this.isReadOnly;
    }

}

// Make debugging / fiddling easier by exposing instance reference on the window object
document.addEventListener('DOMContentLoaded', () => {
    ['grid', 'scheduler', 'schedulerPro', 'gantt', 'calendar', 'taskboard', 'histogram', 'treegrid'].forEach(productId => {
        if (!window[productId]?.isWidget) {
            Object.defineProperties(window, {
                [productId] : {
                    get() {
                        productId = productId.toLowerCase();
                        return bryntum.query(productId, true);
                    }
                }
            });
        }
    });

    // if ('style' in queryString) {
    //     shared.showStyleEditor();
    // }
});

const shared = new Shared();

shared.themes = themes;
// shared.colors = colors;

// ugly, but needed for bundled demo browser to work
window.shared = shared;

// For banner maker font-size zooming
window.addEventListener('message', ({ data }) => {
    let message;

    if (data) {
        try {
            message = JSON.parse(data);
        }
        catch (e) {
        }

        if (message?.style) {
            const container = document.getElementById('container');
            container && DomHelper.applyStyle(container, message.style);
        }
    }
});

GlobalEvents.on({
    theme({ theme }) {
        shared.lightDarkButton.icon = DomHelper.isDarkTheme ? 'fa fa-sun' : 'fa fa-moon';
    }
});

export default shared;
