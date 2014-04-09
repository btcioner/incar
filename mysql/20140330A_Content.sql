-- 20140330 Jesse Qu -- Tables of website static contents

CREATE TABLE IF NOT EXISTS t_manual_content(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '手册条目ID',
    keyword VARCHAR(512) NOT NULL COMMENT '条目的关键字',
    filename VARCHAR(512) NOT NULL COMMENT '内容文件的文件名',
    title VARCHAR(256) NOT NULL COMMENT '内容的标题',
    description VARCHAR(256) NOT NULL COMMENT '内容的描述'
);