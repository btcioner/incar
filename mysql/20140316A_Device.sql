CREATE TABLE IF NOT EXISTS t_car_info(
    id int auto_increment       COMMENT '车辆编号',
    obd_code VARCHAR(32) UNIQUE COMMENT 'OBD设备唯一编码',
    act_type TINYINT DEFAULT 0  COMMENT 'OBD激活状态 0-未激活 1-已激活 2-故障',
    sim_number VARCHAR(16)      COMMENT '插在OBD设备上的SIM卡的电话号码',
    brand int                   COMMENT '品牌',
    series int                  COMMENT '车型',
    modelYear   int             COMMENT '年款',
    license varchar(30)         COMMENT '车牌号',
    mileage long                COMMENT '初始里程数',
    comment VARCHAR(32)         COMMENT '简要说明性文字',
    created_date DATE           COMMENT '创建日期',
    primary key (id));

CREATE TABLE IF NOT EXISTS t_car_org(
    car_id int COMMENT '车辆编号',
    org_id int UNSIGNED COMMENT '组织ID',
    maintenanceMileage long COMMENT '此次保养里程数',
    maintenanceContent varchar(200) comment '保养内容',
    maintenanceAmount int comment '保养金额',
    maintenanceTime timestamp COMMENT '保养时间'
    );
