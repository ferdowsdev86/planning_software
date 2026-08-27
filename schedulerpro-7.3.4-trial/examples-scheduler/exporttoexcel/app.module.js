import shared from '../_shared/shared.module.js';
import { DateHelper, WriteExcelFileProvider, Scheduler, StringHelper, Toast } from '../../build/schedulerpro.module.js';
// not required, our example styling etc.

const scheduler = new Scheduler({
    appendTo       : 'container',
    // Enables smoother wheel and pinch zooming
    smoothZoom     : true,
    eventStyle     : 'bordered',
    resourceImages : {
        path      : '../_shared/images/transparent-users/',
        extension : '.png'
    },

    features : {
        excelExporter : {
            dateFormat  : null,
            xlsProvider : WriteExcelFileProvider
        }
    },

    subGridConfigs : {
        locked : { width : 400 }
    },

    columns : [
        {
            type : 'resourceInfo',
            text : 'Staff'
        },
        {
            text   : 'Type',
            field  : 'role',
            flex   : 1,
            editor : {
                type        : 'combo',
                items       : ['Core developer', 'Tech Sales', 'Sales', 'Developer & UX', 'CEO', 'CTO'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    barMargin  : 2,
    rowHeight  : 50,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },

    // Specialized event bar template with header and footer
    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = 'background-color:' + resourceRecord.color;

        return StringHelper.xss`
            <section>
                <div class="b-sch-event-header">${ DateHelper.format(eventRecord.startDate, 'LT')}</div>
                <div class="b-sch-event-footer">${eventRecord.name || ''}</div>
            </section>
        `;
    },

    tbar : [
        {
            type : 'widget',
            cls  : 'b-has-label',
            html : '<label>Export</label>'
        },
        {
            type  : 'buttongroup',
            items : [
                {
                    type     : 'button',
                    text     : 'Default settings',
                    ref      : 'excelExportBtn1',
                    icon     : 'fa fa-file-export',
                    onAction : () => scheduler.features.excelExporter.export()
                },
                {
                    type     : 'button',
                    text     : 'Custom column width',
                    ref      : 'excelExportBtn2',
                    icon     : 'fa fa-file-export',
                    onAction : () => scheduler.features.excelExporter.export({
                        filename       : 'Export with column width specified',
                        exporterConfig : {
                            // Choose the Resource fields to include in the exported file
                            resourceColumns : [{ text : 'Staff', field : 'name' }],
                            // Choose the Event fields to include in the exported file
                            eventColumns    : [
                                { text : 'Task', field : 'name', width : 200 },
                                { text : 'Starts', field : 'startDate', width : 200 },
                                { text : 'Ends', field : 'endDate', width : 200 }
                            ]
                        }
                    })
                },
                {
                    type     : 'button',
                    text     : 'All event fields',
                    ref      : 'excelExportBtn3',
                    icon     : 'fa fa-file-export',
                    onAction : () => {
                        const fields = [];

                        // The superclass fieldMaps are all prototype chained in, so no hasOwnProperty required
                        for (const fieldName in scheduler.eventStore.modelClass.fieldMap) {
                            const fieldDef = scheduler.eventStore.modelClass.fieldMap[fieldName];

                            if (fieldDef.persist !== false) {
                                fields.push({ field : fieldName, text : fieldName, type : fieldDef.type });
                            }
                        }

                        scheduler.features.excelExporter.export({
                            filename       : 'Export all event fields',
                            exporterConfig : {
                                eventColumns : fields
                            }
                        });
                    }
                }
            ]
        }
    ]
});


Toast.show({
    html : `<p>This demo uses the <b>write-excel-file</b> library to show how to export to Excel (<a href="https://www.npmjs.com/package/write-excel-file">NPM</a>, 
            <a href="https://gitlab.com/catamphetamine/write-excel-file/-/blob/main/LICENSE">MIT License</a>).</p> 
            <p>It is a separately licensed 3rd party library not part of the Bryntum product.</p>`,
    timeout : 10000
});
