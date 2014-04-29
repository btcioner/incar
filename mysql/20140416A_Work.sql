-- 活动状态中的业务,业务指某客户在某4S店对某车进行维修或保养等业务
CREATE TABLE IF NOT EXISTS t_work(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '业务唯一标识',
    work varchar(32) NOT NULL COMMENT '业务名称',
    step varchar(32) NOT NULL COMMENT '业务步骤',
    work_ref_id INT UNSIGNED COMMENT '引用的其它业务表比如t_slot_booking',
    org_id INT UNSIGNED COMMENT '业务提供方',
    car_id INT COMMENT '目标车辆',
    cust_id INT UNSIGNED COMMENT '客户',
    working_time DATETIME COMMENT '业务时间',
    json_args varchar(2048) COMMENT 'JSON形式的参数',
    created_time DATETIME COMMENT '创建时间',
    updated_time TIMESTAMP COMMENT '最后修改时间',
    INDEX IDX_WORK_1(org_id, work, step),
    INDEX IDX_WORK_2(car_id),
    INDEX IDX_WORK_3(cust_id)
);

-- 活动状态中的业务日志
CREATE TABLE IF NOT EXISTS t_work_log(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志序号',
    work_id INT UNSIGNED NOT NULL COMMENT '业务唯一标识'
        REFERENCES t_work(id),
    work varchar(32) NOT NULL COMMENT '业务名称',
    step varchar(32) NOT NULL COMMENT '业务步骤',
    json_args varchar(2048) COMMENT 'JSON形式的参数',
    log_time TIMESTAMP COMMENT '日志时间',
    INDEX IDX_WORK_LOG_1(work_id)
);

-- 历史业务,已终结的业务
CREATE TABLE IF NOT EXISTS t_work_history(
    id INT UNSIGNED PRIMARY KEY COMMENT '业务唯一标识',
    work varchar(32) NOT NULL COMMENT '业务名称',
    step varchar(32) NOT NULL COMMENT '业务步骤',
    work_ref_id INT UNSIGNED COMMENT '引用的其它业务表比如t_slot_booking',
    org_id INT UNSIGNED COMMENT '业务提供方',
    car_id INT COMMENT '目标车辆',
    cust_id INT UNSIGNED COMMENT '客户',
    working_time DATETIME COMMENT '业务时间',
    json_args varchar(2048) COMMENT 'JSON形式的参数',
    created_time DATETIME COMMENT '创建时间',
    updated_time TIMESTAMP COMMENT '最后修改时间',
    INDEX IDX_WORK_1(org_id, work, step),
    INDEX IDX_WORK_2(car_id),
    INDEX IDX_WORK_3(cust_id),
    INDEX IDX_WORK_4(created_time)
);

-- 历史业务日志,已终结的业务的日志
CREATE TABLE IF NOT EXISTS t_work_log_history(
    id INT UNSIGNED PRIMARY KEY COMMENT '日志序号',
    work_id INT UNSIGNED NOT NULL COMMENT '业务唯一标识'
        REFERENCES t_work_history(id),
    work varchar(32) NOT NULL COMMENT '业务名称',
    step varchar(32) NOT NULL COMMENT '业务步骤',
    json_args varchar(2048) COMMENT 'JSON形式的参数',
    log_time TIMESTAMP COMMENT '日志时间',
    INDEX IDX_WORK_LOG_1(work_id)
);