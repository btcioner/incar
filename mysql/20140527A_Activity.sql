-- 活动模版
CREATE TABLE IF NOT EXISTS t_activity_template(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '唯一标识',
    s4_id INT UNSIGNED NOT NULL COMMENT '所属4S店',
    name VARCHAR(64) NOT NULL COMMENT '模版名称,用于标识活动类型',
    template VARCHAR(32) NOT NULL COMMENT '模版内部名称',
    title VARCHAR(64) NOT NULL COMMENT '活动标题',
    brief VARCHAR(4096) COMMENT '活动简述',
    awards VARCHAR(4096) COMMENT '活动颁奖简述',
    INDEX IDX_ACT_1(s4_id,name)
);

-- 活动通用信息
CREATE TABLE IF NOT EXISTS t_activity(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '唯一标识',
    s4_id INT UNSIGNED NOT NULL COMMENT '所属4S店',
    template_id INT UNSIGNED NOT NULL COMMENT '活动的模版ID',
    title VARCHAR(64) NOT NULL COMMENT '标题',
    brief VARCHAR(4096) COMMENT '简述',
    awards VARCHAR(4096) COMMENT '颁奖简述',
    status TINYINT NOT NULL DEFAULT '1' COMMENT '状态1待公告 2已公告 3正在进行 4结束 5结果已发布 6取消',
    tags VARCHAR(512) COMMENT '逗号分隔的TAG_ID',
    logo_url VARCHAR(256) COMMENT 'LOGO图片URL',
    tm_created DATETIME COMMENT '创建时间',
    tm_announce DATETIME COMMENT '公告时间',
    tm_start DATETIME COMMENT '开始时间',
    tm_end DATETIME COMMENT '结束时间',
    tm_publish DATETIME COMMENT '结果发布时间',
    INDEX IDX_ACT_1(s4_id,template_id)
);

-- 活动参与人
CREATE TABLE IF NOT EXISTS t_activity_member(
    act_id INT UNSIGNED NOT NULL COMMENT '活动ID',
    cust_id INT UNSIGNED NOT NULL COMMENT '活动参加者的ID',
    status TINYINT NOT NULL DEFAULT '0' COMMENT '0邀请 1报名 2参加 3客户主动退出 4条件不符被拒',
    ref_car_id INT UNSIGNED COMMENT '参考车的ID,因为TAG打在车上',
    ref_tags VARCHAR(256) COMMENT '逗号分割的参考TAG_ID',
    ref_tag_tm DATETIME COMMENT '参考TAG标记时间',
    UNIQUE UNQ_ACT_MEMBER(act_id,cust_id),
    INDEX IDX_ACT_MEMBER_1(act_id,status)
);