-- 柳明:远程检测新增表

-- 提醒信息
CREATE TABLE IF NOT EXISTS t_remind(
  id int auto_increment PRIMARY KEY COMMENT '提醒编号',
  obdCode VARCHAR(32) COMMENT 'OBD设备唯一编码',
  remindType tinyint COMMENT '提醒类型(1-碰撞提醒)',
  remindStatus tinyint COMMENT '提醒状态(1-未处理，2-已处理)',
  createTime DATETIME COMMENT '创建时间',
  careTime DATETIME COMMENT '处理时间'
);

-- 行车检测
CREATE TABLE IF NOT EXISTS t_car_detection(
    id int auto_increment PRIMARY KEY COMMENT '主键',
    obdCode VARCHAR(32) COMMENT 'OBD设备唯一编码',
    tripId int COMMENT '行程标识',
    faultLevel tinyint COMMENT '故障等级',
    faultCount tinyint COMMENT '故障个数',
    fault VARCHAR(2000) COMMENT '故障内容',
    createTime DATETIME COMMENT '处理时间'
);

CREATE TABLE IF NOT EXISTS t_obd_statistics(
    id int auto_increment COMMENT '主键',
    s4Id int COMMENT '4S店Id',
    obdCode varchar(20) COMMENT 'OBD设备号',
    year int COMMENT '年份',
    month varchar(20) COMMENT '月份',
    mileageMth int COMMENT '当月总里程',
    countMth int COMMENT '当月总用车次数',
    avgOilMth float(5,1) COMMENT '当月平均油耗',
    speedMth int COMMENT '当月平均车速',
    type    tinyint COMMENT '统计类型1普通2当月小计',
    markTime timestamp COMMENT '标识日期',
    primary key (id));