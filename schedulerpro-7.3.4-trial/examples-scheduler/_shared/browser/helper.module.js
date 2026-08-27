const
    { location : loc } = document,
    qs                 = new URLSearchParams(loc.search);

// This JS script should be ES5 version compatible to work in old browsers
// Redirect to UMD bundle for browsers without module support.
if (!/index\.umd\.html/.test(loc.href)) {
    const moduleSupport = 'noModule' in HTMLScriptElement.prototype;
    if (!moduleSupport) {
        document.location = 'index.umd.html' + loc.search;
    }
}

// Add RTL class early before code loads to RTL environment is always detectable
if (loc.search.split(/&|\?/).includes('rtl')) {
    document.documentElement.classList.add('b-rtl');
}
// if (qs.has('rtl')) {
//     document.documentElement.classList.add('b-rtl');
// }

if (loc.protocol === 'file:') {
    alert('WARNING: You should run examples on a Web server (not using the file: protocol)');
}

queueMicrotask(() => {
// Apply theme from local storage, if none is explicitly set for the demo
    if (!document.head.querySelector('link[data-bryntum-theme]') && !loc.pathname.includes('csp')) {
        const
            themeToUse  = window.theme = qs.get('theme') || localStorage.getItem('b-example-new-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'svalbard-dark' : 'svalbard-light'),
            isDarkTheme = themeToUse.endsWith('dark'),
            theme       = document.createElement('link'),
            style       = document.createElement('style');

        // Load theme from local storage (or the default)
        theme.rel = 'stylesheet';
        theme.href = (!window.isDemoBrowser ? '../' : '') + `../build/${themeToUse}.css`;
        theme.setAttribute('data-bryntum-theme', '');
        document.head.appendChild(theme);

        // Add color-scheme early, to avoid flash of wrong color
        style.innerHTML = `body { color-scheme : ${isDarkTheme ? 'dark' : 'light'}; }`;
        document.head.appendChild(style);
    }
});

// Detect legacy browsers non-Chrome Edge and IE11
if ((navigator.userAgent.match(/Edge/) && !navigator.userAgent.match(/Chrome/)) || navigator.userAgent.match(/rv:11/)) {
    alert('Your browser is not supported by Bryntum product!\nPlease use one of the modern browsers like Chrome, FireFox, Safari or Edge Chromium.');
}
