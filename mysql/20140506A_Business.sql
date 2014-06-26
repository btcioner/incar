-- 20140506 XGH 用户隔离在4S店内部
CREATE TABLE IF NOT EXISTS t_4s(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '4S唯一ID',
    name VARCHAR(32) NOT NULL COMMENT '4S店名称',
    short_name VARCHAR(32) UNIQUE NOT NULL COMMENT '登录后缀名',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '0-禁用 1-启用',
    openid VARCHAR(256) COMMENT '微信服务号open id',
    prov VARCHAR(16) COMMENT '省',
    city VARCHAR(16) COMMENT '市',
    description VARCHAR(512) COMMENT '简要说明性文字',
    brand int COMMENT '品牌',
    logo_url VARCHAR(256) COMMENT '标志图片URL建议为200x200',
    address VARCHAR(256) COMMENT '地址',
    phone VARCHAR(32) COMMENT '联系电话',
    hotline VARCHAR(32) COMMENT '客服热线电话',
    wx_login VARCHAR(256) COMMENT '服务账号的微信公众平台登录名称',
    wx_pwd VARCHAR(64) COMMENT '服务账号的微信公众平台登录密码',
    wx_app_name VARCHAR(64) COMMENT '微信公众平台接口用户标识',
    wx_app_id VARCHAR(64) COMMENT '微信公众平台接口调用凭据AppId',
    wx_app_secret VARCHAR(128) COMMENT '微信公众平台接口调用凭据AppSecret',
    wx_status TINYINT NOT NULL DEFAULT '1' COMMENT '服务状态 0-禁用 1-启用',

    INDEX IX_4S_NAME(name)
);

CREATE TABLE IF NOT EXISTS t_account(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户帐号唯一ID',
    s4_id INT UNSIGNED NOT NULL COMMENT '用户帐号所在的4S店',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '0-禁用 1-启用',

    name VARCHAR(32) NOT NULL COMMENT '用户帐号名称,用于登录',
    pwd CHAR(40) NOT NULL COMMENT '16进制SHA1-160BITS密码散列值',
    wx_oid VARCHAR(512) COMMENT '微信渠道标识,一对open_id',
    tel_sn VARCHAR(8) COMMENT '电话渠道标识',
    tel_pwd CHAR(40) NOT NULL COMMENT '电话渠道密码,纯数字,16进制SHA1-160BITS密码散列值',

    -- profile content
    nick VARCHAR(32) NOT NULL COMMENT '用户昵称,被显示在UI上',
    email VARCHAR(256) COMMENT '电子邮件地址,用于重置密码',
    phone VARCHAR(32) COMMENT '联系电话',
    sex TINYINT NOT NULL DEFAULT '0' COMMENT '用户的性别 1-男性 2-女性 0-未知',
    city VARCHAR(32) COMMENT '关注用户的城市',
    country VARCHAR(64) COMMENT '关注用户的国家',
    province VARCHAR(64) COMMENT '关注用户的省份',
    language VARCHAR(64) COMMENT '关注用户的语言',
    headimgurl VARCHAR(512) COMMENT '关注用户帐号头像的URL',

    last_login_time TIMESTAMP COMMENT '上次登录时间',
    last_login_src VARCHAR(40) COMMENT '上次登录源',

    UNIQUE UNQ_4S_NAME(s4_id,name),
    UNIQUE UNQ_4S_TEL(s4_id,tel_sn),
    INDEX IX_PHONE(phone)
);

CREATE TABLE IF NOT EXISTS t_car(
    id int auto_increment PRIMARY KEY COMMENT '车辆编号',
    s4_id int unsigned          COMMENT '车辆所在4S店ID,NULL表示InCar',

    license varchar(30)         COMMENT '车牌号',

    obd_code VARCHAR(32) UNIQUE COMMENT 'OBD设备唯一编码',
    act_type TINYINT DEFAULT 0  COMMENT 'OBD激活状态 0-未激活 1-已激活 2-故障',
    act_time DATETIME           COMMENT '激活时间',
    sim_number VARCHAR(16)      COMMENT '插在OBD设备上的SIM卡的电话号码',

    brand int                   COMMENT '品牌',
    series int                  COMMENT '车型',
    modelYear   int             COMMENT '年款',
    engineType varchar(5)       COMMENT '发动机类型',
    disp decimal(4,2)           COMMENT '发动机排量',
    mileage long                COMMENT '校准里程数',
    age date                    COMMENT '车龄',

    comment VARCHAR(32)         COMMENT '简要说明性文字',
    created_date DATE           COMMENT '创建日期',

    hardwareVersion varchar(20) COMMENT '硬件版本号',
    firmwareVersion varchar(20) COMMENT '固件版本号',
    softwareVersion varchar(20) COMMENT '软件版本号',
    diagnosisType int           COMMENT '诊断类型',
    initCode int                COMMENT '恢复出厂设置序列号',

    UNIQUE UNQ_4S_LICENSE(s4_id, license)
);

-- 20140329 XGH 车的使用者
CREATE TABLE IF NOT EXISTS t_car_user(
    s4_id INT UNSIGNED COMMENT '归属4S店',
    acc_id INT UNSIGNED COMMENT '使用车辆的人',
    car_id INT COMMENT '车辆唯一ID',
    user_type TINYINT COMMENT '0-无效 1-车主 2-其它使用人',
    join_time TIMESTAMP COMMENT '时间戳',
    UNIQUE UNQ_CAR_USER_1(s4_id, acc_id, car_id),
    INDEX IX_CAR_USER_2(s4_id, car_id, acc_id)
);
-- 标签大类表
CREATE TABLE IF NOT EXISTS t_tag_group(
    id int PRIMARY KEY COMMENT '编号',
    name varchar(50) COMMENT '标签大类名称',
    description varchar(300) COMMENT '标签大类说明',
    type tinyint COMMENT '0-系统标签 1-自定义标签'
);
-- 标签表
CREATE TABLE IF NOT EXISTS t_tag(
    id int auto_increment PRIMARY KEY COMMENT '标签编号',
    code varchar(50) COMMENT '标签标识',
    name varchar(50) COMMENT '标签名称',
    description varchar(300) COMMENT '标签说明',
    active tinyint COMMENT '0-不可用 1-可用',
    groupId int COMMENT '标签大类Id',
    createTime timestamp COMMENT '创建时间',
    creator varchar(30) COMMENT '创建人',
    s4Id int COMMENT '4S店Id',
    index idx_tag_code(code)
);
-- 车标签关系
CREATE TABLE IF NOT EXISTS t_car_tag(
    tag_id int COMMENT '标签ID',
    car_id int COMMENT '车ID',
    UNIQUE unq_car_tag(tag_id,car_id),
    INDEX idx_car_tag(tag_id,car_id)
);
-- 提醒信息
CREATE TABLE IF NOT EXISTS t_remind(
    id int auto_increment PRIMARY KEY COMMENT '提醒编号',
    obdCode VARCHAR(32) COMMENT 'OBD设备唯一编码',
    remindType tinyint COMMENT '提醒类型(1-碰撞提醒)',
    remindStatus tinyint COMMENT '提醒状态(1-未处理，2-已处理)',
    createTime timestamp COMMENT '创建时间',
    careTime timestamp COMMENT '处理时间'
);
