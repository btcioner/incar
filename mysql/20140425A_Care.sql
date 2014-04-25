-- 关怀记录
CREATE TABLE IF NOT EXISTS t_care_record(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    org_id INT UNSIGNED NOT NULL COMMENT '关怀发起组织',
    acc_id INT UNSIGNED COMMENT '关怀发起人id',
    car_id INT UNSIGNED NOT NULL COMMENT '被关怀车辆',
    cust_id INT UNSIGNED COMMENT '被关怀人id',
    care_time DATETIME NOT NULL COMMENT '关怀时间',
    work_id INT UNSIGNED COMMENT '关怀工作id',
    INDEX IDX_CARE_RECORD_1(org_id, car_id, care_time),
    INDEX IDX_CARE_RECORD_2(car_id)
);