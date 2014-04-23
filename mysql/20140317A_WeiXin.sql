-- 20140316 Jesse Qu -- Tables of WeiXin

CREATE TABLE IF NOT EXISTS t_wx_service_account(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '服务号帐号唯一ID',
    openid VARCHAR(256) NOT NULL UNIQUE COMMENT '服务号帐号openid',
    nickname VARCHAR(64) NOT NULL COMMENT '服务号帐号昵称',
    login VARCHAR(256) NOT NULL COMMENT '服务账号的微信公众平台登录名称',
    pwd CHAR(40) NOT NULL COMMENT '服务账号的微信公众平台登录密码（16进制SHA1-160BITS密码散列值）',
    name VARCHAR(256) NOT NULL COMMENT '服务账号的所有者公司名称',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '服务状态 0-禁用 1-启用',
    description VARCHAR(512) COMMENT '简要说明性文字',
    orgId int COMMENT '组织Id',
    INDEX IX_SERVICE_ACCOUNT_1(openid)
);
CREATE TABLE IF NOT EXISTS t_wx_service_org(
    id UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    serviceId VARCHAR(32) COMMENT '微信服务账号Id',
    orgId INT UNSIGNED COMMENT '组织ID',
    UNIQUE UNQ_WX_ORG(serviceId, orgId),
    INDEX IDX_WX_ORG(orgId)
);
CREATE TABLE IF NOT EXISTS t_wx_user(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '关注用户帐号唯一ID',
    openid VARCHAR(256) NOT NULL UNIQUE COMMENT '关注用户帐号openid',
    sopenid VARCHAR(256) NOT NULL COMMENT '关注服务号帐号openid',
    nickname VARCHAR(64) NOT NULL COMMENT '关注用户帐号昵称',
    sex TINYINT NOT NULL DEFAULT '0' COMMENT '用户的性别 1-男性 2-女性 0-未知',
    city VARCHAR(32) COMMENT '关注用户的城市',
    country VARCHAR(64) COMMENT '关注用户的国家',
    province VARCHAR(64) COMMENT '关注用户的省份',
    language VARCHAR(64) COMMENT '关注用户的语言',
    headimgurl VARCHAR(512) COMMENT '关注用户帐号头像的URL',
    subscribe TINYINT NOT NULL DEFAULT '1' COMMENT '关注状态 0-未关注 1-已关注',
    subscribe_time timestamp,
    INDEX IX_USER_1(openid)
);

CREATE TABLE IF NOT EXISTS t_wx_user_obd(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '映射关系记录ID',
    wx_user_id INT UNSIGNED COMMENT '微信用户ID',
    obd_code VARCHAR(32) NOT NULL COMMENT 'OBD设备唯一编码',
    owner_flag TINYINT NOT NULL DEFAULT '0' COMMENT '车主标志 0-普通关联 1-车主关联',
    enroll_time timestamp COMMENT '微信用户登记OBD设备时间',

	INDEX IX_USER_OBD_1(wx_user_id),
    INDEX IX_USER_OBD_2(obd_code),

    CONSTRAINT FK_wx_user FOREIGN KEY (wx_user_id) REFERENCES t_wx_user(id),
    CONSTRAINT FK_device_obd FOREIGN KEY (obd_code) REFERENCES t_device_obd(obd_code)
);

INSERT INTO `incar`.`t_wx_user_obd` (`wx_user_id`, `obd_code`, `owner_flag`, `enroll_time`)
VALUES (1, 'WFQ00012925', 1, now());

CREATE TABLE IF NOT EXISTS t_promotion_slot(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '工位营销ID',
    storeId INT UNSIGNED NOT NULL COMMENT '组织ID、4S店ID',
    slot_location VARCHAR(64) NOT NULL COMMENT '工位信息',
    slot_time timestamp COMMENT '工位时间',
    benefit  VARCHAR(64) NOT NULL COMMENT '优惠',
    description  VARCHAR(512) COMMENT '优惠条例描述',
    promotion_time timestamp COMMENT '营销开始时间',
    promotion_status TINYINT NOT NULL DEFAULT '0' COMMENT '有效性标志 0-无效 1-有效',
    tc VARCHAR(32) COMMENT '记录操作用户名',
    ts timestamp COMMENT '记录操作时间戳',

	INDEX IX_PROMOTION_SLOT_1(id),

    CONSTRAINT FK_staff_org FOREIGN KEY (storeId) REFERENCES t_staff_org(id)
);

CREATE TABLE IF NOT EXISTS t_slot_booking(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '工位预约ID',
    storeId INT UNSIGNED NOT NULL COMMENT '组织ID、4S店ID',

    slot_location VARCHAR(64) COMMENT '工位物理空间信息',
    slot_time timestamp NOT NULL COMMENT '工位时间信息',

    promotion_id INT UNSIGNED COMMENT '是否是某次营销优惠活动中的，如是，这里填写活动中的PromotionSlotID，如不是则为NULL。',

    channel VARCHAR(32) NOT NULL COMMENT '申请渠道 weixin mobileApp website telephone',
    channel_specific VARCHAR(256) COMMENT '申请渠道指定信息',

    booking_time timestamp NOT NULL COMMENT '预约申请时间',
    booking_status TINYINT NOT NULL DEFAULT '0' COMMENT '预约申请状态 0-无效 1-已申请待确认 2-被拒 3-成功批准 4-被取消',

    tc VARCHAR(32) COMMENT '记录操作用户名',
    ts timestamp COMMENT '记录操作时间戳',

	INDEX IX_PROMOTION_SLOT_1(id)
);
