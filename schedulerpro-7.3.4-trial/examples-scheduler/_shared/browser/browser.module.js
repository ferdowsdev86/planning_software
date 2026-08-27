import { Store, BrowserHelper, DomSync, DomHelper, EventHelper, StringHelper, Panel, Popup, GlobalEvents, VersionHelper, FunctionHelper } from '../../../build/schedulerpro.module.js';

const groupPaths = {
    Angular           : 'frameworks/angular',
    React             : 'frameworks/react',
    'React + Next.js' : 'frameworks/react-nextjs',
    'React + Vite'    : 'frameworks/react-vite',
    'Vue 3'           : 'frameworks/vue-3',
    'Vue 2'           : 'frameworks/vue-2',
    'Vue 3 + Vite'    : 'frameworks/vue-3-vite'
};

class ExamplesApp {
    constructor() {
        const me = this;

        // For testing purposes
        me.DomHelper = DomHelper;

        me.rtl = BrowserHelper.queryString.rtl != null;
        me.product = window.bryntum.product;
        const
            groupOrder      = window.groupOrder || {
                Pro               : 0,
                'Integration/Pro' : 1,
                Basic             : 2,
                Intermediate      : 3,
                Advanced          : 4,
                Integration       : 5
            },
            examples        = (window.examples || []).map(example => ({
                fullFolder : me.addTrailingSlash(me.exampleFolder(example)),
                id         : me.exampleId(example),
                ...example
            })),
            storageName     = name => `bryntum-${me.product.name}-demo-${name}`,
            saveToStorage   = (name, value) => {
                try {
                    sessionStorage.setItem(storageName(name), value);
                }
                catch (e) {}
            },
            loadFromStorage = name => {
                try {
                    return sessionStorage.getItem(storageName(name));
                }
                catch (e) {}
            },
            framework       = BrowserHelper.queryString.framework || BrowserHelper.getLocalStorageItem('bryntum-framework') || 'all',
            store           = me.examplesStore = new Store({
                data   : examples,
                fields : [
                    'folder',
                    'rootFolder',
                    'fullFolder',
                    'group',
                    'title',
                    'overlay',
                    'version',
                    'build',
                    'since',
                    'thin',
                    'offline',
                    'id',
                    'updated',
                    'globalUrl',
                    'description',
                    'popular',
                    {
                        name         : 'tab',
                        defaultValue : 'js'
                    }
                ],
                groupers : [
                    {
                        field : 'group',
                        fn    : (a, b) => groupOrder[a.group] - groupOrder[b.group]
                    }
                ],
                listeners : {
                    change() {
                        if (me.rendered) {
                            me.refresh();
                        }
                    },
                    thisObj : me
                }
            }),
            browserEl       = document.getElementById('browser');

        me.framework = framework;
        me.exampleStore = store;
        me.currentTipLoadPromiseByURL = {};
        me.testMode = BrowserHelper.queryString.test != null;

        // Safari lags in CSS support, it needs special CSS
        if (BrowserHelper.isSafari) {
            browserEl.classList.add('b-safari');
        }

        // save scroll position
        me.beforeLoadScrollPos = browserEl.scrollTop;

        // remove prerendered examples
        me.examplesContainerEl = document.getElementById('scroller');
        me.examplesContainerEl.innerHTML = '';
        me.examplesContainerEl.classList.add('medium-thumb');

        EventHelper.on({
            scroll : {
                handler() {
                    const topElement = document.elementFromPoint(300, 60);
                    jumpTo.value = topElement?.dataset?.group ?? null;
                },
                element   : browserEl,
                throttled : 250
            },
            keydown : {
                handler(e) {
                    // Hook CTRL/F to find
                    if (e.key === 'f' && e.ctrlKey) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        sidebar.widgetMap.filterField.focus();
                        sidebar.widgetMap.filterField.selectAll();
                    }
                },
                element : document.body
            }
        });

        GlobalEvents.on({
            theme() {
                if (me.rendered) {
                    me.sidebar.widgetMap.themeCombo.value = window.shared.theme;

                    me.refresh();
                }
            }
        });

        document.body.classList.add(StringHelper.cls`b-theme-${window.shared.theme}`);

        me.isOnline = BrowserHelper.isBryntumOnline('online');
        me.buildTip = me.isOnline ? 'This demo is not viewable online, but included when you download the trial. ' : 'This demo needs to be built before it can be viewed. ';

        const sidebar = me.sidebar = new Panel({
            adopt      : 'sidebar',
            layout     : 'vbox',
            scrollable : {
                overflowY : 'auto'
            },
            items : {
                framework : {
                    type        : 'buttongroup',
                    cls         : 'framework-selector',
                    toggleGroup : true,
                    useGap      : true,
                    rendition   : 'text',
                    defaults    : {
                        cls : 'framework-tab'
                    },
                    items : {
                        all : {
                            pressed : framework === 'all',
                            text    : 'All demos',
                            badge   : store.count,
                            icon    : 'fa fa-asterisk',
                            tooltip : {
                                align : 't-b',
                                html  : 'Show all examples'
                            }
                        },
                        js : {
                            pressed : framework === 'js',
                            text    : 'JavaScript',
                            icon    : 'js',
                            badge   : store.getValueCount('tab', 'js'),
                            tooltip : {
                                align : 't-b',
                                html  : 'L{Button.tabJS}'
                            }
                        },
                        react : {
                            pressed : framework === 'react',
                            text    : 'React',
                            icon    : 'react',
                            badge   : store.getValueCount('tab', 'react'),
                            tooltip : {
                                align : 't-b',
                                html  : 'L{Button.tabReact}'
                            }
                        },
                        vue : {
                            pressed : framework === 'vue',
                            text    : 'Vue-3',
                            icon    : 'vue',
                            badge   : store.getValueCount('tab', 'vue'),
                            tooltip : {
                                align : 't-b',
                                html  : 'L{Button.tabVue}'
                            }
                        },
                        angular : {
                            pressed : framework === 'angular',
                            text    : 'Angular',
                            icon    : 'angular',
                            badge   : store.getValueCount('tab', 'angular'),
                            tooltip : {
                                align : 't-b',
                                html  : 'L{Button.tabAngular}'
                            }
                        }
                    },
                    onToggle({ source, pressed }) {
                        if (pressed) {
                            me.framework = source.ref;
                            me.filterDemos();
                            document.location.hash = '';
                        }
                    }
                },
                filterField : {
                    type       : 'filterfield',
                    spellCheck : false,
                    style      : 'margin-top : 1.5em',
                    store,
                    filterId   : 'text-filter',
                    filterFunction(record, value) {
                        // Check if all words in value exist in example title
                        return value?.toLowerCase().split(' ')
                            .every(word => ['title', 'version', 'folder', 'description']
                                .some(param => {
                                    if (word.toLowerCase() === 'thin' && record.thin) {
                                        return true;
                                    }
                                    return record[param]?.toLowerCase().includes(word);
                                })
                            );
                    },
                    placeholder : 'L{typeToFilter}',
                    triggers    : {
                        filter : {
                            cls   : 'fa fa-filter',
                            align : 'start'
                        }
                    },
                    listeners : {
                        change({ value, userAction }) {
                            saveToStorage('filter', value);

                            if (userAction && !VersionHelper.isTestEnv && me.isOnline && value.length > 3) {
                                me.logSearch(value);
                            }
                        }
                    }
                },
                jumpTo : {
                    type     : 'combo',
                    triggers : {
                        list : {
                            cls   : 'fa fa-list',
                            align : 'start'
                        }
                    },
                    editable                : false,
                    placeholder             : 'L{jumpTo}',
                    highlightExternalChange : false,
                    onSelect({
                        record,
                        userAction
                    }) {
                        if (userAction && record) {
                            if (record.id === 'top') {
                                me.scrollToElement(document.querySelector('#top'));
                                jumpTo.value = null;
                            }
                            else {
                                me.scrollToElement(document.querySelector(`a[data-group="${record.text}"]`));
                            }
                        }
                    }
                },
                newDemos : {
                    type : 'slidetoggle',
                    text : 'L{newDemos}',
                    onChange() {
                        me.filterDemos();
                    }
                },
                themeCombo : {
                    type     : 'combo',
                    // label         : 'L{Theme}',
                    // labelPosition : 'above',
                    editable : false,
                    value    : window.shared.theme,
                    items    : window.shared.themes,
                    style    : 'grid-column : span 2',
                    onAction({ value }) {
                        window.shared.applyTheme(value);
                    }
                },
                primaryColor : {
                    type           : 'colorfield',
                    value          : getComputedStyle(document.body).getPropertyValue('--b-primary'),
                    style          : 'grid-column : span 2',
                    addNoColorItem : false,
                    picker         : {
                        columns : 'auto'
                    },
                    colors : window.shared.colors,
                    onChange({ value }) {
                        document.body.style.setProperty('--b-primary', value);
                        GlobalEvents.trigger('primaryColorChange', { primaryColor : value });
                        BrowserHelper.setLocalStorageItem('b-example-primaryColor', value);
                    }
                },
                thumbSize : {
                    type        : 'buttongroup',
                    cls         : 'thumb-size',
                    toggleGroup : true,
                    rendition   : 'outlined',
                    items       : [
                        { tooltip : 'Small thumbs', icon : 'fa fa-image', cls : 'small-thumb', value : 'small-thumb' },
                        { tooltip : 'Medium thumbs', icon : 'fa fa-image', cls : 'medium-thumb', value : 'medium-thumb', pressed : true },
                        { tooltip : 'Large thumbs', icon : 'fa fa-image', cls : 'large-thumb', value : 'large-thumb' }

                    ],
                    onToggle({ source, pressed }) {
                        if (pressed) {
                            me.examplesContainerEl.classList.remove('small-thumb', 'medium-thumb', 'large-thumb');
                            me.examplesContainerEl.classList.add(source.value);
                        }
                    }
                    // onInput({ value }) {
                    //     me.examplesContainerEl.style.gridTemplateColumns = `repeat(auto-fit, minmax(${value}px, 1fr))`;
                    // }
                }
            }
        });

        // const toolbar = me.toolbar = new Toolbar({
        //     adopt : 'toolbar',
        //
        //     // Handled by media queries hiding elements
        //     overflow : null,
        //
        //     items : {
        //
        //         jumpTo : {
        //             type     : 'combo',
        //             width    : me.product.jumpWidth || '15em',
        //             triggers : {
        //                 list : {
        //                     cls   : 'fa fa-list',
        //                     align : 'start'
        //                 }
        //             },
        //             editable                : false,
        //             placeholder             : 'Jump to',
        //             highlightExternalChange : false,
        //             onSelect({
        //                 record,
        //                 userAction
        //             }) {
        //                 if (userAction && record) {
        //                     if (record.id === 'top') {
        //                         me.scrollToElement(document.querySelector('#top'));
        //                         jumpTo.value = null;
        //                     }
        //                     else {
        //                         me.scrollToElement(document.querySelector(`a[data-group="${record.text}"]`));
        //                     }
        //                 }
        //             }
        //         },
        //         separator  : '->',
        //         docsButton : {
        //             id        : 'docs-button',
        //             type      : 'button',
        //             rendition : 'text',
        //             text      : 'Documentation',
        //             icon      : 'fa fa-book-open',
        //             href      : '../docs/'
        //         }
        //     }
        // });
        //
        const {
            filterField,
            jumpTo
        } = me.sidebar.widgetMap;

        me.jumpTo = jumpTo;

        me.render();

        if (!me.testMode) {
            const storedFilter = loadFromStorage('filter');
            storedFilter && (filterField.value = storedFilter);
        }

        me.examplesContainerEl.addEventListener('focusin', me.onFocusIn.bind(me));

        me.logSearch = FunctionHelper.createBuffered(me.logSearch.bind(me), 1000);

        // If hash is provided, demos are filtered in scrollToLocationHash()
        if (!window.location.hash) {
            me.filterDemos();
        }
    }

    filterDemos() {
        const
            me                          = this,
            { framework, exampleStore } = me,
            { newDemos }                = me.sidebar.widgetMap;

        if (framework === 'all')  {
            exampleStore.clearFilters();
        }
        else {
            exampleStore.filter({
                id       : 'framework-filter',
                property : 'tab',
                operator : '=',
                value    : framework
            });
        }

        if (newDemos.checked) {
            exampleStore.filter({
                id       : 'new-filter',
                filterBy : example => this.compareVersion(example.updated) || this.compareVersion(example.since)
            });
        }
        else {
            exampleStore.removeFilter('new-filter');
        }

        // Reapply filtering
        const { filterField } = me.sidebar.widgetMap;
        if (filterField.value) {
            exampleStore.filter({
                id       : 'text-filter',
                filterBy : record => filterField.filterFunction(record, filterField.value)
            });
        }
        else {
            exampleStore.removeFilter('text-filter');
        }

        BrowserHelper.setLocalStorageItem('bryntum-framework', framework);

        me.jumpTo.items = [
            {
                id   : 'top',
                text : 'Top'
            }
        ].concat(
            exampleStore.groupRecords.map(r => ({
                id   : r.id,
                text : r.meta.groupRowFor
            }))
        );

        me.jumpTo.hidden = framework && framework !== 'js' && framework !== 'all';
    }

    logSearch(value) {
        fetch(`/examplesearchlog.php?phrase=${encodeURIComponent(value)}&product_id=${encodeURIComponent(this.product.name)}&nohits=${this.exampleStore.count === 0 ? '1' : ''}`).catch(e => {});
    }

    onFocusIn({ target }) {
        if (target?.id?.startsWith('b-example')) {
            this.exampleElements.forEach(example => example.classList[example === target ? 'add' : 'remove']('b-focused'));
            window.location.hash = `#${target?.id.replace(/^b-/, '')}`;
        }
    }

    scrollToLocationHash() {
        const
            me       = this,
            { hash } = window.location;

        // To prevent browser built-in scroll by location hash we use example and header ids with `b-` prefix
        if (hash) {
            // Select examples page
            const buttons = me.sidebar.widgetMap.framework.widgetMap;
            let button, match;
            if ((match = /-frameworks-(\w+)/.exec(hash))) {
                button = buttons[match[1]]/* || buttons[me.framework]*/;
            }
            else {
                button = buttons.js;
            }

            if (button) {
                button.pressed = true;
                me.filterDemos();
            }

            const element = document.getElementById(`b-${hash.split('#').pop()}`);
            if (element) {
                me.scrollToElement(element);
                element.classList.add('b-focused');
                element.focus();
            }
        }
        // If no hash, and user has scrolled while loading, scroll to saved pos
        else if (me.beforeLoadScrollTop > 0) {
            document.getElementById('browser').scrollTop = me.beforeLoadScrollPos;
        }
    }

    scrollToElement(element) {
        if (element) {
            element.scrollIntoView(!VersionHelper.isTestEnv && { behavior : 'smooth' });
        }
    }

    compareVersion(version) {
        const productVersion = VersionHelper.getVersion(this.product.name);
        return version && productVersion.startsWith(version.match(/^(\d+\.\d+)/)[1]);
    }

    getDomConfig() {
        const
            me        = this,
            // Use the getter which relies on DomHelper.themeInfo getter which creates a DOM element and extracts theme name from it,
            // otherwise switching between themes will not change the examples preview pictures.
            { theme } = window.shared,
            configs   = [];

        me.examplesStore.records.forEach(example => {
            if (example.isSpecialRow) {
                const group = example.meta.groupRowFor;

                let html = group;

                if (groupPaths[group]) {
                    const
                        tip   = me.isOnline ? 'Path in distribution after download' : 'Click to view files in the folder if local web server is configured to allow directory listing',
                        title = me.isOnline ? '' : 'Path in distribution';

                    html += `
                        <a ${!me.isOnline ? `href="${groupPaths[group]}" target="_blank"` : ''}>
                            <div class="group-path" data-btip-title="${title}" data-btip="${tip}"><i class="fa fa-folder"></i>examples/${groupPaths[group]}</div>
                        </a>
                    `;
                }

                configs.push(
                    {
                        tag       : 'h2',
                        id        : `b-group-${group.replace(/ /gm, '-').toLowerCase()}`,
                        className : {
                            'group-header' : 1,
                            [group]        : 1
                        },
                        dataset : {
                            syncId : `header-${group}`,
                            group
                        },
                        html
                    });
            }
            else {
                // Show build popup for examples marked as offline and for those who need building when demo browser is offline
                const
                    isSF     = example.folder === 'salesforce',
                    hasPopup = isSF || (example.build && !me.isOnline) || example.offline,
                    id       = example.id,
                    url      = isSF ? example.globalUrl : me.fixRTL(example.fullFolder);

                configs.push({
                    tag       : 'a',
                    className : {
                        example      : 1,
                        new          : me.compareVersion(example.since),
                        updated      : me.compareVersion(example.updated),
                        offline      : example.offline,
                        popular      : example.popular,
                        'b-colorize' : 1
                    },
                    id,
                    draggable : false,
                    href      : example.offline ? undefined : url,
                    target    : isSF ? '_blank' : undefined,
                    dataset   : {
                        linkText : hasPopup && me.exampleLinkText(example),
                        linkUrl  : hasPopup && url,
                        external : isSF,
                        syncId   : id,
                        group    : example.group
                    },
                    children : [
                        {
                            className : 'image',
                            children  : [
                                {
                                    tag       : 'img',
                                    draggable : false,
                                    // enable image lazy loading. we don't really need the image from the invisible area
                                    // https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#images_and_iframes
                                    loading   : 'lazy',
                                    src       : this.exampleThumbnail(example, theme),
                                    alt       : example.tooltip || example.title || '',
                                    dataset   : {
                                        group : example.group
                                    }
                                },
                                example.overlay ? {
                                    className : `overlay ${example.overlay}`
                                } : null
                            ]
                        },
                        {
                            // The b-widget class is needed to trigger the shared Tooltip overflow handling.
                            // That only works inside our widgets.
                            className : 'contents b-widget',
                            children  : [
                                {
                                    tag       : 'label',
                                    className : 'title',
                                    dataset   : {
                                        group : example.group
                                    },
                                    children : [
                                        {
                                            className : 'text',
                                            children  : [
                                                example.title
                                            ]
                                        },
                                        example.popular && {
                                            tag       : 'i',
                                            className : 'fa fa-star popular',
                                            dataset   : {
                                                btip : 'Popular example'
                                            }
                                        }
                                    ]
                                },
                                (example.version || example.thin) && {
                                    className : 'versions',
                                    children  : [
                                        example.version?.split('+').map(v => ({
                                            className : {
                                                version : 1
                                            },
                                            text : v.trim()
                                        })),
                                        example.thin ? {
                                            className : {
                                                version : 1,
                                                thin    : 1
                                            },
                                            text    : 'thin',
                                            dataset : {
                                                btip : 'Example uses thin product bundles'
                                            }
                                        } : null
                                    ].flat().filter(Boolean)
                                },
                                {
                                    className : 'description',
                                    html      : example.description
                                }
                            ]
                        }
                    ]
                });
            }
        });

        return configs;
    }

    refresh() {
        DomSync.sync({
            targetElement : this.examplesContainerEl,
            domConfig     : {
                onlyChildren : true,
                children     : this.getDomConfig()
            },
            releaseThreshold : 0,
            syncIdField      : 'syncId',
            strict           : true
        });

        this.exampleElements = document.querySelectorAll('.example');
    }

    render() {
        const me = this;

        me.refresh();

        document.body.addEventListener('error', me.onThumbError.bind(me), true);

        EventHelper.on({
            element : me.examplesContainerEl,
            click(event) {
                const el = event.target.closest('[data-link-url]');

                if (el.dataset.external !== 'true') {
                    new Popup({
                        forElement : el,
                        maxWidth   : '18em',
                        cls        : 'b-demo-unavailable',
                        header     : '<i class="fa fa-cog"></i> ' + (me.isOnline ? 'Download needed' : 'Needs building'),
                        html       : me.buildTip + `The demo can be found in distribution folder: <div class="tip-folder"><i class="fa fa-folder-open"></i><b>` +
                            (!me.isOnline ? `<a href="${el.dataset.linkUrl}">${el.dataset.linkText}</a>` : el.dataset.linkText) + '</b></div>',
                        closeAction  : 'destroy',
                        width        : el.getBoundingClientRect().width,
                        anchor       : true,
                        scrollAction : 'realign',
                        draggable    : false,
                        resizable    : false
                    });

                    event.preventDefault();
                }
            },
            delegate : '[data-link-url]'
        });

        EventHelper.on({
            element : me.examplesContainerEl,
            click(event) {
                // To be able to select example name, need to make the text do not work as a link
                if (window.getSelection().toString().length) {
                    event.preventDefault();
                }
            },
            delegate : 'a.example label'
        });



        me.rendered = true;
        me.scrollToLocationHash();
    }

    onThumbError(e) {
        if (e.target?.src?.includes('thumb')) {
            e.target.style.visibility = 'hidden';
        }
    }

    addTrailingSlash(folder) {
        return folder.endsWith('/') ? folder : `${folder}/`;
    }

    fixRTL(folder) {
        return this.rtl ? `${folder}?rtl` : folder;
    }

    exampleFolder(example, defaultRoot = '') {
        return `${example.rootFolder || defaultRoot}${example.folder}`;
    }

    exampleConfig(example) {
        return `${example.fullFolder}app.config.json`;
    }

    exampleId(example) {
        return `b-example-${this.exampleFolder(example).replace(/\.\.\//gm, '').replace(/\//gm, '-')}`;
    }

    exampleLinkText(example) {
        return this.exampleFolder(example, 'examples/').replace(/\.\.\//gm, '').replace(/\//gm, '/<wbr>');
    }

    exampleThumbnail(example, theme) {
        return `${example.fullFolder}meta/thumb.${theme.toLowerCase()}.png`;
    }

}

if (DomHelper.themeLoaded) {
    DomHelper.themeLoaded.then(() => window.demoBrowser = new ExamplesApp());
}
else {
    window.demoBrowser = new ExamplesApp();
}
