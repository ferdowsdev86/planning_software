-- ---------------------------------------------------------------------------
-- MBM ERP Production Planning Module - database schema
-- Source: DOCUMENT/MBM ERP Production Planning Module.docx (section 4)
-- Target: MySQL @ 172.16.101.70, database `fastreact`
-- ---------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS fastreact CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fastreact;

-- 4.1 planning_projects
CREATE TABLE IF NOT EXISTS planning_projects (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    project_name VARCHAR(150) NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    plan_from DATE NOT NULL,
    plan_to DATE NOT NULL,
    plan_status ENUM('draft','under_review','approved','published','cancelled') DEFAULT 'draft',
    version_no INT DEFAULT 1,
    parent_project_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    approved_by BIGINT UNSIGNED NULL,
    approved_at DATETIME NULL,
    published_at DATETIME NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_planning_unit_dates (unit_id, plan_from, plan_to),
    INDEX idx_planning_status (plan_status)
);

-- 4.2 planning_resources
CREATE TABLE IF NOT EXISTS planning_resources (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    resource_code VARCHAR(50) NOT NULL UNIQUE,
    resource_name VARCHAR(150) NOT NULL,
    resource_type ENUM('sewing_line','cutting_table','wash_line','finishing_line','packing_line','machine','employee') NOT NULL,
    unit_id BIGINT UNSIGNED NOT NULL,
    floor_id BIGINT UNSIGNED NULL,
    department_id BIGINT UNSIGNED NULL,
    parent_resource_id BIGINT UNSIGNED NULL,
    default_calendar_id BIGINT UNSIGNED NULL,
    default_efficiency DECIMAL(8,2) DEFAULT 50,
    manpower INT DEFAULT 0,
    machine_count INT DEFAULT 0,
    capacity_minutes_per_day DECIMAL(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_resource_unit_type (unit_id, resource_type),
    INDEX idx_resource_floor (floor_id)
);

-- 4.3 planning_orders  (planning snapshot of ERP orders)
-- Note: suitable_lines JSON added to support the unplanned-panel
-- "Suitable lines" column from document section 3.2
CREATE TABLE IF NOT EXISTS planning_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    erp_order_id BIGINT UNSIGNED NOT NULL,
    erp_po_id BIGINT UNSIGNED NULL,
    buyer_id BIGINT UNSIGNED NULL,
    brand_id BIGINT UNSIGNED NULL,
    buyer_name VARCHAR(150) NULL,
    brand_name VARCHAR(150) NULL,
    style_no VARCHAR(100) NULL,
    po_number VARCHAR(100) NULL,
    order_code VARCHAR(100) NULL,
    item_description VARCHAR(250) NULL,
    product_category VARCHAR(100) NULL,
    order_quantity DECIMAL(14,2) NOT NULL,
    completed_quantity DECIMAL(14,2) DEFAULT 0,
    remaining_quantity DECIMAL(14,2) NOT NULL,
    smv DECIMAL(10,4) NOT NULL,
    pcd DATE NULL,
    sewing_start_required_date DATE NULL,
    shipment_date DATE NULL,
    priority INT DEFAULT 3,
    color_count INT DEFAULT 0,
    size_count INT DEFAULT 0,
    wash_required BOOLEAN DEFAULT FALSE,
    special_machine_required BOOLEAN DEFAULT FALSE,
    material_ready_date DATE NULL,
    suitable_lines JSON NULL,
    planning_status ENUM('unplanned','partially_planned','fully_planned','completed','cancelled') DEFAULT 'unplanned',
    source_updated_at DATETIME NULL,
    synced_at DATETIME NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_order_erp_order (erp_order_id),
    INDEX idx_order_po (po_number),
    INDEX idx_order_shipment (shipment_date),
    INDEX idx_order_status (planning_status)
);

-- 4.4 planning_events
CREATE TABLE IF NOT EXISTS planning_events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    planning_order_id BIGINT UNSIGNED NULL,
    event_code VARCHAR(50) NOT NULL UNIQUE,
    event_name VARCHAR(250) NOT NULL,
    event_type ENUM('production','setup','maintenance','holiday','trial_run','changeover','idle','buffer') DEFAULT 'production',
    production_stage ENUM('cutting','sewing','wash','finishing','packing','inspection','shipment') NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    duration DECIMAL(12,2) NULL,
    duration_unit ENUM('minute','hour','day') DEFAULT 'hour',
    planned_quantity DECIMAL(14,2) DEFAULT 0,
    completed_quantity DECIMAL(14,2) DEFAULT 0,
    percent_done DECIMAL(8,2) DEFAULT 0,
    scheduling_mode ENUM('normal','fixed_duration','fixed_effort') DEFAULT 'normal',
    manually_scheduled BOOLEAN DEFAULT FALSE,
    constraint_type VARCHAR(50) NULL,
    constraint_date DATETIME NULL,
    deadline_date DATETIME NULL,
    priority INT DEFAULT 3,
    event_status ENUM('draft','planned','confirmed','running','completed','delayed','cancelled') DEFAULT 'draft',
    risk_level ENUM('none','low','medium','high','critical') DEFAULT 'none',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_event_project_dates (project_id, start_date, end_date),
    INDEX idx_event_order (planning_order_id),
    INDEX idx_event_status (event_status)
);

-- 4.5 planning_assignments
CREATE TABLE IF NOT EXISTS planning_assignments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT UNSIGNED NOT NULL,
    resource_id BIGINT UNSIGNED NOT NULL,
    units DECIMAL(8,2) DEFAULT 100,
    assigned_quantity DECIMAL(14,2) DEFAULT 0,
    allocation_percentage DECIMAL(8,2) DEFAULT 100,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY uq_event_resource (event_id, resource_id),
    INDEX idx_assignment_resource (resource_id)
);

-- 4.6 planning_dependencies
CREATE TABLE IF NOT EXISTS planning_dependencies (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    from_event_id BIGINT UNSIGNED NOT NULL,
    to_event_id BIGINT UNSIGNED NOT NULL,
    dependency_type ENUM('FS','SS','FF','SF') DEFAULT 'FS',
    lag DECIMAL(10,2) DEFAULT 0,
    lag_unit ENUM('minute','hour','day') DEFAULT 'hour',
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_dependency_from (from_event_id),
    INDEX idx_dependency_to (to_event_id)
);

-- 4.7 planning_calendars
CREATE TABLE IF NOT EXISTS planning_calendars (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    calendar_code VARCHAR(50) NOT NULL UNIQUE,
    calendar_name VARCHAR(150) NOT NULL,
    unit_id BIGINT UNSIGNED NULL,
    calendar_type ENUM('factory','department','resource','special') DEFAULT 'factory',
    hours_per_day DECIMAL(8,2) DEFAULT 10,
    days_per_week DECIMAL(8,2) DEFAULT 6,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
);

-- 4.8 planning_calendar_intervals
CREATE TABLE IF NOT EXISTS planning_calendar_intervals (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    calendar_id BIGINT UNSIGNED NOT NULL,
    interval_type ENUM('working','non_working','holiday','overtime','shutdown') NOT NULL,
    interval_name VARCHAR(150) NULL,
    recurrent_rule VARCHAR(250) NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    weekday_no TINYINT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_calendar_interval (calendar_id, start_date, end_date)
);

-- 4.9 resource_capacity_history
CREATE TABLE IF NOT EXISTS resource_capacity_history (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    effective_date DATE NOT NULL,
    manpower INT NOT NULL,
    machine_count INT DEFAULT 0,
    planned_efficiency DECIMAL(8,2) NOT NULL,
    working_minutes DECIMAL(10,2) NOT NULL,
    available_minutes DECIMAL(14,2) NOT NULL,
    reason VARCHAR(250) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY uq_resource_capacity_date (resource_id, effective_date)
);

-- 4.10 planning_versions
CREATE TABLE IF NOT EXISTS planning_versions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    version_no INT NOT NULL,
    version_name VARCHAR(100) NULL,
    snapshot_json JSON NOT NULL,
    change_summary TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NULL,
    UNIQUE KEY uq_project_version (project_id, version_no)
);

-- 4.11 planning_change_logs
CREATE TABLE IF NOT EXISTS planning_change_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    event_id BIGINT UNSIGNED NULL,
    action_type VARCHAR(50) NOT NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    reason VARCHAR(500) NULL,
    changed_by BIGINT UNSIGNED NOT NULL,
    changed_at DATETIME NOT NULL,
    ip_address VARCHAR(45) NULL,
    INDEX idx_change_project (project_id),
    INDEX idx_change_event (event_id)
);

-- 4.13 day_production_update_plan
-- Line-wise daily actual production entered from the "Daily production
-- update" window; one row per strip (event) per save_date
CREATE TABLE IF NOT EXISTS day_production_update_plan (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT UNSIGNED NULL,          -- planning_events.id when the strip came from the DB
    event_ref VARCHAR(50) NOT NULL,         -- board event id (e.g. db-7 / o3)
    unit VARCHAR(50) NULL,
    floor VARCHAR(50) NULL,
    line VARCHAR(100) NULL,
    operation_type VARCHAR(50) DEFAULT 'Sewing',
    style VARCHAR(100) NULL,
    order_no VARCHAR(100) NULL,
    po_number VARCHAR(100) NULL,
    color VARCHAR(50) NULL,
    order_qty DECIMAL(14,2) DEFAULT 0,
    day_plan_qty DECIMAL(14,2) DEFAULT 0,
    prod_qty DECIMAL(14,2) NOT NULL DEFAULT 0,
    save_date DATE NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY uq_dpu_event_date (event_ref, save_date),
    INDEX idx_dpu_date (save_date),
    INDEX idx_dpu_po (po_number)
);

-- 4.12 efficiency_profile: per line + product type efficiency (and the
-- average SMV of that product's strips on that line, when planned)
CREATE TABLE IF NOT EXISTS efficiency_profile (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    line VARCHAR(100) NOT NULL,
    profile_name VARCHAR(150) NULL,
    product_type VARCHAR(100) NOT NULL,
    efficiency_pct DECIMAL(6,2) DEFAULT 0,
    smv DECIMAL(8,2) NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY uq_eff_profile (line, product_type)
);

-- 4.13 learning_curve: build up curves - day number and efficiency %
CREATE TABLE IF NOT EXISTS learning_curve (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    curve_name VARCHAR(150) NOT NULL,
    period_days INT DEFAULT 1,
    day_number INT NOT NULL,
    efficiency_pct DECIMAL(6,2) DEFAULT 0,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    UNIQUE KEY uq_learning (curve_name, day_number)
);

-- 4.14 ai_planning_proposals
CREATE TABLE IF NOT EXISTS ai_planning_proposals (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT UNSIGNED NOT NULL,
    proposal_code VARCHAR(50) NOT NULL UNIQUE,
    model_provider ENUM('anthropic','openai','internal') NOT NULL,
    model_name VARCHAR(100) NULL,
    request_summary TEXT NOT NULL,
    constraints_json JSON NOT NULL,
    proposal_json JSON NOT NULL,
    estimated_result_json JSON NULL,
    proposal_status ENUM('generated','under_review','accepted','partially_accepted','rejected','expired') DEFAULT 'generated',
    generated_by BIGINT UNSIGNED NOT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at DATETIME NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL
);
