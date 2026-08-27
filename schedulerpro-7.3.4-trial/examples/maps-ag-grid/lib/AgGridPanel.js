import Panel from '../../../lib/Core/widget/Panel.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';
import GlobalEvents from '../../../lib/Core/GlobalEvents.js';
import Toast from '../../../lib/Core/widget/Toast.js';

const agGrid = window.agGrid;

export default class AgGridPanel extends Panel {
    // Factoryable type name
    static type = 'aggridpanel';

    static $name = 'AgGridPanel';

    construct({ gridProps }) {
        const me = this;

        super.construct(...arguments);

        // Create the AG Grid instance
        me.agGrid = agGrid.createGrid(me.contentElement, gridProps);

        // Switch theme for AG Grid when Bryntum theme changes
        GlobalEvents.on({
            theme   : 'onThemeChange',
            thisObj : me
        });

        me.setThemeStyle();


        Toast.show({
            html : `<p>This demo uses the <b>AG Grid Community Edition</b> 
                (<a href="https://github.com/ag-grid/ag-grid" target="_blank">GitHub</a>, 
                <a href="https://github.com/ag-grid/ag-grid/blob/latest/LICENSE.txt" target="_blank">License</a>).</p> 
                <p>It is a separately licensed 3rd party library not part of the Bryntum product.<br>
                If you plan to use AG Grid in your app, please review their licensing terms.</p>
            `,
            timeout : 10000
        });
    }

    setThemeStyle() {
        const colorScheme = DomHelper.isDarkTheme ? 'colorSchemeDark' : 'colorSchemeLight';

        this.agGrid.setGridOption('theme', agGrid.themeQuartz.withParams({
            fontFamily : 'inherit'
        }).withPart(agGrid[colorScheme]));
    }

    onThemeChange() {
        this.setThemeStyle();
    }
}

// Register this widget type with its Factory
AgGridPanel.initClass();
