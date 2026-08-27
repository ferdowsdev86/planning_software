//<code-header>
CSSHelper.insertRule(':host { background : var(--b-panel-background); border-radius : var(--b-widget-border-radius-large); overflow : hidden; box-shadow : var(--b-elevation-1); }', targetElement.getRootNode());
CSSHelper.insertRule('.b-panel-header, .b-panel-content { padding-inline : 0 }', targetElement.getRootNode());
CSSHelper.insertRule('.b-panel-header { padding-block : 0.5em }', targetElement.getRootNode());
CSSHelper.insertRule('.b-panel-header .b-tool { color : inherit }', targetElement.getRootNode());
CSSHelper.insertRule('.b-fiddle-theme-container { display : grid; grid-template-columns : repeat(2, 1fr); }', targetElement.getRootNode());
//</code-header>
const chart = new Chart({
    appendTo     : targetElement,
    type         : 'chart',
    style        : 'align-self : start',
    height       : '400px',
    title        : 'Sales',
    subtitle     : 'By SKU, All Regions',
    showTitle    : true,
    showSubtitle : true,
    series       : [{
        field : 'y1',
        label : 'Product 1'
    }, {
        field : 'y2',
        label : 'Product 2'
    }],
    labels : {
        field : 'x'
    },
    data : [
        { x : 'Q1', y1 : 3, y2 : 5 },
        { x : 'Q2', y1 : 6, y2 : 4 },
        { x : 'Q3', y1 : 4, y2 : 7 },
        { x : 'Q4', y1 : 8, y2 : 9 }
    ]
});

const container = new Container({
    appendTo : targetElement,
    layout   : 'vbox',
    style    : { 'font-size' : '13px', 'flex-direction' : 'column', 'align-items' : 'stretch', gap : 0 },
    margin   : '0 0 0 10',
    defaults : {
        type        : 'panel',
        collapsible : {
            onPanelHeaderClick({ source }) {
                source.toggleCollapsed();
            }
        },
        collapsed : true
    },
    items : [
        {
            title     : 'Title Font',
            collapsed : false,
            items     : [{
                type              : 'fontpicker',
                value             : chart.titleFont,
                internalListeners : {
                    change : ({ value }) => chart.titleFont = value
                }
            }]
        },
        {
            title : 'Subtitle Font',
            items : [{
                type              : 'fontpicker',
                value             : chart.subtitleFont,
                internalListeners : {
                    change : ({ value }) => chart.subtitleFont = value
                }
            }]
        },
        {
            title : 'Chart Padding',
            items : [{
                type              : 'boxpaddingpicker',
                internalListeners : {
                    change : ({ value }) => chart.chartPadding = value
                }
            }]
        },
        {
            title : 'Background',
            items : {
                backgroundColor : {
                    type              : 'colorfield',
                    internalListeners : {
                        change : ({ value }) => chart.background = value
                    }
                }
            }
        },
        {
            title : 'Axes',
            items : {
                axisColor : {
                    type              : 'colorfield',
                    text              : 'Axis Color',
                    value             : chart.axisColor,
                    internalListeners : {
                        change : ({ value }) => chart.axisColor = value
                    }
                }
            }
        },
        {
            title : 'Data Points',
            items : {
                dataPointShape : {
                    type                  : 'combo',
                    text                  : 'Point Shape',
                    localizeDisplayFields : true,
                    value                 : chart.dataPointShape,
                    listItemTpl           : ({ text, icon }) => `<div>${icon ? `<i class="fa fa-${icon}"></i> ` : ''}${text}</div>`,
                    items                 : [
                        { value : 'square', text : 'Square', icon : 'square' },
                        { value : 'circle', text : 'Circle', icon : 'circle' },
                        { value : 'diamond', text : 'Diamond', icon : 'diamond' },
                        { value : 'none', text : 'None' }
                    ],
                    internalListeners : {
                        change : ({ value }) => chart.dataPointShape = value
                    }
                }
            }
        },
        {
            title : 'Data Series',
            css   : {
                gap : 0
            },
            items : [
                {
                    title : 'Line Thickness',
                    type  : 'panel',
                    items : [
                        {
                            type              : 'numberfield',
                            value             : chart.seriesLineThickness,
                            internalListeners : {
                                change : ({ value }) => chart.seriesLineThickness = value
                            }
                        }
                    ]
                },
                {
                    title     : 'Line Dash',
                    type      : 'panel',
                    collapsed : true,
                    items     : [
                        {
                            type  : 'combo',
                            value : chart.seriesLineDash,
                            items : [
                                { value : 'solid', text : 'Solid' },
                                { value : 'dot', text : 'Dotted' },
                                { value : 'dash', text : 'Dashed' }
                            ],
                            internalListeners : {
                                change : ({ value }) => chart.seriesLineDash = value
                            }
                        }
                    ]
                },
                {
                    title : 'Opacity',
                    type  : 'panel',
                    items : [{
                        type              : 'sliderwithfield',
                        value             : Math.round(chart.seriesLineOpacity * 100),
                        text              : 'Opacity',
                        unit              : '%',
                        internalListeners : {
                            input : ({ value }) => chart.seriesLineOpacity = value / 100
                        }
                    }]
                }
            ]
        }
    ]
});

// Without this, only the last child panel gets onPanelHeaderClick
// for (const panel of container.widgetMap.items) {
//     panel.afterRecompose();
// }
