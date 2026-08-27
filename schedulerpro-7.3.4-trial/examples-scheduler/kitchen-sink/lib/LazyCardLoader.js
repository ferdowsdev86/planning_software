/**
 * LazyCardLoader - Handles lazy loading of bundles and widget instantiation using IntersectionObserver
 *
 * Usage:
 * 1. Initialize: await LazyCardLoader.init(bundlePaths)
 * 2. Register cards: LazyCardLoader.register(cardElement, widgetInfo)
 * 3. Widgets are created automatically when they enter the viewport
 */
export default class LazyCardLoader {
    static loadedBundles = new Map();  // bundleName -> module exports
    static pendingBundles = new Map(); // bundleName -> Promise
    static observer = null;
    static cardMap = new WeakMap();    // element -> widgetInfo
    static bundlePaths = {};
    static onCardCreated = null;

    /**
     * Initialize the lazy loader
     * @param {Object} bundlePaths - Map of bundle names to their import paths
     * @param {Object} [options] - Configuration options
     * @param {string} [options.rootMargin='200px'] - IntersectionObserver root margin
     * @param {Function} [options.onCardCreated] - Callback when a card is created
     */
    static async init(bundlePaths, options = {}) {
        this.bundlePaths = bundlePaths;
        this.onCardCreated = options.onCardCreated;

        this.observer = new IntersectionObserver(
            entries => this.handleIntersection(entries),
            {
                root       : document.querySelector('.widget-grid'),
                rootMargin : options.rootMargin || '200px',
                threshold  : 0
            }
        );
    }

    /**
     * Register a card for lazy loading
     * @param {HTMLElement} cardElement - The card DOM element
     * @param {Object} widgetInfo - Widget configuration with bundle and create function
     */
    static register(cardElement, widgetInfo) {
        this.cardMap.set(cardElement, { ...widgetInfo });
        this.observer.observe(cardElement);
    }

    /**
     * Preload all remaining bundles that haven't been loaded yet.
     * Call this after initial render to prepare for scrolling.
     */
    static preloadRemaining() {
        const callback = () => {
            Object.keys(this.bundlePaths).forEach(bundle => {
                if (!this.loadedBundles.has(bundle) && !this.pendingBundles.has(bundle)) {
                    this.loadBundle(bundle);
                }
            });
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(callback);
        }
        else {
            setTimeout(callback, 100);
        }
    }

    /**
     * Handle intersection events
     * @private
     */
    static async handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const widgetInfo = this.cardMap.get(entry.target);
                if (widgetInfo) {
                    this.cardMap.delete(entry.target); // Remove to prevent duplicate creation
                    await this.createWidget(entry.target, widgetInfo);
                }
            }
        }
    }

    /**
     * Load a bundle dynamically
     * @param {string} bundleName - Name of the bundle to load
     * @returns {Promise<Object>} - The loaded module exports
     */
    static async loadBundle(bundleName) {
        // Already loaded
        if (this.loadedBundles.has(bundleName)) {
            return this.loadedBundles.get(bundleName);
        }

        // Currently loading
        if (this.pendingBundles.has(bundleName)) {
            return this.pendingBundles.get(bundleName);
        }

        const path = this.bundlePaths[bundleName];
        if (!path) {
            console.warn(`Unknown bundle: ${bundleName}`);
            return {};
        }

        const promise = import(path).then(module => {
            this.loadedBundles.set(bundleName, module);
            this.pendingBundles.delete(bundleName);
            return module;
        });

        this.pendingBundles.set(bundleName, promise);
        return promise;
    }

    /**
     * Load multiple bundles
     * @param {string|string[]} bundles - Bundle name(s) to load
     * @returns {Promise<Object>} - Combined exports from all bundles
     */
    static async loadBundles(bundles) {
        const
            bundleList = Array.isArray(bundles) ? bundles : [bundles || 'core'],
            modules    = await Promise.all(bundleList.map(b => this.loadBundle(b)));

        // Merge all exports into one object, starting with core exports
        return Object.assign({}, ...modules);
    }

    /**
     * Create a widget in a card
     * @param {HTMLElement} cardElement - The card element
     * @param {Object} widgetInfo - Widget configuration
     */
    static async createWidget(cardElement, widgetInfo) {
        const content = cardElement.querySelector('.widget-card-content');

        try {
            // If widget has a bundle dependency, load it lazily
            if (widgetInfo.bundle) {
                // Show loading state only for lazy-loaded bundles
                content.classList.add('b-loading');

                const exports = await this.loadBundles(widgetInfo.bundle);

                // Remove loading state
                content.classList.remove('b-loading');

                // Create the widget, passing loaded exports
                widgetInfo.create(content, exports);
            }
            else {
                // No bundle dependency - widget uses statically imported classes
                widgetInfo.create(content);
            }

            // Stop observing this card
            this.observer.unobserve(cardElement);

            // Callback
            this.onCardCreated?.(cardElement, widgetInfo);
        }
        catch (error) {
            content.classList.remove('b-loading');
            content.innerHTML = `<div class="load-error">Failed to load: ${error.message}</div>`;
            console.error(`Failed to create widget ${widgetInfo.name}:`, error);
        }
    }

    /**
     * Force-create all pending widgets (useful for testing or print)
     */
    static async createAll() {
        const promises = [];
        document.querySelectorAll('.widget-card').forEach(card => {
            const widgetInfo = this.cardMap.get(card);
            if (widgetInfo) {
                // Remove from map to prevent double-creation
                this.cardMap.delete(card);
                promises.push(this.createWidget(card, widgetInfo));
            }
        });
        await Promise.all(promises);
    }

    /**
     * Check if a bundle is loaded
     * @param {string} bundleName
     * @returns {boolean}
     */
    static isBundleLoaded(bundleName) {
        return this.loadedBundles.has(bundleName);
    }

    /**
     * Get loaded bundle exports
     * @param {string} bundleName
     * @returns {Object|undefined}
     */
    static getBundle(bundleName) {
        return this.loadedBundles.get(bundleName);
    }

    /**
     * Destroy the loader
     */
    static destroy() {
        this.observer?.disconnect();
        this.observer = null;
        this.loadedBundles.clear();
        this.pendingBundles.clear();
    }
}
