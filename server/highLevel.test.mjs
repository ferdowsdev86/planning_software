import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Isolation guard for the High Level Planning Board server module: it may
// READ the live planning tables (reference import) but must never write to
// them. Every statement that writes must target an hl_* table.
const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'highLevel.mjs'), 'utf8')
    .replace(/ON UPDATE CURRENT_TIMESTAMP/g, '');   // DDL column default, not a statement

const LIVE_TABLES = ['planning_events', 'planning_assignments', 'planning_orders', 'planning_resources', 'planning_calendars',
    'planning_calendar_intervals', 'planning_projects', 'planning_dependencies', 'planning_completed_orders', 'planning_board_snapshots',
    'planning_whatif_dbs', 'planning_users', 'day_production_update_plan', 'planning_change_logs', 'mr_order_entry', 'mr_purchase_order'];

test('highLevel.mjs never writes to a live planning table', () => {
    const writes = src.match(/\b(INSERT\s+(IGNORE\s+)?INTO|UPDATE|DELETE\s+FROM|TRUNCATE|ALTER\s+TABLE|DROP\s+TABLE)\s+[`"]?(\$\{[^}]+\}\.)?[`"]?([a-z_]+)/gi) || [];
    assert.ok(writes.length > 0, 'the module should contain its own hl_* writes');
    for (const w of writes) {
        const table = w.match(/([a-z_]+)$/i)[1];
        assert.ok(table.startsWith('hl_'), `write statement targets a non-simulation table: "${w}"`);
        assert.ok(!LIVE_TABLES.includes(table), `write statement targets a live table: "${w}"`);
    }
});

test('highLevel.mjs reads the live tables only for the reference snapshot', () => {
    const reads = src.match(/\bFROM\s+[`"]?(\$\{[^}]+\}\.)?[`"]?(planning_[a-z_]+|hr_unit)/gi) || [];
    assert.ok(reads.length > 0);
    // every live read sits inside the /reference handler or the user lookup
    const refStart = src.indexOf('/reference`');
    const userFn   = src.indexOf('async function user(');
    for (const r of reads) {
        const at = src.indexOf(r);
        const inRef  = at > refStart;
        const inUser = at > userFn && at < src.indexOf('// ---- list / create');
        assert.ok(inRef || inUser, `live table read outside the reference snapshot: "${r}"`);
    }
});

test('no triggers, no scheduled jobs, no cross-table cascades', () => {
    assert.equal(/CREATE\s+TRIGGER/i.test(src), false);
    assert.equal(/setInterval|setTimeout\(/.test(src), false);
    assert.equal(/ON\s+DELETE\s+CASCADE/i.test(src), false);
});
