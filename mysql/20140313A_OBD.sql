-- 创建OBD原始数据表
CREATE TABLE IF NOT EXISTS t_obd_history(
    id int auto_increment,
    obdCode varchar(20),
    vin varchar(20),
    ipAddress varchar(20),
    port varchar(5),
    content varchar(1000),
    receiveDate timestamp,
    primary key (id));

-- 创建OBD基本信息表
CREATE TABLE IF NOT EXISTS t_obd_info(
    id int auto_increment,
    obdCode varchar(20),
    vin varchar(20),
    hardwareVersion varchar(20),
    firmwareVersion varchar(20),
    softwareVersion varchar(20),
    diagnosisType int,
    initCode int,
    isCodeClear int,
    brand int,
    series int,
    modelYear int,
    addressParam varchar(30),
    portParam int,
    addressUpload varchar(30),
    portUpload int,
    addressAlarm varchar(30),
    portAlarm int,
    addressMessage varchar(30),
    portMessage int,
    criticalVoltage int,
    uploadInterval int,
    voltageThreshold varchar(100),
    closeAfterFlameOut int,
    updateId varchar(18),
    createTime timestamp,
    lastUpdateTime timestamp,
    primary key (id));

-- 创建车辆驾驶信息表
CREATE TABLE IF NOT EXISTS t_obd_drive(
    id int auto_increment,
    obdCode varchar(20),
    vin varchar(20),
    brand int,
    series int,
    modelYear int,
    firingVoltage varchar(30),
    runTime long,
    currentMileage long,
    currentAvgOilUsed double,
    speedingTime long,
    speedUp int,
    speedDown int,
    sharpTurn int,
    flameVoltage varchar(30),
    avgOilUsed double,
    mileage long,
    voltageAfter varchar(30),
    carStatus int,
    fireTime timestamp,
    flameOutTime timestamp,
    primary key (id));

 -- 创建车辆驾驶详情表
CREATE TABLE IF NOT EXISTS t_drive_detail(
    id int auto_increment,
    obdCode varchar(20),
    obdDriveId int,
    faultCode varchar(1000),
    avgOilUsed double,
    mileage long,
    carCondition varchar(3000),
    createTime timestamp,
    primary key (id));

-- 创建车辆报警表
CREATE TABLE IF NOT EXISTS t_obd_alarm(
    id int auto_increment,
    obdCode varchar(20),
    vin varchar(20),
    brand int,
    series int,
    modelYear int,
    alarmType int,
    faultCode varchar(300),
    createTime timestamp,
    primary key (id));
-- 创建车况字典表
CREATE TABLE IF NOT EXISTS t_drive_condition(
    id int auto_increment,
    code int,
    unit varchar(20),
    tip varchar(30),
    description varchar(200),
    valueMin int,
    valueMax int,
    fmt varchar(10)
    primary key (id));

-- 处理主外键关系
ALTER TABLE t_drive_detail
    ADD CONSTRAINT FK_drive_detail FOREIGN KEY (obdDriveId) REFERENCES t_obd_drive(id);