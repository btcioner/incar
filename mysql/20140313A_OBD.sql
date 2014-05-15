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
    id int auto_increment COMMENT '主键',
    obdCode varchar(20) COMMENT 'OBD设备号',
    tripId  int COMMENT 'tripId',
    vin varchar(20) COMMENT 'vin码(车辆身份证)',

    hardwareVersion varchar(20) COMMENT '硬件版本号',
    firmwareVersion varchar(20) COMMENT '固件版本号',
    softwareVersion varchar(20) COMMENT '软件版本号',
    diagnosisType int COMMENT '诊断类型',

    actionCount int COMMENT '执行动作数量(0x00或0x02)',
    initCode int COMMENT '恢复出厂设置序列号',
    isCodeClear int COMMENT '是否清码',

    carUpdateCount int COMMENT '车辆信息更新数量(0x00或0x05)',
    vid int COMMENT 'vid',
    brand int COMMENT '品牌',
    series int COMMENT '系列',
    modelYear int COMMENT '年款',
    engineDisplacement varchar(10) COMMENT '发动机排量',

    serverConfigCount int COMMENT '网络参数更新数量(0x00-0x05)',
    addressParam varchar(30) COMMENT '获取参数数据地址',
    portParam int COMMENT '获取参数数据端口',
    addressUpload varchar(30) COMMENT '主动上传数据地址',
    portUpload int COMMENT '主动上传数据端口',
    addressAlarm varchar(30) COMMENT '报警数据上传地址',
    portAlarm int COMMENT '报警数据上传端口',
    addressMessage varchar(30) COMMENT '短信回复数据地址',
    portMessage int COMMENT '短信回复数据端口',
    addressLocation varchar(30) COMMENT '定位数据地址',
    portLocation int COMMENT '定位数据端口',

    locationCount int COMMENT '定位信息更新数量(0x00或0x03)',
    metrePerLocation int COMMENT '每行驶多少米定位一次',
    secondsPerLocation int COMMENT '每过多少秒定位一次',
    locationModel int COMMENT '定位模式/距离与时间的关系(0x00与关系，两者同时满足时定位;0x01或关系，两者有一个满足时定位)',

    alarmCount int COMMENT '报警信息更新数量(0x00或0x04)',
    overSpeed int COMMENT '超速临界值(单位km/h，超过此值被判定为超速，默认120km/h)',
    overSpeedTime int COMMENT '超速持续时间(单位秒，超速持续多少秒时报警，默认6秒)',
    waterTemperatureAlarm int COMMENT '水温报警值(单位℃，默认110℃)',
    voltageAlarm int COMMENT '报警电压(单位0.1V，默认132，即13.2V)',

    fireOffCount int COMMENT '熄火后信息更新数量(0x00或0x03)',
    criticalVoltage int COMMENT '关机临界电压',
    closeAfterFlameOut int COMMENT '熄火后关闭时间点',
    voltageThreshold varchar(100) COMMENT '熄火后电池电压阀值',

    runtimeCount int COMMENT '运行中数据更新数量(0x00或0x02，暂时只支持0x00)',
    uploadInterval int COMMENT '行驶中上传数据间隔时间',
    uploadParamId varchar(2000) COMMENT '行驶中上传数据参数Id，参考4.01和4.02',

    updateId varchar(18) COMMENT '软件升级ID',
    createTime timestamp COMMENT '创建日期',
    lastUpdateTime timestamp COMMENT '最后更新日期',
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