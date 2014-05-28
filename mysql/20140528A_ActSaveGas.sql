-- 线上节油大赛活动
CREATE TABLE IF NOT EXISTS t_activity_save_gas(
    id INT UNSIGNED PRIMARY KEY COMMENT '唯一标识',
    min_milage INT UNSIGNED NOT NULL COMMENT '最小行驶里程'
);