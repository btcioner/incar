CREATE TABLE IF NOT EXISTS t_promotion_slot(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '工位营销ID',
    storeId INT UNSIGNED NOT NULL COMMENT '组织ID、4S店ID',
    slot_location VARCHAR(64) NOT NULL COMMENT '工位信息',
    slot_time DATETIME COMMENT '工位时间',
    benefit  VARCHAR(512) NOT NULL COMMENT '优惠',
    description  VARCHAR(512) COMMENT '此字段已被停用',
    promotion_time DATETIME COMMENT '营销开始时间',
    promotion_status TINYINT NOT NULL DEFAULT '0' COMMENT '有效性标志 0-无效 1-已创建 2-已发布 3-已申请 4-已结束',
    tc VARCHAR(512) COMMENT '记录操作用户名',
    ts timestamp COMMENT '记录操作时间戳',

	INDEX IX_PROMOTION_SLOT_1(id),

    CONSTRAINT FK_staff_org FOREIGN KEY (storeId) REFERENCES t_4s(id)
);

CREATE TABLE IF NOT EXISTS t_slot_booking(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '工位预约ID',
    storeId INT UNSIGNED NOT NULL COMMENT '组织ID、4S店ID',

    slot_location VARCHAR(64) COMMENT '工位物理空间信息',
    slot_time timestamp NOT NULL COMMENT '工位时间信息',

    promotion_id INT UNSIGNED COMMENT '是否是某次营销优惠活动中的，如是，这里填写活动中的PromotionSlotID，如不是则为NULL。',

    channel VARCHAR(32) NOT NULL COMMENT '申请渠道 weixin mobileApp website telephone',
    channel_specific VARCHAR(256) COMMENT '申请渠道指定信息',

    booking_time DATETIME NOT NULL COMMENT '预约申请时间',
    booking_status TINYINT NOT NULL DEFAULT '0' COMMENT '预约申请状态 0-无效 1-已申请待确认 2-被拒 3-成功批准 4-被取消',

    tc VARCHAR(256) COMMENT '记录操作用户名',
    ts timestamp COMMENT '记录操作时间戳',

	INDEX IX_PROMOTION_SLOT_1(id)
);
create table IF NOT EXISTS `t_trialrun`(
   `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自动增长id',
   `wx_oid` varchar(512) COMMENT 'openid:sopenid格式，未注册用户以此标识',
   `acc_id` int(11) COMMENT '已注册用户，账号id',
   `bookingtime` datetime COMMENT '预约时间',
   `seriesName` varchar(30) COMMENT '车型',
   `name` varchar(10) COMMENT '姓名，已注册用户可从t_account读出',
   `phone` varchar(20) COMMENT '电话，已注册用户可从t_account读出',
    channel VARCHAR(32) NOT NULL COMMENT '申请渠道 weixin mobileApp website telephone',
    channel_specific VARCHAR(256) COMMENT '申请渠道指定信息',
   `bookStatus` int(4) DEFAULT '0' COMMENT '预约状态：0-无效 1-已申请待确认 2-被拒 3-成功批准 4-被取消 ',

   tc VARCHAR(32) COMMENT '记录操作用户名',
   ts timestamp COMMENT '记录操作时间戳',
   PRIMARY KEY (`id`)
 );