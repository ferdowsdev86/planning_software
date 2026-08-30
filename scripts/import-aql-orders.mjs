// Sync fastreact.planning_orders from cuttingedgedb ERP tables
// (mr_order_entry / mr_style / mr_purchase_order / hr_unit / mr_buyer)
// Filter: unit 3 (AQL), order_type IN (1,3,10), delivery after 2025-09-01
import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : 'fastreact'
});

const FILTER = `
    o.unit_id = 3
    AND o.order_type IN (1, 3, 10)
    AND o.order_delivery_date > '2025-09-01'
`;

// 1. Drop previously imported ERP rows that are still unplanned and no
//    longer match the new filter (planned/demo rows stay untouched)
const [del] = await conn.query(`
    DELETE x FROM fastreact.planning_orders x
    WHERE x.erp_order_id IS NOT NULL
      AND x.planning_status = 'unplanned'
      AND NOT EXISTS (
          SELECT 1 FROM cuttingedgedb.mr_order_entry o
          WHERE o.order_id = x.erp_order_id AND ${FILTER}
      )
`);
console.log('removed non-matching imported rows:', del.affectedRows);

// 2. Import matching orders (one row per PO, order-level when no PO)
const [ins] = await conn.query(`
    INSERT INTO fastreact.planning_orders
        (erp_order_id, erp_po_id, buyer_id, brand_id, buyer_name, style_no, po_number,
         order_code, item_description, product_category, order_quantity, completed_quantity,
         remaining_quantity, smv, pcd, shipment_date, unit_id, priority, planning_status,
         source_updated_at, synced_at, created_at, updated_at)
    SELECT o.order_id, p.po_id, b.b_id, o.mr_brand_br_id, b.b_name, s.stl_no,
           COALESCE(p.po_no, o.order_ref_no, o.order_code),
           o.order_code,
           COALESCE(NULLIF(s.stl_garment_description,''), NULLIF(s.stl_description,''), s.stl_product_name),
           s.stl_product_name,
           COALESCE(p.po_qty, o.order_qty), 0, COALESCE(p.po_qty, o.order_qty),
           COALESCE(NULLIF(s.production_smv,0), NULLIF(s.stl_smv,0), 0),
           o.pcd, COALESCE(p.po_ex_fty, o.order_delivery_date), o.unit_id, 3, 'unplanned',
           o.updated_at, NOW(), NOW(), NOW()
    FROM cuttingedgedb.mr_order_entry o
    JOIN cuttingedgedb.mr_style s ON s.stl_id = o.mr_style_stl_id
    JOIN cuttingedgedb.hr_unit u ON u.hr_unit_id = o.unit_id
    LEFT JOIN cuttingedgedb.mr_buyer b ON b.b_id = o.mr_buyer_b_id
    LEFT JOIN cuttingedgedb.mr_purchase_order p ON p.mr_order_entry_order_id = o.order_id
    WHERE ${FILTER}
      AND NOT EXISTS (
          SELECT 1 FROM fastreact.planning_orders x
          WHERE x.erp_order_id = o.order_id
            AND ((p.po_id IS NULL AND x.erp_po_id IS NULL) OR x.erp_po_id = p.po_id)
      )
`);
console.log('inserted rows:', ins.affectedRows);

// 3. Back-fill unit_id on older imported rows
const [upd] = await conn.query(`
    UPDATE fastreact.planning_orders SET unit_id = 3
    WHERE erp_order_id IS NOT NULL AND (unit_id IS NULL OR unit_id = 0)
`);
console.log('back-filled unit_id:', upd.affectedRows);

const [[tot]]  = await conn.query(`SELECT COUNT(*) n FROM fastreact.planning_orders`);
const [[erp]]  = await conn.query(`SELECT COUNT(*) n FROM fastreact.planning_orders WHERE erp_order_id IS NOT NULL`);
const [types]  = await conn.query(`
    SELECT o.order_type, COUNT(*) n
    FROM fastreact.planning_orders x
    JOIN cuttingedgedb.mr_order_entry o ON o.order_id = x.erp_order_id
    GROUP BY o.order_type
`);
console.log('planning_orders total:', tot.n, '| from ERP:', erp.n);
console.log('by order_type:', types.map(t => `${t.order_type}=${t.n}`).join(', '));

await conn.end();
