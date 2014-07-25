# SQL-Front 5.1  (Build 4.16)

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+08:00' */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE */;
/*!40101 SET SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES */;
/*!40103 SET SQL_NOTES='ON' */;


# Host: 114.215.172.92    Database: incardev
# ------------------------------------------------------
# Server version 5.6.15-log

#
# Source for table t_graphic_count
#

CREATE TABLE IF NOT EXISTS `t_graphic_count` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL DEFAULT '0' COMMENT '页面ID',
  `count_type` int(1) NOT NULL DEFAULT '0' COMMENT '1-菜单，2-原文，3-分享',
  `created_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '操作时间',
  `wx_oid` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '微信渠道标识，一对open_id',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=653 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
