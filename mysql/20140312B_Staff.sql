-- 20140312 XGH 创建用户帐号表
CREATE TABLE IF NOT EXISTS t_staff_account(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户帐号唯一ID',
    name VARCHAR(32) NOT NULL UNIQUE COMMENT '用户帐号名称,用于登录',
    pwd CHAR(40) NOT NULL COMMENT '16进制SHA1-160BITS密码散列值',
    nick VARCHAR(32) NOT NULL COMMENT '用户昵称,被显示在UI上',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '0-禁用 1-启用',
    last_login_time TIMESTAMP COMMENT '上次登录时间',
    last_login_ip VARCHAR(40) COMMENT '上次登录IP地址',
    email VARCHAR(256) COMMENT '电子邮件地址,用于重置密码',
    phone VARCHAR(32) COMMENT '联系电话'
);

-- 20140312 XGH 内置admin帐号
REPLACE t_staff_account(id, name, pwd, nick, last_login_time)
    VALUES(1, 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', '超级管理员', '0000-00-00');

-- 20140312 XGH 创建组织表
CREATE TABLE IF NOT EXISTS t_staff_org(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '组织唯一ID',
    name VARCHAR(32) NOT NULL COMMENT '组织名称',
    class VARCHAR(32) COMMENT '组织级别,如:集团总店,4S店',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '0-禁用 1-启用',
    openid VARCHAR(256) COMMENT '微信服务号open id',
    prov VARCHAR(16) COMMENT '省',
    city VARCHAR(16) COMMENT '市',
    INDEX IX_STAFF_ORG_1(name)
);

CREATE TABLE IF NOT EXISTS t_account_channel(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户渠道ID',
    accountId int COMMENT '用户ID',
    orgId int COMMENT '组织ID',
    channelCode varchar(10) COMMENT '渠道Code',
    channelKey varchar(100) COMMENT '渠道标示',
    priority int COMMENT '优先级，用来标示主次关系(1主0次)'
);
CREATE TABLE IF NOT EXISTS t_account_obd(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    accountId int COMMENT '用户ID',
    obdCode varchar(32) COMMENT 'OBD编号',
    owner   int COMMENT '用户和OBD的主次关系',
    UNIQUE UNQ_ACCOUNT_OBD(accountId, obdCode),
    INDEX IDX_ACCOUNT_OBD(accountId)
);
CREATE TABLE IF NOT EXISTS t_channel(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '渠道ID',
    code varchar(10) comment '渠道识别码'
    name varchar(30) COMMENT '渠道名称',
    comment varchar(100) COMMENT '其他说明'
);

-- 20140316 XGH 内置'英卡科技'组织
REPLACE t_staff_org(id, name, class) VALUES(1, '英卡科技', 'TOP');

-- 20140315 XGH 创建组织关系表
CREATE TABLE IF NOT EXISTS t_staff_org_relation(
    parent_org_id INT UNSIGNED COMMENT '上级组织ID',
    child_org_id INT UNSIGNED COMMENT '子级组织ID',
    UNIQUE UNQ_STAFF_ORG_RELATION_1(parent_org_id, child_org_id),
    INDEX IX_STAFF_ORG_RELATION_2(child_org_id)
);

-- 20140312 XGH 创建组织成员关系表
CREATE TABLE IF NOT EXISTS t_staff_org_member(
    org_id INT UNSIGNED NOT NULL COMMENT '组织唯一ID',
    account_id INT UNSIGNED NOT NULL COMMENT '用户帐号唯一ID',
    join_time TIMESTAMP COMMENT '用户加入组织的时间',
    role VARCHAR(16) COMMENT '用户在此组织中的角色,如:管理员,销售',
    UNIQUE UNQ_STAFF_ORG_MEMBER_1 (org_id, account_id, role),
    INDEX IX_STAFF_ORG_MEMBER_2(account_id)
);

-- 20140316 XGH 内置'英卡科技'的管理员
REPLACE t_staff_org_member(org_id, account_id, role)
    VALUES(1, 1, 'ADMIN');
