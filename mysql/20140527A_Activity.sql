-- 活动通用信息
CREATE TABLE IF NOT EXISTS t_activity(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '唯一标识',
    s4_id INT UNSIGNED NOT NULL COMMENT '所属4S店',
    title VARCHAR(64) NOT NULL COMMENT '标题',
    brief VARCHAR(4096) COMMENT '简述',
    awards VARCHAR(4096) COMMENT '颁奖简述',
    status TINYINT COMMENT '状态1待公告 2已公告 3正在进行 4结束 5结果已发布 6取消',
    tm_announce DATETIME COMMENT '公告时间',
    tm_start DATETIME COMMENT '开始时间',
    tm_end DATETIME COMMENT '结束时间',
    tm_publish DATETIME COMMENT '结果发布时间'
);