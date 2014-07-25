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
# Source for table t_page_dictionary
#

CREATE TABLE IF NOT EXISTS `t_page_dictionary` (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT '页面ID',
  `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '页面名称',
  `parent_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

#
# Dumping data for table t_page_dictionary
#

INSERT INTO `t_page_dictionary` VALUES (1,'行车记录',0);
INSERT INTO `t_page_dictionary` VALUES (2,'行车分析',0);
INSERT INTO `t_page_dictionary` VALUES (3,'行车手册',0);
INSERT INTO `t_page_dictionary` VALUES (4,'车况检测',0);
INSERT INTO `t_page_dictionary` VALUES (5,'用车报告',0);
INSERT INTO `t_page_dictionary` VALUES (6,'预约保养',0);
INSERT INTO `t_page_dictionary` VALUES (7,'试乘试驾',0);
INSERT INTO `t_page_dictionary` VALUES (8,'资讯活动',0);
INSERT INTO `t_page_dictionary` VALUES (9,'联系我们',0);
INSERT INTO `t_page_dictionary` VALUES (10,'我的活动',0);
INSERT INTO `t_page_dictionary` VALUES (11,'我的预约',0);
INSERT INTO `t_page_dictionary` VALUES (12,'我的信息',0);
INSERT INTO `t_page_dictionary` VALUES (13,'活动详情',8);
INSERT INTO `t_page_dictionary` VALUES (14,'赛果展示',8);

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
