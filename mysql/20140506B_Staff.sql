-- 20140312 XGH 创建用户帐号表,以表仅存储INCAR自已的员工
CREATE TABLE IF NOT EXISTS t_staff(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户帐号唯一ID',
    s4_id INT UNSIGNED COMMENT 'NULL表示INCAR员工,其它为4S店员工',
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
REPLACE t_staff(id, name, pwd, nick, last_login_time)
    VALUES(1, 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', '超级管理员', '0000-00-00');
