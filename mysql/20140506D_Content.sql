-- 20140330 Jesse Qu -- Tables of website static contents

CREATE TABLE IF NOT EXISTS t_manual_content(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '手册条目ID',
    keyword VARCHAR(512) NOT NULL COMMENT '条目的关键字',
    filename VARCHAR(512) NOT NULL COMMENT '内容文件的文件名',
    title VARCHAR(256) NOT NULL COMMENT '内容的标题',
    description VARCHAR(256) NOT NULL COMMENT '内容的描述'
);

-- 创建车辆信息表
CREATE TABLE IF NOT EXISTS t_car_info(
    id int auto_increment,
    brandCode int,
    seriesCode int,
    brand varchar(30),
    series varchar(30),
    manufacturer varchar(30),
    care_mileage int COMMENT '保养里程间隔',
    care_hour int COMMENT '发动机保养小时间隔',
    primary key (id));