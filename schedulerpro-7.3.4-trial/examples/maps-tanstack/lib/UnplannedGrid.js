import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';
import Panel from '../../../lib/Core/widget/Panel.js';

// Access TanStack Table from global scope (loaded via UMD)
const { createTable, getCoreRowModel, getSortedRowModel } = window.TableCore;

// Custom table widget using TanStack Table that displays unassigned appointments
export default class UnplannedGrid extends Panel {
    static type = 'unplannedgrid';
    static $name = 'UnplannedGrid';

    static configurable = {
        cls         : 'b-unplanned-grid no-demo-app-style', // Opt out of shared demo app styling
        flex        : '0 1 400px',
        collapsible : true,
        minHeight   : 0,
        header      : false,
        html        : `
            <div class="b-unplanned-grid-wrapper">
                <table class="b-unplanned-table">
                    <thead class="b-unplanned-table-head"></thead>
                    <tbody class="b-unplanned-table-body"></tbody>
                </table>
            </div>
        `,
        // Column definitions: accessorKey points to raw data, cell renderer formats for display
        columns : [
            {
                id          : 'name',
                header      : 'Unscheduled tasks',
                accessorKey : 'name',
                cell        : info => StringHelper.xss`<i class="fa fa-grip-vertical"></i> ${info.getValue()}`
            },
            {
                id          : 'location',
                header      : 'Location',
                accessorKey : 'address',
                cell        : info => StringHelper.encodeHtml(info.getValue()?.display_name || '')
            },
            {
                id          : 'duration',
                header      : 'Duration',
                accessorKey : 'fullDuration',
                cell        : info => {
                    const { fullDuration, durationUnit } = info.row.original;
                    return fullDuration ? DateHelper.formatDelta(fullDuration, durationUnit) : '';
                }
            },
            {
                id          : 'travelTime',
                header      : 'Travel time',
                accessorKey : 'preamble',
                cell        : info => {
                    const { preamble, durationUnit } = info.row.original;
                    return preamble ? DateHelper.formatDelta(preamble, durationUnit) : '';
                }
            },
            {
                id          : 'returnTime',
                header      : 'Return time',
                accessorKey : 'postamble',
                cell        : info => {
                    const { postamble, durationUnit } = info.row.original;
                    return postamble ? DateHelper.formatDelta(postamble, durationUnit) : '';
                }
            }
        ],
        tableState : {
            columnPinning : { left : [], right : [] },
            sorting       : []
        }
    };

    onPaint({ firstPaint }) {
        if (firstPaint) {
            // Set up event delegation for header clicks (only once)
            const thead = this.contentElement.querySelector('.b-unplanned-table-head');
            thead.addEventListener('click', (event) => {
                // Find the clicked TH element (bubble up from actual target)
                const th = event.target.closest('th');
                if (th) {
                    // Get the column from TanStack Table using the column ID
                    const column = this._table?.getColumn(th.dataset.columnId);
                    if (column) {
                        // Toggle sort direction (none → asc → desc → none)
                        column.toggleSorting();
                        // Re-render the table with new sort state
                        this.renderTable();
                    }
                }
            });

            this.renderTable();
        }
    }

    set project(project) {
        const me = this;
        me._project = project;

        // Chained store filters events with no assignments (unscheduled)
        me.store = project.eventStore.chain(eventRecord => !eventRecord.assignments.length);

        project.assignmentStore.on({
            change : () => {
                me.store.fillFromMaster();
                me.renderTable();
            },
            thisObj : me
        });

        me.store.fillFromMaster();
        me.renderTable();
    }

    renderTable() {
        const me = this;

        if (!me.rendered || !me.store || !me.columns) return;

        // Create TanStack Table instance (headless - provides logic, we render DOM manually)
        const table = createTable({
            data              : me.store.allRecords,
            columns           : me.columns,
            getCoreRowModel   : getCoreRowModel(),
            getSortedRowModel : getSortedRowModel(),
            state             : me.tableState,
            onStateChange     : updater => {
                me.tableState = updater(me.tableState);
            },
            renderFallbackValue : null
        });

        // Store table instance for event delegation
        me._table = table;

        const
            thead   = me.contentElement.querySelector('.b-unplanned-table-head'),
            headers = table.getFlatHeaders(),
            tbody   = me.contentElement.querySelector('.b-unplanned-table-body');

        // Render column headers
        thead.innerHTML = '<tr class="b-unplanned-row">' +
            // For each header
            headers.map(({ column }) => {
                let sortIconClass = 'fa-sort';
                // Pick sorting icon class
                switch (column.getIsSorted()) {
                    case 'asc':
                        sortIconClass = 'fa-sort-up';
                        break;
                    case 'desc':
                        sortIconClass = 'fa-sort-down';
                }
                return `
                    <th data-column-id="${column.id}">
                        <span>${StringHelper.encodeHtml(column.columnDef.header)}</span>
                        <i class="sort-icon fa ${sortIconClass}"></i>
                    </th>`;
            }).join('') +
            '</tr>';

        // Render table body rows
        tbody.innerHTML = table.getRowModel().rows.map(row => {
            return `<tr class="b-unplanned-row" data-id="${row.original.id}">` +
                // Render each visible cell of the row
                row.getVisibleCells().map(cell => {
                    const
                        renderFn = cell.column.columnDef.cell,
                        // If "cell" function is provided - call it, otherwise use the cell value
                        content  = renderFn ? renderFn(cell.getContext()) : StringHelper.encodeHtml(cell.getValue());
                    return `<td class="b-unplanned-cell">${content}</td>`;
                }).join('') +
                '</tr>';
        }).join('');
    }

}

UnplannedGrid.initClass();
