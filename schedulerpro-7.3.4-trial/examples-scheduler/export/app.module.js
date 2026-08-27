import shared from '../_shared/shared.module.js';
import { DateHelper, DataGenerator, Scheduler } from '../../build/schedulerpro.module.js';

const headerTpl = ({ currentPage, totalPages }) => `
    <img alt="Company logo" src="resources/bryntum.svg"/>
    <dl>
        <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
        <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
    </dl>
    `;

const
    footerTpl = () => `<h3>© ${new Date().getFullYear()} Bryntum AB</h3></div>`,
    today     = DateHelper.clearTime(new Date()),
    scheduler = new Scheduler({
        appendTo   : 'container',
        // Enables smoother wheel and pinch zooming
        smoothZoom : true,
        eventStyle : 'bordered',
        rowHeight  : 50,

        ...DataGenerator.generateEvents({
            viewStartDate : today,
            viewEndDate   : DateHelper.add(today, 7, 'weeks'),
            nbrResources  : 100,
            nbrEvents     : 5,
            tickUnit      : 'day',
            minDuration   : 4,
            dependencies  : true
        }),
        columns : [
            { type : 'rownumber' },
            { text : 'First name', field : 'firstName', flex : 1 },
            { text : 'Surname', field : 'surName', flex : 1 },
            { type : 'number', text : 'Score', field : 'score', flex : 1 }
        ],
        subGridConfigs : {
            locked : {
                width : 400
            }
        },

        features : {
            dependencies : {
                disabled : true
            },
            pdfExport : {
                exporterType            : 'multipagevertical',
                exportServer            : 'http://localhost:8080/',
                // Required for font-awesome icons to display correctly
                translateURLsToAbsolute : 'http://localhost:8080/resources/',
                filterStyles            : styles => styles.filter(item => {
                    // Filter out large style related to embedded monaco editor. Only relevant for Bryntum demos.
                    return !item.match(/<style .+monaco-colors/) && !item.match(/<link .+monaco/);
                }),
                headerTpl,
                footerTpl,
                sendAsBinary : true
            }
        },

        tbar : [
            {
                type : 'slidetoggle',
                text : 'Show dependencies',
                onChange({ checked }) {
                    scheduler.features.dependencies.disabled = !checked;
                }
            },
            {
                ref  : 'exportButton',
                type : 'button',
                icon : 'fa fa-file-export',
                text : 'Export',
                onClick() {
                    scheduler.features.pdfExport.showExportDialog();
                }
            },
            {
                type  : 'slidetoggle',
                label : 'Use WebSocket',
                value : true,
                onChange({ value }) {
                    scheduler.features.pdfExport.webSocketAvailable = value;
                }
            },
            {
                type  : 'slidetoggle',
                label : 'Download directly',
                value : true,
                onChange({ value }) {
                    scheduler.features.pdfExport.sendAsBinary = value;
                }
            }
        ]
    });
