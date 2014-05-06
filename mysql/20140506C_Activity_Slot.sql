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
