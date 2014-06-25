-- 创建OBD原始数据表
CREATE TABLE IF NOT EXISTS t_obd_history(
    id int auto_increment,
    obdCode varchar(20),
    tripId  int COMMENT 'tripId',
    vid varchar(20) COMMENT 'vid',
    vin varchar(20),
    ipAddress varchar(20),
    port varchar(5),
    content varchar(1000),
    receiveDate timestamp,
    primary key (id));


-- 创建车辆行程信息表
CREATE TABLE IF NOT EXISTS t_obd_drive(
    id int auto_increment COMMENT '主键',
    obdCode varchar(20) COMMENT 'OBD设备号',
    tripId int COMMENT '行程标识',
    vid varchar(20) COMMENT '车辆标识',
    vin varchar(20) COMMENT '发动机标识',
    receiveTime timestamp COMMENT '接收数据时间',

    fireTime timestamp COMMENT '点火时间',
    firingVoltage varchar(30) COMMENT '点火电压',

    fireSpeed int COMMENT '点火定位时车速',
    fireDistance int COMMENT '点火定位时行驶距离',
    fireLongitude varchar(20) COMMENT '点火定位时经度',
    fireLatitude varchar(20) COMMENT '点火定位时纬度',
    fireDirection float COMMENT '点火定位时方向',
    fireLocationTime timestamp COMMENT '点火定位时间',
    fireLocationType int COMMENT '点火定位类型',

    runTime int COMMENT '发动机运行时间',
    currentMileage int COMMENT '本次驾驶行驶里程',
    currentAvgOilUsed float COMMENT '本次驾驶平均油耗',
    mileage int COMMENT '累计行驶里程',
    avgOilUsed float COMMENT '累计平均油耗',

    speedGroup varchar(1000) COMMENT '本行程车速分组统计(JSON)',

    speedingTime int COMMENT '超速行驶时间',
    speedUp int COMMENT '急加速次数',
    speedDown int COMMENT '急减速次数',
    sharpTurn int COMMENT '急转弯次数',
    speedMax int COMMENT '最高车速',

    flameOutSpeed int COMMENT '熄火定位时车速',
    flameOutDistance int COMMENT '熄火定位时行驶距离',
    flameOutLongitude varchar(20) COMMENT '熄火定位时经度',
    flameOutLatitude varchar(20) COMMENT '熄火定位时纬度',
    flameOutDirection float COMMENT '熄火定位时方向',
    flameOutLocationTime timestamp COMMENT '熄火定位时间',
    flameOutLocationType int COMMENT '熄火定位类型(1-基站定位,2-GPS定位)',

    flameOutVoltage varchar(30) COMMENT '熄火时蓄电池电压',

    carStatus tinyint COMMENT '车辆当前状态(启动、行驶、熄火、完成、异常)12345',
    flameOutTime timestamp COMMENT '熄火时间',
    lastUpdateTime timestamp COMMENT '最后更新时间',
    primary key (id));

 -- 创建车辆驾驶详情表
CREATE TABLE IF NOT EXISTS t_drive_detail(
    id int auto_increment,
    obdCode varchar(20),
    obdDriveId int,
    detail varchar(3000),
    createTime timestamp,
    primary key (id));

-- 创建车辆报警表
CREATE TABLE IF NOT EXISTS t_obd_alarm(
    id int auto_increment COMMENT '主键',
    obdCode varchar(20) COMMENT 'OBD编号',
    tripId int COMMENT '行程标识',
    vid varchar(20) COMMENT '车辆标识',
    vin varchar(20) COMMENT '发动机标识',
    speed int COMMENT '定位时车速',
    travelDistance int COMMENT '定位时行驶距离',
    longitude varchar(20) COMMENT '定位时经度',
    latitude varchar(20) COMMENT '定位时纬度',
    direction float COMMENT '定位时方向',
    locationTime timestamp COMMENT '定位时间',
    locationType int COMMENT '定位类型',
    alarmType int COMMENT '报警类型',
    faultInfo varchar(1000) COMMENT '故障信息',
    createTime timestamp COMMENT '报警数据接收时间',
    primary key (id));
-- 创建车况字典表
CREATE TABLE IF NOT EXISTS t_drive_dictionary(
    id int auto_increment,
    code int,
    unit varchar(20),
    tip varchar(30),
    description varchar(200),
    valueMin int,
    valueMax int,
    fmt varchar(10),
    primary key (id));

-- 处理主外键关系
ALTER TABLE t_drive_detail
    ADD CONSTRAINT FK_drive_detail FOREIGN KEY (obdDriveId) REFERENCES t_obd_drive(id);