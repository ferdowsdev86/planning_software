-- ---------------------------------------------------------------------------
-- Seed data for the AQL August Sewing Plan demo board
-- ---------------------------------------------------------------------------
USE fastreact;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE planning_projects;
TRUNCATE planning_resources;
TRUNCATE planning_orders;
TRUNCATE planning_events;
TRUNCATE planning_assignments;
TRUNCATE planning_dependencies;
TRUNCATE planning_calendars;
TRUNCATE planning_calendar_intervals;
SET FOREIGN_KEY_CHECKS = 1;

-- Project
INSERT INTO planning_projects
    (id, project_code, project_name, unit_id, plan_from, plan_to, plan_status, version_no, created_by, created_at)
VALUES
    (1, 'AQL-2026-08', 'AQL August Sewing Plan', 1, '2026-08-01', '2026-08-31', 'draft', 3, 1, NOW());

-- Calendar: Sat-Thu working 08:00-20:00, Friday non-working
INSERT INTO planning_calendars (id, calendar_code, calendar_name, unit_id, calendar_type, hours_per_day, days_per_week, active)
VALUES (1, 'FACTORY-AQL', 'AQL Factory Calendar', 1, 'factory', 10, 6, TRUE);

INSERT INTO planning_calendar_intervals (calendar_id, interval_type, interval_name, recurrent_rule, weekday_no)
VALUES
    (1, 'working',     'Working day 08:00-20:00', 'FREQ=WEEKLY;BYDAY=SA,SU,MO,TU,WE,TH', NULL),
    (1, 'non_working', 'Friday holiday',          'FREQ=WEEKLY;BYDAY=FR', 5);

-- Resources: 8 sewing lines + 4 stage resources
INSERT INTO planning_resources
    (id, resource_code, resource_name, resource_type, unit_id, floor_id, default_calendar_id, default_efficiency, manpower, machine_count, capacity_minutes_per_day, active, sort_order)
VALUES
    (1,  'L01',  'Line 01', 'sewing_line', 1, 1, 1, 55, 60, 62, 19800, TRUE, 1),
    (2,  'L02',  'Line 02', 'sewing_line', 1, 1, 1, 50, 55, 58, 16500, TRUE, 2),
    (3,  'L03',  'Line 03', 'sewing_line', 1, 1, 1, 60, 60, 64, 21600, TRUE, 3),
    (4,  'L04',  'Line 04', 'sewing_line', 1, 1, 1, 45, 48, 50, 12960, TRUE, 4),
    (5,  'L05',  'Line 05', 'sewing_line', 1, 2, 1, 58, 70, 72, 24360, TRUE, 5),
    (6,  'L06',  'Line 06', 'sewing_line', 1, 2, 1, 52, 52, 55, 16224, TRUE, 6),
    (7,  'L07',  'Line 07', 'sewing_line', 1, 2, 1, 55, 65, 68, 21450, TRUE, 7),
    (8,  'L08',  'Line 08', 'sewing_line', 1, 2, 1, 48, 45, 47, 12960, TRUE, 8),
    (9,  'CUT1', 'Cutting Table 1', 'cutting_table',   1, 0, 1, 100, 0, 0, 0, TRUE, 9),
    (10, 'WSH1', 'Wash Line 1',     'wash_line',       1, 0, 1, 100, 0, 0, 0, TRUE, 10),
    (11, 'FIN1', 'Finishing 1',     'finishing_line',  1, 3, 1, 100, 0, 0, 0, TRUE, 11),
    (12, 'PCK1', 'Packing 1',       'packing_line',    1, 3, 1, 100, 0, 0, 0, TRUE, 12);

-- Orders (planned)
INSERT INTO planning_orders
    (id, erp_order_id, buyer_name, style_no, po_number, order_quantity, remaining_quantity, smv,
     product_category, pcd, shipment_date, material_ready_date, priority, planning_status, suitable_lines, created_at)
VALUES
    (1,  9001, 'H&M',     'STY-2210',   'PO-20115',  8000,  8000,  23, 'Basic Shirt',    '2026-07-21', '2026-08-20', '2026-08-01', 2, 'fully_planned', NULL, NOW()),
    (2,  9002, 'C&A',     'STY-1108',   'PO-33445',  6000,  6000,  27, 'Blouse',         '2026-08-02', '2026-09-01', '2026-08-01', 3, 'fully_planned', NULL, NOW()),
    (3,  9003, 'MANGO',   'STY-5501',   'PO-61001',  7000,  7000,  34, '5 Pkt Shorts',   '2026-07-26', '2026-08-25', '2026-08-05', 3, 'fully_planned', NULL, NOW()),
    (4,  9004, 'ZARA',    'STY-4410',   'PO-10321',  12000, 12000, 33, '5 Pocket',       '2026-07-19', '2026-08-18', '2026-08-02', 1, 'fully_planned', NULL, NOW()),
    (5,  9005, 'ZARA',    'STY-4415',   'PO-10390',  5000,  0,     33, '5 Pocket Long',  '2026-08-06', '2026-09-05', '2026-08-01', 3, 'completed',     NULL, NOW()),
    (6,  9006, 'NEXT',    'STY-3302',   'PO-44120',  4000,  4000,  25, '5 Pocket Long',  '2026-07-31', '2026-08-30', '2026-08-06', 3, 'fully_planned', NULL, NOW()),
    (7,  9007, 'JCP',     '26FAJCP013', 'PO-347936', 20480, 20480, 22, '5 Pkt Pant',     '2026-07-26', '2026-08-25', '2026-08-01', 2, 'fully_planned', NULL, NOW()),
    (8,  9008, 'UNIQLO',  'STY-7702',   'PO-88110',  9000,  9000,  32, 'Basic Shirt',    '2026-07-15', '2026-08-14', '2026-08-03', 1, 'fully_planned', NULL, NOW()),
    (9,  9009, 'BERSHKA', 'STY-6604',   'PO-91002',  4000,  4000,  20, '5 Pocket Short', '2026-07-21', '2026-08-20', '2026-08-04', 3, 'fully_planned', NULL, NOW()),
    (10, 9010, 'WALMART', 'STY-8801',   'PO-55021',  25000, 25000, 33, 'Bottom',         '2026-07-23', '2026-08-22', '2026-08-02', 1, 'fully_planned', NULL, NOW()),
    (11, 9011, 'H&M',     'STY-2299',   'PO-20200',  15000, 15000, 30, 'Basic Shirt',    '2026-07-29', '2026-08-28', '2026-08-01', 2, 'fully_planned', NULL, NOW());

-- Orders (unplanned - document 3.2 panel)
INSERT INTO planning_orders
    (id, erp_order_id, buyer_name, style_no, po_number, order_quantity, remaining_quantity, smv,
     product_category, pcd, shipment_date, material_ready_date, priority, planning_status, suitable_lines, created_at)
VALUES
    (12, 9012, 'ZARA',    'STY-4501', 'PO-10555', 10000, 10000, 18, '5 Pocket',    '2026-07-29', '2026-08-28', '2026-08-05', 1, 'unplanned', '["L03","L05","L07"]', NOW()),
    (13, 9013, 'H&M',     'STY-2350', 'PO-20300', 12000, 12000, 19, 'Basic Shirt', '2026-08-03', '2026-09-02', '2026-08-03', 2, 'unplanned', '["L01","L02","L06"]', NOW()),
    (14, 9014, 'GAP',     'STY-9910', 'PO-70012', 6000,  6000,  24, 'Basic Shirt', '2026-08-07', '2026-09-06', '2026-08-08', 3, 'unplanned', '["L02","L04","L08"]', NOW()),
    (15, 9015, 'UNIQLO',  'STY-7750', 'PO-88200', 18000, 18000, 26, 'Basic Shirt', '2026-08-09', '2026-09-08', '2026-08-04', 2, 'unplanned', '["L05","L07"]', NOW()),
    (16, 9016, 'C&A',     'STY-1150', 'PO-33500', 5000,  5000,  31, 'Blouse',      '2026-08-11', '2026-09-10', '2026-08-10', 3, 'unplanned', '["L04","L06","L08"]', NOW()),
    (17, 9017, 'WALMART', 'STY-8850', 'PO-55100', 22000, 22000, 31, 'Bottom',      '2026-08-05', '2026-09-04', '2026-08-06', 1, 'unplanned', '["L05","L07"]', NOW());

-- Sewing events for the planned orders
INSERT INTO planning_events
    (id, project_id, planning_order_id, event_code, event_name, event_type, production_stage,
     start_date, end_date, duration, duration_unit, planned_quantity, percent_done,
     manually_scheduled, event_status, created_by)
VALUES
    (1,  1, 1,  'EV-20115-SEW',  'H&M | PO-20115',     'production', 'sewing', '2026-08-01', '2026-08-08', 6,  'day', 8000,  30,  TRUE, 'planned',   1),
    (2,  1, 2,  'EV-33445-SEW',  'C&A | PO-33445',     'production', 'sewing', '2026-08-01', '2026-08-08', 6,  'day', 6000,  80,  TRUE, 'planned',   1),
    (3,  1, 3,  'EV-61001-SEW',  'MANGO | PO-61001',   'production', 'sewing', '2026-08-09', '2026-08-16', 6,  'day', 7000,  0,   TRUE, 'draft',     1),
    (4,  1, 4,  'EV-10321-SEW',  'ZARA | PO-10321',    'production', 'sewing', '2026-08-03', '2026-08-15', 10, 'day', 12000, 62,  TRUE, 'confirmed', 1),
    (5,  1, 5,  'EV-10390-SEW',  'ZARA | PO-10390',    'production', 'sewing', '2026-08-01', '2026-08-10', 8,  'day', 5000,  100, TRUE, 'completed', 1),
    (6,  1, 6,  'EV-44120-SEW',  'NEXT | PO-44120',    'production', 'sewing', '2026-08-12', '2026-08-18', 5,  'day', 4000,  0,   TRUE, 'draft',     1),
    (7,  1, 7,  'EV-347936-SEW', 'JCP | PO-347936',    'production', 'sewing', '2026-08-01', '2026-08-17', 14, 'day', 20480, 10,  TRUE, 'planned',   1),
    (8,  1, 8,  'EV-88110-SEW',  'UNIQLO | PO-88110',  'production', 'sewing', '2026-08-04', '2026-08-13', 8,  'day', 9000,  5,   TRUE, 'planned',   1),
    (9,  1, 9,  'EV-91002-SEW',  'BERSHKA | PO-91002', 'production', 'sewing', '2026-08-13', '2026-08-18', 4,  'day', 4000,  0,   TRUE, 'planned',   1),
    (10, 1, 10, 'EV-55021-SEW',  'WALMART | PO-55021', 'production', 'sewing', '2026-08-03', '2026-08-19', 14, 'day', 25000, 15,  TRUE, 'planned',   1),
    (11, 1, 11, 'EV-20200-SEW',  'H&M | PO-20200',     'production', 'sewing', '2026-08-01', '2026-08-24', 20, 'day', 15000, 8,   TRUE, 'planned',   1);

-- Multi-stage chain for PO-10321 (document 3.5)
INSERT INTO planning_events
    (id, project_id, planning_order_id, event_code, event_name, event_type, production_stage,
     start_date, end_date, duration, duration_unit, planned_quantity, percent_done,
     manually_scheduled, event_status, created_by)
VALUES
    (12, 1, 4, 'EV-10321-CUT',  'ZARA Cutting',   'production', 'cutting',   '2026-08-01', '2026-08-03', 2, 'day', 12000, 100, TRUE,  'completed', 1),
    (13, 1, 4, 'EV-10321-WSH',  'ZARA Wash',      'production', 'wash',      '2026-08-15', '2026-08-16', 1, 'day', 12000, 0,   FALSE, 'planned',   1),
    (14, 1, 4, 'EV-10321-FIN',  'ZARA Finishing', 'production', 'finishing', '2026-08-16', '2026-08-17', 1, 'day', 12000, 0,   FALSE, 'planned',   1),
    (15, 1, 4, 'EV-10321-PCK',  'ZARA Packing',   'production', 'packing',   '2026-08-17', '2026-08-18', 1, 'day', 12000, 0,   FALSE, 'planned',   1);

-- Assignments
INSERT INTO planning_assignments (event_id, resource_id, units, assigned_quantity) VALUES
    (1, 1, 100, 8000), (2, 2, 100, 6000), (3, 2, 100, 7000), (4, 3, 100, 12000),
    (5, 4, 100, 5000), (6, 4, 100, 4000), (7, 5, 100, 20480), (8, 6, 100, 9000),
    (9, 6, 100, 4000), (10, 7, 100, 25000), (11, 8, 100, 15000),
    (12, 9, 100, 12000), (13, 10, 100, 12000), (14, 11, 100, 12000), (15, 12, 100, 12000);

-- Dependencies: Cutting -> Sewing -> Wash -> Finishing -> Packing (FS)
INSERT INTO planning_dependencies (project_id, from_event_id, to_event_id, dependency_type, lag, lag_unit) VALUES
    (1, 12, 4,  'FS', 0, 'day'),
    (1, 4,  13, 'FS', 0, 'day'),
    (1, 13, 14, 'FS', 0, 'day'),
    (1, 14, 15, 'FS', 0, 'day');
