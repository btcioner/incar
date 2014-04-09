-- 20140312 XGH 创建数据库版本更新记录表
CREATE TABLE IF NOT EXISTS t_sys_version(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '序号',
    sql_file VARCHAR(64) NOT NULL COMMENT '被执行的SQL脚本文件名',
    exec_time TIMESTAMP COMMENT '脚本执行时间'
    );

