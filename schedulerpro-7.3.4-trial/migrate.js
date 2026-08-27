#!/usr/bin/env node
'use strict';

/**
 * Bryntum 6 → 7 Migration Tool
 * Helps migrate code from Bryntum 6 to 7. Be sure to examine changes before committing them after running this tool.
 *
 * Usage:
 *   node migrate.js <path> [options]
 *
 *   <path> can be either a directory or a single file
 *
 * Options:
 *   --migrations <types>    Comma-separated list of migration types to run (default: css,fonts)
 *                           Available: css, fonts, all
 *   --selectors <path>      Path to selectors.md file (optional, uses inline selectors by default)
 *   --include <pattern>     Include file pattern (wildcards supported, can be used multiple times)
 *   --exclude <pattern>     Exclude file pattern (wildcards supported, can be used multiple times)
 *   --dry-run               Show what would be changed without making changes
 *   --help                  Show this help message
 *
 * Examples:
 *   # Migrate a directory
 *   node migrate.js ./my-project
 *   node migrate.js ./my-project --migrations css
 *   node migrate.js ./my-project --migrations fonts
 *   node migrate.js ./my-project --migrations css,fonts
 *   node migrate.js ./my-project --selectors ./custom-selectors.md
 *   node migrate.js ./my-project --include "*.js" --include "*.scss"
 *   node migrate.js ./my-project --exclude "node_modules/**" --exclude "dist/**"
 *   node migrate.js ./my-project --dry-run
 *
 *   # Migrate a single file
 *   node migrate.js ./my-file.css
 *   node migrate.js ./src/styles.css --migrations css
 *   node migrate.js ./app.js --migrations fonts --dry-run
 */

const fs = require('fs');
const path = require('path');

const selectors = `
| Old                                         | New                                             |
|---------------------------------------------|-------------------------------------------------|
| .b-buttongroup                              | .b-button-group                                 |
| .b-calendarpanel                            | .b-calendar-panel                               |
| .b-chipview                                 | .b-chip-view                                    |
| .b-colorfield                               | .b-colorfield                                   |
| .b-colorbox                                 | .b-color-box                                    |
| .b-nonworkingday                            | .b-non-working-day                              |
| .b-colorpicker                              | .b-color-picker                                 |
| .b-uses-chipview                            | .b-uses-chip-view                               |
| .b-confirmationbar                          | .b-confirmation-bar                             |
| .b-datefield                                | .b-date-field                                   |
| .b-fieldcontainer                           | .b-field-container                              |
| .b-daterangefield                           | .b-date-range-field                             |
| .b-daterangepicker                          | .b-date-range-picker                            |
| .b-daterangefield-picker                    | .b-date-range-field-picker                      |
| .b-datetimefield                            | .b-date-time-field                              |
| .b-displayfield                             | .b-display-field                                |
| .b-numberfield                              | .b-number-field                                 |
| .b-textfield                                | .b-text-field                                   |
| .b-textareafield                            | .b-text-area-field                              |
| .b-fieldfilterpicker                        | .b-field-filter-picker                          |
| .b-fieldfilterpickergroup                   | .b-field-filter-picker-group                    |
| .b-fieldset                                 | .b-field-set                                    |
| .b-radiogroup                               | .b-radio-group                                  |
| .b-multiselect                              | .b-multi-select                                 |
| .b-menuitem                                 | .b-menu-item                                    |
| .b-messagedialog                            | .b-message-dialog                               |
| .b-multidatepicker                          | .b-multi-date-picker                            |
| .b-datepicker                               | .b-date-picker                                  |
| .b-pagingtoolbar                            | .b-paging-toolbar                               |
| .b-pickerfield                              | .b-picker-field                                 |
| .b-slidetoggle                              | .b-slide-toggle                                 |
| .b-draghelper                               | .b-drag-helper                                  |
| .b-durationfield                            | .b-duration-field                               |
| .b-monthpicker                              | .b-month-picker                                 |
| .b-yearpicker                               | .b-year-picker                                  |
| .b-richtextfield                            | .b-rich-text-field                              |
| .b-tabbar                                   | .b-tab-bar                                      |
| .b-tabpanel                                 | .b-tab-panel                                    |
| .b-textareapickerfield                      | .b-text-area-picker-field                       |
| .b-timefield                                | .b-time-field                                   |
| .b-timepicker                               | .b-time-picker                                  |
| .b-hide-othermonth-cells                    | .b-hide-other-month-cells                       |
| .b-checkboxgroup                            | .b-checkbox-group                               |
| .b-fieldtrigger                             | .b-field-trigger                                |
| .b-filepicker                               | .b-file-picker                                  |
| .b-sftimepicker                             | .b-sftime-picker                                |
| .b-undoredo                                 | .b-undo-redo                                    |
| .b-actioncolumn                             | .b-action-column                                |
| .b-grid-subgrid                             | .b-grid-sub-grid                                |
| .b-gridbase                                 | .b-grid-base                                    |
| .b-columnresize                             | .b-column-resize                                |
| .b-exportdialog                             | .b-export-dialog                                |
| .b-grid-treegroup                           | .b-grid-tree-group                              |
| .b-stickycells                              | .b-sticky-cells                                 |
| .b-rowresize                                | .b-row-resize                                   |
| .b-rownumber-cell                           | .b-row-number-cell                              |
| .b-rowexpander                              | .b-row-expander                                 |
| .b-singlepageunscaled                       | .b-single-page-unscaled                         |
| .b-mergecells                               | .b-merge-cells                                  |
| .b-columndragtoolbar                        | .b-column-drag-toolbar                          |
| .b-chartdesigner                            | .b-chart-designer                               |
| .b-celltooltip                              | .b-cell-tooltip                                 |
| .b-percentdone                              | .b-percent-done                                 |
| .b-checklistfiltercombo                     | .b-checklist-filter-combo                       |
| .b-groupbar                                 | .b-group-bar                                    |
| .b-timeaxissubgrid                          | .b-time-axis-sub-grid                           |
| .b-autoheight                               | .b-auto-height                                  |
| .b-grid-notextselection                     | .b-grid-no-text-selection                       |
| .b-resourcecollapse                         | .b-resource-collapse                            |
| .b-schedulerbase                            | .b-scheduler-base                               |
| .b-sch-timeaxis-cell                        | .b-sch-time-axis-cell                           |
| .b-timeline-subgrid                         | .b-timeline-sub-grid                            |
| .b-columnlines                              | .b-column-lines                                 |
| .b-dependencyeditor                         | .b-dependency-editor                            |
| .b-eventdrag                                | .b-event-drag                                   |
| .b-timelinebase                             | .b-timeline-base                                |
| .b-dragcreating                             | .b-drag-creating                                |
| .b-dragselect                               | .b-drag-select                                  |
| .b-eventeditor                              | .b-event-editor                                 |
| .b-eventresize                              | .b-event-resize                                 |
| .b-eventtip                                 | .b-event-tip                                    |
| .b-timeranges                               | .b-time-ranges                                  |
| .b-sch-nonworkingtime                       | .b-sch-non-working-time                         |
| .b-sch-resourcetimerange                    | .b-sch-resource-time-range                      |
| .b-sch-scheduletip                          | .b-sch-schedule-tip                             |
| .b-scrollbuttons                            | .b-scroll-buttons                               |
| .b-simpleeventeditor                        | .b-simple-event-editor                          |
| .b-stickyevents                             | .b-sticky-events                                |
| .b-sch-summmarybar                          | .b-sch-summary-bar                              |
| .b-sch-timeaxis-menu-daterange-popup        | .b-sch-time-axis-menu-date-range-popup          |
| .b-eventfilter                              | .b-event-filter                                 |
| .b-sch-timerange                            | .b-sch-time-range                               |
| .b-dragging-timerange                       | .b-dragging-time-range                          |
| .b-sch-timeranges-with-headerelements       | .b-sch-time-ranges-with-header-elements         |
| .b-treesummary                              | .b-tree-summary                                 |
| .b-sch-clockwrap                            | .b-sch-clock-wrap                               |
| .b-recurrenceconfirmationpopup              | .b-recurrence-confirmation-popup                |
| .b-recurrenceeditor                         | .b-recurrence-editor                            |
| .b-recurrencedayscombo                      | .b-recurrence-days-combo                        |
| .b-recurrencepositionscombo                 | .b-recurrence-positions-combo                   |
| .b-recurrencedaysbuttongroup                | .b-recurrence-days-button-group                 |
| .b-recurrencemonthsbuttongroup              | .b-recurrence-months-button-group               |
| .b-recurrencemonthdaysbuttongroup           | .b-recurrence-month-days-button-group           |
| .b-recurrencelegendbutton                   | .b-recurrence-legend-button                     |
| .b-sch-header-timeaxis-cell                 | .b-sch-header-time-axis-cell                    |
| .b-horizontaltimeaxis                       | .b-horizontal-time-axis                         |
| .b-resourceheader                           | .b-resource-header                              |
| .b-eventbuffer                              | .b-event-buffer                                 |
| .b-verticaltimeaxiscolumn                   | .b-vertical-time-axis-column                    |
| .b-verticaltimeaxis                         | .b-vertical-time-axis                           |
| .b-timelinehistogram                        | .b-timeline-histogram                           |
| .b-daybuttons                               | .b-day-buttons                                  |
| .b-resourcecombo                            | .b-resource-combo                               |
| .b-sch-timeaxiscolumn                       | .b-sch-time-axis-column                         |
| .b-sch-tooltip-startdate                    | .b-sch-tooltip-start-date                       |
| .b-sch-tooltip-enddate                      | .b-sch-tooltip-end-date                         |
| .b-timeaxis                                 | .b-time-axis                                    |
| .b-sch-event-withicon                       | .b-sch-event-with-icon                          |
| .b-verticaltimeaxis-row                     | .b-vertical-time-axis-row                       |
| .b-eventlayout                              | .b-event-layout                                 |
| .b-resourcefilter                           | .b-resource-filter                              |
| .b-versiongrid                              | .b-version-grid                                 |
| .b-sch-resourcenonworkingtime               | .b-sch-resource-non-working-time                |
| .b-percentbar                               | .b-percent-bar                                  |
| .b-schedulerprobase                         | .b-scheduler-pro-base                           |
| .b-nestedevents                             | .b-nested-events                                |
| .b-resourcehistogram                        | .b-resource-histogram                           |
| .b-resourceutilization                      | .b-resource-utilization                         |
| .b-calendareditoravailabilityrangecontainer | .b-calendar-editor-availability-range-container |
| .b-calendareditorbasetab                    | .b-calendar-editor-base-tab                     |
| .b-calendareditorexceptiontab               | .b-calendar-editor-exception-tab                |
| .b-calendareditordatepicker                 | .b-calendar-editor-date-picker                  |
| .b-calendareditordateinfo                   | .b-calendar-editor-date-info                    |
| .b-calendareditorlegend                     | .b-calendar-editor-legend                       |
| .b-calendareditorweekgrid                   | .b-calendar-editor-week-grid                    |
| .b-calendareditorweektab                    | .b-calendar-editor-week-tab                     |
| .b-calendareditor                           | .b-calendar-editor                              |
| .b-dependencytab                            | .b-dependency-tab                               |
| .b-notestab                                 | .b-notes-tab                                    |
| .b-resourcestab                             | .b-resources-tab                                |
| .b-calendarfield                            | .b-calendar-field                               |
| .b-resourceeditorratetablestab              | .b-resource-editor-rate-tables-tab              |
| .b-resourceeditor                           | .b-resource-editor                              |
| .b-resourcegrid                             | .b-resource-grid                                |
| .b-resource-rate-table-editor               | .b-resource-rate-table-editor                   |
| .b-schedulerpro-issueresolutionpopup        | .b-scheduler-pro-issue-resolution-popup         |
| .b-taskeditorbase                           | .b-task-editor-base                             |
| .b-taskeditor                               | .b-task-editor                                  |
| .b-schedulerpro-taskeditor                  | .b-scheduler-pro-task-editor                    |
| .b-timeline-startdate                       | .b-timeline-start-date                          |
| .b-timeline-enddate                         | .b-timeline-end-date                            |
| .b-taskboardbase                            | .b-task-board-base                              |
| .b-taskboardfieldfilterpickergroup          | .b-task-board-field-filter-picker-group         |
| .b-columnlock                               | .b-column-lock                                  |
| .b-taskboard-column-filterbar               | .b-task-board-column-filter-bar                 |
| .b-resourcescombo                           | .b-resources-combo                              |
| .b-taskboard-taskitem                       | .b-task-board-task-item                         |
| .b-tagcombo                                 | .b-tag-combo                                    |
| .b-todolistfield                            | .b-todo-list-field                              |
| .b-taskboard                                | .b-task-board                                   |
| .b-ganttbase                                | .b-gantt-base                                   |
| .b-gantt-taskdrag                           | .b-gantt-task-drag                              |
| .b-projecteditor                            | .b-project-editor                               |
| .b-resourceassignment                       | .b-resource-assignment                          |
| .b-tasknonworkingtime                       | .b-task-non-working-time                        |
| .b-assignmentfield                          | .b-assignment-field                             |
| .b-assignmentgrid                           | .b-assignment-grid                              |
| .b-assignmentpicker                         | .b-assignment-picker                            |
| .b-monthview                                | .b-month-view                                   |
| .b-yearview                                 | .b-year-view                                    |
| .b-calendarmixin                            | .b-calendar-mixin                               |
| .b-expand-allday-button                     | .b-expand-all-day-button                        |
| .b-agendaview-dayselector                   | .b-agenda-view-day-selector                     |
| .b-agendaview                               | .b-agenda-view                                  |
| .b-cal-timerange                            | .b-cal-time-range                               |
| .b-weekexpander                             | .b-week-expander                                |
| .b-resourceview                             | .b-resource-view                                |
| .b-resource-dayview-timeaxis                | .b-resource-day-view-time-axis                  |
| .b-resource-dayview-scroller                | .b-resource-day-view-scroller                   |
| .b-dayview-timeaxis                         | .b-day-view-time-axis                           |
| .b-dayview-allday                           | .b-day-view-all-day                             |
| .b-dayview-with-dayselector                 | .b-day-view-with-day- selector                  |
| .b-dayview-hourheight                       | .b-day-view-hour-height                         |
| .b-dayview                                  | .b-day-view                                     |
| .b-eventlist                                | .b-event-list                                   |
| .b-resourcedayviewtimeaxis                  | .b-resource-day-view-time-axis                  |
| .b-resourcechipview                         | .b-resource-chip-view                           |
| .b-overflowpopup                            | .b-overflow-popup                               |
| .b-daycellcollecter                         | .b-day-cell-collecter                           |
| .b-disable-othermonth                       | .b-disable-other-month                          |
| .b-monthgrid                                | .b-month-grid                                   |
| .b-monthagendaview                          | .b-month-agenda-view                            |
| .b-calendar-fullweek                        | .b-calendar-full-week                           |
| .b-modeselector                             | .b-mode-selector                                |
| .b-calendarevents                           | .b-calendar-events                              |
| .b-calendarrow                              | .b-calendar-row                                 |
| .b-dayselector                              | .b-day-selector                                 |
| .b-weekview-with-dayselector                | .b-week-view-with-day-selector                  |
| .b-weekview                                 | .b-week-view                                    |
| .b-has-allday                               | .b-has-all-day                                  |
| .b-dayresourceview                          | .b-day-resource-view                            |
| .b-dayresource-allday                       | .b-day-resource-all-day                         |
| .b-dayresourcecalendarrow                   | .b-day-resource-calendar-row                    |
| .b-resourcecalendarrow                      | .b-resource-calendar-row                        |
| .b-dayname-date                             | .b-day-name-date                                |
| .b-dayagendaview                            | .b-day-agenda-view                              |
| .b-multidayview                             | .b-multi-day-view                               |
| .b-hide-timeaxis                            | .b-hide-time-axis                               |
| .b-calendardatepicker                       | .b-calendar-date-picker                         |
| .b-agendacolumn                             | .b-agenda-column                                |
| .b-calendar-viewcontainer                   | .b-calendar-view-container                      |
`;

// ============================================================================
// Migration Modules (inlined for easy distribution)
// ============================================================================

/**
 * CSS Classes Migration Module
 * Migrates Bryntum CSS class names from v6 to v7 format
 */
const cssMigration = {
    name        : 'css',
    description : 'Migrate CSS class names (e.g., b-calendarpanel → b-calendar-panel)',

    /**
     * Initialize the migration with options
     * @param {Object} options - Migration options
     * @param {String} options.selectorsPath - Path to selectors.md file (optional, uses inline selectors if not provided)
     * @returns {Object} Migration state
     */
    init(options = {}) {
        let selectorsContent = null;
        let selectorsSource = 'inline';

        if (options.selectorsPath) {
            // Use provided file path
            const selectorsPath = path.isAbsolute(options.selectorsPath)
                ? options.selectorsPath
                : path.resolve(process.cwd(), options.selectorsPath);

            if (!fs.existsSync(selectorsPath)) {
                throw new Error(`Selectors file not found: ${selectorsPath}`);
            }

            selectorsContent = fs.readFileSync(selectorsPath, 'utf-8');
            selectorsSource = selectorsPath;
        }
        else {
            // Use inline selectors constant as default
            if (typeof selectors === 'string' && selectors.trim()) {
                selectorsContent = selectors;
                selectorsSource = 'inline';
            }
            else {
                // Fallback: try to find selectors.md file
                const scriptDirSelectors = path.join(__dirname, 'selectors.md');
                if (fs.existsSync(scriptDirSelectors)) {
                    selectorsContent = fs.readFileSync(scriptDirSelectors, 'utf-8');
                    selectorsSource = scriptDirSelectors;
                }
                else {
                    const cwdSelectors = path.join(process.cwd(), 'selectors.md');
                    if (fs.existsSync(cwdSelectors)) {
                        selectorsContent = fs.readFileSync(cwdSelectors, 'utf-8');
                        selectorsSource = cwdSelectors;
                    }
                    else {
                        throw new Error('No selectors found. Please provide --selectors path or ensure selectors.md exists.');
                    }
                }
            }
        }

        const mappings = this.parseSelectorsContent(selectorsContent);

        return {
            mappings,
            selectorsPath : selectorsSource
        };
    },

    /**
     * Parse selectors content (from file or inline) and extract class name mappings
     * Supports both formats:
     * - Old format: | Component | Old | New |
     * - New format: | Old | New |
     * @param {String} content - Selectors content (file content or inline string)
     * @returns {Map} Class name mappings
     */
    parseSelectorsContent(content) {
        const lines = content.split('\n');
        const mappings = new Map();

        // Detect format by checking header
        let headerLine = -1;
        let separatorLine = -1;
        let isOldFormat = false;

        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line.startsWith('|') && line.includes('Old') && line.includes('New')) {
                headerLine = i;
                // Check if it has 3 columns (old format) or 2 columns (new format)
                // Old format: | File | Old | New | -> 3 data columns
                // New format: | Old | New | -> 2 data columns
                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                // Old format will have 3+ parts (File/Component, Old, New), new format has 2 (Old, New)
                isOldFormat = parts.length >= 3;
                break;
            }
        }

        // Find separator line (usually right after header)
        if (headerLine >= 0) {
            for (let i = headerLine + 1; i < Math.min(headerLine + 3, lines.length); i++) {
                const line = lines[i].trim();
                if (line.startsWith('|') && (line.includes('---') || line.match(/^[\|:\-\s]+$/))) {
                    separatorLine = i;
                    break;
                }
            }
        }

        // Start parsing after separator line (or header + 2 if no separator found)
        const startLine = separatorLine >= 0 ? separatorLine + 1 : (headerLine >= 0 ? headerLine + 2 : 2);

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines and section headers
            if (!line || !line.startsWith('|')) {
                continue;
            }

            // Skip separator lines
            if (line.includes('---')) {
                continue;
            }

            // Parse markdown table format
            const parts = line.split('|').map(p => p.trim()).filter(p => p);

            let oldClass, newClass;

            if (isOldFormat && parts.length >= 3) {
                // Old format: | Component | Old | New |
                oldClass = parts[1].replace(/^\./, '').trim();
                newClass = parts[2].replace(/^\./, '').trim();
            }
            else if (!isOldFormat && parts.length >= 2) {
                // New format: | Old | New |
                oldClass = parts[0].replace(/^\./, '').trim();
                newClass = parts[1].replace(/^\./, '').trim();
            }

            if (oldClass && newClass && oldClass !== newClass) {
                mappings.set(oldClass, newClass);
            }
        }

        return mappings;
    },

    /**
     * Replace class names in content
     */
    replace(content, state) {
        const { mappings } = state;
        const replacements = [];
        let newContent = content;

        // Sort by length (longest first) to handle extended class names first
        const sortedMappings = Array.from(mappings.entries()).sort((a, b) => b[0].length - a[0].length);

        for (const [oldClass, newClass] of sortedMappings) {
            const escapedOld = this.escapeRegex(oldClass);
            let count = 0;

            // Pattern 1: Match as a standalone class name (word boundaries)
            const standalonePattern = new RegExp(`\\b${escapedOld}\\b`, 'g');
            const standaloneMatches = newContent.match(standalonePattern);
            if (standaloneMatches) {
                count += standaloneMatches.length;
                newContent = newContent.replace(standalonePattern, newClass);
            }

            // Pattern 2: Match as part of extended class names (e.g., b-calendarpanel-cell)
            const extendedPattern = new RegExp(`\\b${escapedOld}(-[\\w-]+)`, 'g');
            const extendedMatches = newContent.match(extendedPattern);
            if (extendedMatches) {
                count += extendedMatches.length;
                newContent = newContent.replace(extendedPattern, (match, suffix) => {
                    return `${newClass}${suffix}`;
                });
            }

            // Pattern 3: Match in CSS selectors (e.g., .b-calendarpanel)
            const selectorPattern = new RegExp(`\\.${escapedOld}(?=[-\\s.,:;{>+~])`, 'g');
            const selectorMatches = newContent.match(selectorPattern);
            if (selectorMatches) {
                count += selectorMatches.length;
                newContent = newContent.replace(selectorPattern, `.${newClass}`);
            }

            // Pattern 4: Match in string literals and template literals
            const stringPattern = new RegExp(`(['"\`])${escapedOld}\\1`, 'g');
            const stringMatches = newContent.match(stringPattern);
            if (stringMatches) {
                count += stringMatches.length;
                newContent = newContent.replace(stringPattern, (match, quote) => {
                    return `${quote}${newClass}${quote}`;
                });
            }

            // Pattern 5: Match in class attributes (class="...", className="...", cls="...")
            const classAttrPattern = new RegExp(`(class(?:Name)?|cls)\\s*[:=]\\s*['"\`]?([^'"\`]*?)${escapedOld}([^'"\`]*?)['"\`]?`, 'g');
            const classAttrMatches = newContent.match(classAttrPattern);
            if (classAttrMatches) {
                count += classAttrMatches.length;
                newContent = newContent.replace(classAttrPattern, (match, attr, before, after) => {
                    const hasQuotes = match.includes('"') || match.includes("'") || match.includes('`');
                    const quote = hasQuotes ? (match.includes('"') ? '"' : (match.includes("'") ? "'" : '`')) : '';
                    return `${attr}: ${quote}${before}${newClass}${after}${quote}`;
                });
            }

            // Pattern 6: Match in template literals with ${} expressions
            const templatePattern = new RegExp(`\\$\\{[^}]*${escapedOld}[^}]*\\}`, 'g');
            const templateMatches = newContent.match(templatePattern);
            if (templateMatches) {
                count += templateMatches.length;
                newContent = newContent.replace(templatePattern, match => {
                    return match.replace(new RegExp(escapedOld, 'g'), newClass);
                });
            }

            if (count > 0) {
                replacements.push({
                    oldClass,
                    newClass,
                    count
                });
            }
        }

        return { content : newContent, replacements };
    },

    /**
     * Escape special regex characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

/**
 * FontAwesome Migration Module
 * Migrates FontAwesome class names from b-fa-* to fa-* format
 */
const fontsMigration = {
    name        : 'fonts',
    description : 'Migrate FontAwesome class names (e.g., b-fa → fa, b-fa-example → fa-example)',

    /**
     * Initialize the migration with options
     * @param {Object} options - Migration options
     * @returns {Object} Migration state
     */
    init(options = {}) {
        return {
            mappings : new Map([
                ['b-fa', 'fa']
            ])
        };
    },

    /**
     * Replace FontAwesome class names in content
     */
    replace(content, state) {
        const replacements = [];
        let newContent = content;

        // Pattern 1: Replace standalone b-fa (word boundary)
        // Matches: b-fa (but not b-fa-example)
        const standalonePattern = /\bb-fa\b/g;
        const standaloneMatches = newContent.match(standalonePattern);
        if (standaloneMatches) {
            replacements.push({
                oldClass : 'b-fa',
                newClass : 'fa',
                count    : standaloneMatches.length
            });
            newContent = newContent.replace(standalonePattern, 'fa');
        }

        // Pattern 2: Replace b-fa-* in extended class names
        // Matches: b-fa-example → fa-example, b-fa-calendar → fa-calendar
        const extendedPattern = /\bb-fa-([\w-]+)/g;
        const extendedMatches = newContent.match(extendedPattern);
        if (extendedMatches) {
            const count = extendedMatches.length;
            newContent = newContent.replace(extendedPattern, (match, suffix) => {
                return `fa-${suffix}`;
            });

            // Count unique replacements
            const uniqueReplacements = new Set(extendedMatches.map(m => m));
            replacements.push({
                oldClass : 'b-fa-*',
                newClass : 'fa-*',
                count,
                examples : Array.from(uniqueReplacements).slice(0, 5)
            });
        }

        // Pattern 3: Match in CSS selectors (e.g., .b-fa, .b-fa-example)
        const selectorPattern = /\.b-fa(?:-[\w-]+)?(?=[-\s.,:;{>+~])/g;
        const selectorMatches = newContent.match(selectorPattern);
        if (selectorMatches && selectorMatches.length > 0) {
            newContent = newContent.replace(selectorPattern, match => {
                return match.replace(/\.b-fa/, '.fa');
            });
        }

        // Pattern 4: Match in string literals and template literals
        // Handles: 'b-fa', "b-fa-example", `b-fa-calendar`
        const stringPattern = /(['"`])b-fa(?:-[\w-]+)?\1/g;
        const stringMatches = newContent.match(stringPattern);
        if (stringMatches) {
            newContent = newContent.replace(stringPattern, match => {
                return match.replace(/b-fa/, 'fa');
            });
        }

        // Pattern 5: Match in class attributes (class="...", className="...", cls="...")
        const classAttrPattern = /(class(?:Name)?|cls)\s*[:=]\s*['"`]?([^'"`]*?)b-fa(?:-[\w-]+)?([^'"`]*?)['"`]?/g;
        const classAttrMatches = newContent.match(classAttrPattern);
        if (classAttrMatches) {
            newContent = newContent.replace(classAttrPattern, (match, attr, before, after) => {
                const hasQuotes = match.includes('"') || match.includes("'") || match.includes('`');
                const quote = hasQuotes ? (match.includes('"') ? '"' : (match.includes("'") ? "'" : '`')) : '';
                const replaced = match.replace(/b-fa/g, 'fa');
                return replaced;
            });
        }

        // Pattern 6: Match in template literals with ${} expressions
        const templatePattern = /\$\{[^}]*b-fa(?:-[\w-]+)?[^}]*\}/g;
        const templateMatches = newContent.match(templatePattern);
        if (templateMatches) {
            newContent = newContent.replace(templatePattern, match => {
                return match.replace(/b-fa/g, 'fa');
            });
        }

        return { content : newContent, replacements };
    }
};

// Available migrations
const availableMigrations = {
    css   : cssMigration,
    fonts : fontsMigration
};

// Colors for terminal output
const colors = {
    reset  : '\x1b[0m',
    bright : '\x1b[1m',
    green  : '\x1b[32m',
    yellow : '\x1b[33m',
    blue   : '\x1b[34m',
    cyan   : '\x1b[36m',
    red    : '\x1b[31m',
    gray   : '\x1b[90m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Convert wildcard pattern to regex
 */
function patternToRegex(pattern) {
    // Escape special regex characters except * and ?
    const regex = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '___DOUBLE_STAR___')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
        .replace(/___DOUBLE_STAR___/g, '.*');

    return new RegExp(`^${regex}$`);
}

/**
 * Check if a file path matches any include/exclude patterns
 */
function matchesPattern(filePath, includePatterns, excludePatterns) {
    // Check excludes first
    for (const pattern of excludePatterns) {
        const regex = patternToRegex(pattern);
        if (regex.test(filePath)) {
            return false;
        }
    }

    // If no includes specified, include everything
    if (includePatterns.length === 0) {
        return true;
    }

    // Check includes
    for (const pattern of includePatterns) {
        const regex = patternToRegex(pattern);
        if (regex.test(filePath)) {
            return true;
        }
    }

    return false;
}

/**
 * Simple fallback searchDirSync implementation
 */
function simpleSearchDirSync(searchPath, options = {}) {
    const {
        include = /.*/,
        exclude = null,
        found = [],
        includeFiles = true,
        includeFolders = false,
        recursive = true,
        includeNodeModules = false
    } = options;

    if (!fs.existsSync(searchPath)) {
        return found;
    }

    try {
        const files = fs.readdirSync(searchPath);
        for (const file of files) {
            const filename = path.join(searchPath, file);
            let stat;
            try {
                stat = fs.lstatSync(fs.realpathSync(filename));
            }
            catch (e) {
                continue;
            }

            // Skip node_modules if not included
            if (!includeNodeModules && filename.includes('node_modules')) {
                continue;
            }

            const included = typeof include === 'function'
                ? include(filename)
                : (include instanceof RegExp ? include.test(filename) : filename.endsWith(include));
            const excluded = exclude && (exclude instanceof RegExp ? exclude.test(filename) : filename.endsWith(exclude));

            if (stat.isDirectory()) {
                if (included && !excluded && includeFolders) {
                    found.push(filename);
                }
                if (recursive) {
                    simpleSearchDirSync(filename, { include, exclude, found, includeFiles, includeFolders, includeNodeModules });
                }
            }
            else {
                if (included && !excluded && includeFiles) {
                    found.push(filename);
                }
            }
        }
    }
    catch (e) {
        // Ignore permission errors
    }

    return found;
}

/**
 * Find all files to process using searchDirSync
 * Handles both single files and directories
 */
function findFiles(targetPath, includePatterns, excludePatterns) {
    const resolvedPath = path.resolve(targetPath);
    const stat = fs.statSync(resolvedPath);

    // If it's a single file, return it directly
    if (stat.isFile()) {
        // Check if file matches include/exclude patterns
        const fileName = path.basename(resolvedPath);
        const relativePath = fileName;

        // Check excludes first
        for (const pattern of excludePatterns) {
            const regex = patternToRegex(pattern);
            if (regex.test(relativePath) || regex.test(resolvedPath)) {
                return [];
            }
        }

        // Check includes if specified
        if (includePatterns.length > 0) {
            let matches = false;
            for (const pattern of includePatterns) {
                const regex = patternToRegex(pattern);
                if (regex.test(relativePath) || regex.test(resolvedPath)) {
                    matches = true;
                    break;
                }
            }
            if (!matches) {
                return [];
            }
        }

        return [resolvedPath];
    }

    // It's a directory, search recursively
    // Use the existing io utilities if available
    let searchDirSync;
    try {
        // Try to use the project's io utilities
        const ioPath = path.resolve(__dirname, '../lib/io.js');
        if (fs.existsSync(ioPath)) {
            const io = require(ioPath);
            searchDirSync = io.searchDirSync;
        }
        else {
            throw new Error('io.js not found');
        }
    }
    catch (e) {
        // Fallback to simple implementation
        searchDirSync = simpleSearchDirSync;
    }

    // Default include patterns if none specified
    const defaultExtensions = ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css', '.html', '.vue'];

    // Build include regex
    const includeRegex = includePatterns.length === 0
        ? new RegExp(`\\.(${defaultExtensions.map(e => e.replace(/^\./, '')).join('|')})$`, 'i')
        : includePatterns.length === 1 && includePatterns[0].includes('*')
            ? patternToRegex(includePatterns[0])
            : new RegExp(includePatterns.map(p => patternToRegex(p).source).join('|'), 'i');

    // Build exclude regex
    const excludeRegex = excludePatterns.length > 0
        ? new RegExp(excludePatterns.map(p => patternToRegex(p).source).join('|'), 'i')
        : null;

    // Find all files
    const allFiles = searchDirSync(resolvedPath, {
        include            : includeRegex,
        exclude            : excludeRegex,
        includeFiles       : true,
        includeFolders     : false,
        recursive          : true,
        includeNodeModules : false
    });

    // Filter by patterns (for additional validation)
    return allFiles.filter(file => {
        const relativePath = path.relative(resolvedPath, file).replace(/\\/g, '/');
        return matchesPattern(relativePath, includePatterns, excludePatterns);
    });
}

/**
 * Process a single file with all enabled migrations
 */
function processFile(filePath, migrations, dryRun) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        let newContent = content;
        const allReplacements = [];

        // Apply each migration
        for (const migration of migrations) {
            const { content: migratedContent, replacements } = migration.module.replace(newContent, migration.state);
            newContent = migratedContent;

            if (replacements && replacements.length > 0) {
                allReplacements.push({
                    migration : migration.name,
                    replacements
                });
            }
        }

        if (content !== newContent) {
            if (!dryRun) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
            }

            return {
                file         : filePath,
                changed      : true,
                replacements : allReplacements
            };
        }

        return { file : filePath, changed : false, replacements : [] };
    }
    catch (error) {
        return {
            file    : filePath,
            changed : false,
            error   : error.message
        };
    }
}

/**
 * Print statistics
 */
function printStats(results, migrations, dryRun) {
    const changedFiles = results.filter(r => r.changed);
    const errorFiles = results.filter(r => r.error);

    // Count total replacements by migration type
    const replacementCounts = new Map();
    let totalReplacements = 0;

    for (const result of changedFiles) {
        for (const migrationResult of result.replacements) {
            const migrationName = migrationResult.migration;

            for (const rep of migrationResult.replacements) {
                const key = `${migrationName}: ${rep.oldClass} → ${rep.newClass}`;
                replacementCounts.set(key, (replacementCounts.get(key) || 0) + rep.count);
                totalReplacements += rep.count;
            }
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log(colorize('Migration Statistics', 'bright'));
    console.log('='.repeat(80));
    console.log();

    const targetPath = results[0]?.file ? path.dirname(results[0].file) : 'N/A';
    console.log(`Target: ${colorize(targetPath, 'cyan')}`);
    console.log(`Enabled migrations: ${colorize(migrations.map(m => m.name).join(', '), 'cyan')}`);
    console.log(`Mode: ${colorize(dryRun ? 'DRY RUN (no changes made)' : 'LIVE (changes applied)', dryRun ? 'yellow' : 'green')}`);
    console.log();

    console.log(colorize('Files:', 'bright'));
    console.log(`  Total files scanned: ${colorize(results.length, 'cyan')}`);
    console.log(`  Files changed: ${colorize(changedFiles.length, changedFiles.length > 0 ? 'green' : 'gray')}`);
    console.log(`  Files with errors: ${colorize(errorFiles.length, errorFiles.length > 0 ? 'red' : 'gray')}`);
    console.log();

    if (totalReplacements > 0) {
        console.log(colorize('Replacements:', 'bright'));
        console.log(`  Total replacements: ${colorize(totalReplacements, 'cyan')}`);
        console.log();

        // Group by migration type
        for (const migration of migrations) {
            const migrationReplacements = Array.from(replacementCounts.entries())
                .filter(([key]) => key.startsWith(`${migration.name}:`))
                .sort((a, b) => b[1] - a[1]);

            if (migrationReplacements.length > 0) {
                console.log(colorize(`${migration.module.description}:`, 'bright'));
                for (const [key, count] of migrationReplacements.slice(0, 10)) {
                    const replacement = key.replace(`${migration.name}: `, '');
                    console.log(`  ${colorize(replacement, 'yellow')}: ${colorize(count, 'cyan')}`);
                }
                console.log();
            }
        }
    }

    if (changedFiles.length > 0) {
        console.log(colorize('Changed files:', 'bright'));
        for (const result of changedFiles.slice(0, 20)) {
            const relPath = path.relative(process.cwd(), result.file);
            console.log(`  ${colorize(relPath, 'cyan')}`);
            if (result.replacements.length > 0) {
                const migrationNames = result.replacements.map(r => r.migration).join(', ');
                console.log(`    ${migrationNames}`);
            }
        }
        if (changedFiles.length > 20) {
            console.log(`  ... and ${changedFiles.length - 20} more files`);
        }
        console.log();
    }

    if (errorFiles.length > 0) {
        console.log(colorize('Errors:', 'red'));
        for (const result of errorFiles) {
            console.log(`  ${result.file}: ${result.error}`);
        }
        console.log();
    }

    console.log('='.repeat(80));
    console.log();
}

/**
 * Validate and parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        projectPath   : null,
        migrations    : ['css', 'fonts'], // Default: run both
        selectorsPath : null,
        include       : [],
        exclude       : [],
        dryRun        : false,
        help          : false
    };

    const validOptions = ['--help', '-h', '--dry-run', '--migrations', '--selectors', '--include', '--exclude'];
    const optionsRequiringValue = ['--migrations', '--selectors', '--include', '--exclude'];
    const errors = [];
    const warnings = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Check for unknown options
        if (arg.startsWith('--') && !validOptions.includes(arg)) {
            // Check if it's a typo (similar to known options)
            const argName = arg.split('=')[0].substring(2); // Remove '--'
            let similar = null;
            let minDistance = Infinity;

            for (const opt of validOptions) {
                const optName = opt.replace(/^--/, '');
                // Check if starts with same prefix
                if (argName.length >= 3 && optName.startsWith(argName.substring(0, 3))) {
                    similar = opt;
                    break;
                }
                // Simple Levenshtein-like check for short names
                if (Math.abs(argName.length - optName.length) <= 2) {
                    let distance = 0;
                    const minLen = Math.min(argName.length, optName.length);
                    for (let j = 0; j < minLen; j++) {
                        if (argName[j] !== optName[j]) distance++;
                    }
                    distance += Math.abs(argName.length - optName.length);
                    if (distance < minDistance && distance <= 2) {
                        minDistance = distance;
                        similar = opt;
                    }
                }
            }

            if (similar) {
                errors.push(`Unknown option: ${arg}. Did you mean ${similar}?`);
            }
            else {
                errors.push(`Unknown option: ${arg}`);
            }
            continue;
        }

        // Check for options that require a value but don't have one
        if (optionsRequiringValue.includes(arg) && (i + 1 >= args.length || args[i + 1].startsWith('--'))) {
            errors.push(`Option ${arg} requires a value`);
            continue;
        }

        if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
        else if (arg === '--dry-run') {
            options.dryRun = true;
        }
        else if (arg === '--migrations') {
            const migrationsArg = args[++i];
            if (!migrationsArg || migrationsArg.startsWith('--')) {
                errors.push(`Option --migrations requires a value`);
                i--; // Back up to reprocess this arg
                continue;
            }
            if (migrationsArg === 'all') {
                options.migrations = Object.keys(availableMigrations);
            }
            else {
                options.migrations = migrationsArg.split(',').map(m => m.trim()).filter(m => m);
                if (options.migrations.length === 0) {
                    errors.push(`Option --migrations requires at least one migration type`);
                }
            }
        }
        else if (arg === '--selectors') {
            options.selectorsPath = args[++i];
            if (!options.selectorsPath || options.selectorsPath.startsWith('--')) {
                errors.push(`Option --selectors requires a value`);
                i--; // Back up to reprocess this arg
                continue;
            }
        }
        else if (arg === '--include') {
            const includeValue = args[++i];
            if (!includeValue || includeValue.startsWith('--')) {
                errors.push(`Option --include requires a value`);
                i--; // Back up to reprocess this arg
                continue;
            }
            options.include.push(includeValue);
        }
        else if (arg === '--exclude') {
            const excludeValue = args[++i];
            if (!excludeValue || excludeValue.startsWith('--')) {
                errors.push(`Option --exclude requires a value`);
                i--; // Back up to reprocess this arg
                continue;
            }
            options.exclude.push(excludeValue);
        }
        else if (!arg.startsWith('--') && !options.projectPath) {
            options.projectPath = arg;
        }
        else if (!arg.startsWith('--') && options.projectPath) {
            warnings.push(`Ignoring extra argument: ${arg}`);
        }
    }

    // Validate migrations
    if (options.migrations.length === 0) {
        errors.push('At least one migration type must be specified');
    }

    const invalidMigrations = options.migrations.filter(m => !availableMigrations[m]);
    if (invalidMigrations.length > 0) {
        errors.push(`Invalid migration types: ${invalidMigrations.join(', ')}`);
    }

    // Validate selectors path if CSS migration is enabled
    if (options.migrations.includes('css')) {
        if (options.selectorsPath) {
            // Check if provided path exists
            if (!path.isAbsolute(options.selectorsPath)) {
                options.selectorsPath = path.resolve(process.cwd(), options.selectorsPath);
            }
            if (!fs.existsSync(options.selectorsPath)) {
                errors.push(`Selectors file not found: ${options.selectorsPath}`);
            }
        }
        else {
            // Check if inline selectors constant exists and is not empty
            if (typeof selectors === 'string' && selectors.trim()) {
                // Inline selectors available, no file needed
                options.selectorsPath = null;
            }
            else {
                // Try to find default selectors file
                const scriptDirSelectors = path.join(__dirname, 'selectors.md');
                if (fs.existsSync(scriptDirSelectors)) {
                    options.selectorsPath = scriptDirSelectors;
                }
                else {
                    const cwdSelectors = path.join(process.cwd(), 'selectors.md');
                    if (fs.existsSync(cwdSelectors)) {
                        options.selectorsPath = cwdSelectors;
                    }
                    else {
                        errors.push(`CSS migration requires selectors. Please provide --selectors path, use inline selectors, or place selectors.md in the script directory or current working directory.`);
                    }
                }
            }
        }
    }

    // Validate project path (can be file or directory)
    if (!options.help && !options.projectPath) {
        errors.push('Path is required (can be a file or directory)');
    }
    else if (options.projectPath) {
        const resolvedPath = path.resolve(options.projectPath);
        if (!fs.existsSync(resolvedPath)) {
            errors.push(`Path does not exist: ${resolvedPath}`);
        }
        else {
            const stat = fs.statSync(resolvedPath);
            // Allow both files and directories
            if (!stat.isDirectory() && !stat.isFile()) {
                errors.push(`Path must be a file or directory: ${resolvedPath}`);
            }
        }
    }

    // Validate include/exclude patterns (basic check)
    for (const pattern of options.include) {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            errors.push(`Invalid include pattern: ${pattern}`);
        }
    }

    for (const pattern of options.exclude) {
        if (typeof pattern !== 'string' || pattern.length === 0) {
            errors.push(`Invalid exclude pattern: ${pattern}`);
        }
    }

    // Return errors and warnings if any
    if (errors.length > 0 || warnings.length > 0) {
        return { options, errors, warnings };
    }

    return { options, errors : [], warnings : [] };
}

/**
 * Main function
 */
async function main() {
    const { options, errors, warnings } = parseArgs();

    // Show help if requested
    if (options.help) {
        console.log(require('fs').readFileSync(__filename, 'utf-8').match(/\/\*\*[\s\S]*?\*\//)[0]);
        console.log('\nAvailable migration types:');
        for (const [key, migration] of Object.entries(availableMigrations)) {
            console.log(`  ${colorize(key, 'cyan')}: ${migration.description}`);
        }
        process.exit(0);
    }

    // Display warnings
    if (warnings.length > 0) {
        console.warn(colorize('Warnings:', 'yellow'));
        for (const warning of warnings) {
            console.warn(`  ${colorize(warning, 'yellow')}`);
        }
        console.log();
    }

    // Display errors and exit
    if (errors.length > 0) {
        console.error(colorize('Error: Invalid options:', 'red'));
        for (const error of errors) {
            console.error(`  ${colorize(error, 'red')}`);
        }
        console.log();
        console.log('Use --help for usage information.');
        process.exit(1);
    }

    const targetPath = path.resolve(options.projectPath);
    const isFile = fs.statSync(targetPath).isFile();
    const targetType = isFile ? 'File' : 'Directory';

    console.log(colorize('Bryntum 6 → 7 Migration Tool', 'bright'));
    console.log('='.repeat(80));
    console.log();
    console.log(`${targetType}: ${colorize(targetPath, 'cyan')}`);
    console.log(`Enabled migrations: ${colorize(options.migrations.join(', '), 'cyan')}`);
    if (options.migrations.includes('css')) {
        if (options.selectorsPath) {
            const selectorsDisplay = path.isAbsolute(options.selectorsPath)
                ? path.relative(process.cwd(), options.selectorsPath) || options.selectorsPath
                : options.selectorsPath;
            console.log(`Selectors: ${colorize(selectorsDisplay, 'cyan')}`);
        }
        else if (typeof selectors === 'string' && selectors.trim()) {
            console.log(`Selectors: ${colorize('inline (embedded)', 'cyan')}`);
        }
    }
    console.log(`Mode: ${colorize(options.dryRun ? 'DRY RUN' : 'LIVE', options.dryRun ? 'yellow' : 'green')}`);
    if (!isFile) {
        if (options.include.length > 0) {
            console.log(`Include: ${colorize(options.include.join(', '), 'cyan')}`);
        }
        if (options.exclude.length > 0) {
            console.log(`Exclude: ${colorize(options.exclude.join(', '), 'cyan')}`);
        }
    }
    console.log();

    try {
        // Initialize migrations
        console.log(colorize('Initializing migrations...', 'blue'));
        const migrations = [];
        for (const migrationType of options.migrations) {
            const migration = availableMigrations[migrationType];
            const migrationOptions = migrationType === 'css'
                ? { selectorsPath : options.selectorsPath }
                : {};

            const state = migration.init(migrationOptions);
            migrations.push({
                name   : migrationType,
                module : migration,
                state
            });
            console.log(colorize(`  ✓ ${migration.description}`, 'green'));
        }
        console.log();

        // Find files
        console.log(colorize('Finding files to process...', 'blue'));
        const files = findFiles(targetPath, options.include, options.exclude);

        if (files.length === 0) {
            console.log(colorize('No files found to process', 'yellow'));
            if (isFile) {
                console.log('  The file may have been excluded by include/exclude patterns.');
            }
            process.exit(0);
        }

        console.log(colorize(`Found ${files.length} file${files.length === 1 ? '' : 's'} to process`, 'green'));
        console.log();

        // Process files
        console.log(colorize('Processing files...', 'blue'));
        const results = [];
        let processed = 0;
        const basePath = isFile ? path.dirname(targetPath) : targetPath;

        for (const file of files) {
            const result = processFile(file, migrations, options.dryRun);
            results.push(result);
            processed++;

            if (result.changed) {
                const status = options.dryRun ? 'would change' : 'changed';
                const displayPath = isFile ? path.basename(file) : path.relative(basePath, file);
                console.log(`  ${colorize(status, result.changed ? 'green' : 'gray')}: ${displayPath}`);
            }
            else if (result.error) {
                const displayPath = isFile ? path.basename(file) : path.relative(basePath, file);
                console.log(`  ${colorize('error', 'red')}: ${displayPath} - ${result.error}`);
            }

            // Show progress for large projects
            if (processed % 100 === 0) {
                process.stdout.write(`  Processed ${processed}/${files.length} files...\r`);
            }
        }
        if (processed >= 100) {
            process.stdout.write('\n');
        }
        console.log();

        // Print statistics
        printStats(results, migrations, options.dryRun);

        if (options.dryRun) {
            console.log(colorize('DRY RUN: No files were actually modified. Run without --dry-run to apply changes.', 'yellow'));
        }
        else {
            console.log(colorize('Migration completed successfully!', 'green'));
        }

    }
    catch (error) {
        console.error(colorize(`Error: ${error.message}`, 'red'));
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error(colorize(`Fatal error: ${error.message}`, 'red'));
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    });
}

module.exports = { processFile, findFiles, availableMigrations };

