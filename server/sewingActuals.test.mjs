import test from 'node:test';
import assert from 'node:assert/strict';
import { boardLineCode, sewingActualsSql, normalizeActualRows } from './sewingActuals.mjs';

test('ERP line names map to board line codes per unit; MBM pairs fold onto the first line; non-numeric CEIL names stay unmapped', () => {
    assert.equal(boardLineCode('AQL', 'A03'), 'L03');
    assert.equal(boardLineCode('MBM', '1'), 'M01');
    assert.equal(boardLineCode('MBM', '2'), 'M01');
    assert.equal(boardLineCode('MBM', '14'), 'M14');
    assert.equal(boardLineCode('MBM', '15'), 'M14');
    assert.equal(boardLineCode('CEIL', '8'), 'C08');
    assert.equal(boardLineCode('CEIL', '41'), 'C41');
    assert.equal(boardLineCode('CEIL', 'S-27'), null, 'not a numbered sewing line — PO-level');
    assert.equal(boardLineCode('CEIL', 'P1'), null);
    assert.equal(boardLineCode('CEIL', 'Pilot Line'), null);
    assert.equal(boardLineCode('CEIL', 'F/S2'), null);
    assert.equal(boardLineCode('MBM', 'TC'), null);
    assert.equal(boardLineCode('MBM', 'ALL LINE'), null);
    assert.equal(boardLineCode('XYZ', '1'), null);
});

test('feed SQL: sewing out only, one unit, date range, grouped at date × PO × colour × line (no duplicate quantities)', () => {
    const sql = sewingActualsSql('cuttingedgedb');
    assert.match(sql, /mr_operation_type_id = 2 AND d\.status = 'out'/);
    assert.match(sql, /hr_unit_short_name = \?/);
    assert.match(sql, /DATE\(d\.prod_date\) BETWEEN \? AND \?/);
    assert.match(sql, /GROUP BY DATE\(d\.prod_date\), d\.po_id, d\.clr_id, d\.hr_line_id/);
    assert.match(sql, /SUM\(d\.prod_qty\) AS qty/);
    assert.match(sql, /pt_sewing_daily_line_targets t ON t\.id = d\.pt_daily_line_target_id/);
});

test('normalize: dates as yyyy-mm-dd, manpower-minutes only when actual hours AND workers are recorded, zero-quantity rows dropped', () => {
    const rows = normalizeActualRows([
        { prod_date : '2026-11-17', po_id : 76486, clr_id : 1, hr_line_id : 361, erp_line : '14', erp_unit : 'MBM', po_no : '2100254474', order_code : '26H1LEV743', qty : '560', defect : 0, reject : 0, n : 2, act_hour : 10, act_worker : 60, plan_hour : 14, plan_worker : 100, line_smv : 23.5, line_target : 2226 },
        { prod_date : new Date('2026-11-16T00:00:00'), po_id : 1, clr_id : 1, hr_line_id : 335, erp_line : '1', erp_unit : 'MBM', po_no : 'X', order_code : 'Y', qty : 10, n : 1, act_hour : 0, act_worker : 0, plan_hour : 14, plan_worker : 100, line_smv : 0 },
        { prod_date : '2026-11-16', po_id : 2, clr_id : 1, hr_line_id : null, erp_line : null, erp_unit : 'MBM', po_no : 'Z', qty : 0, n : 1 }
    ], 'MBM');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].date, '2026-11-17');
    assert.equal(rows[0].lineCode, 'M14');
    assert.equal(rows[0].qty, 560);
    assert.equal(rows[0].manMin, 36000);
    assert.equal(rows[0].lineSmv, 23.5);
    assert.equal(rows[1].date, '2026-11-16');
    assert.equal(rows[1].lineCode, 'M01');
    assert.equal(rows[1].manMin, null, 'no actual manpower recorded');
    assert.equal(rows[1].planManMin, 84000);
    assert.equal(rows[1].lineSmv, null);
});
