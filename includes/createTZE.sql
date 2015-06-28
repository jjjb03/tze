CREATE DATABASE IF NOT EXISTS `tze`
USE `tze`;

CREATE TABLE IF NOT EXISTS `dispoCodes` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `code` tinyint(4) NOT NULL,
  `position` tinyint(4) DEFAULT NULL,
  `usual` tinyint(1) DEFAULT NULL,
  `class` tinytext NOT NULL,
  `ListLabel` tinytext NOT NULL,
  `ButtonLabel` tinytext NOT NULL,
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ip_ranges` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `ip_range` tinytext NOT NULL,
  `name` tinytext,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ma` (
  `userId` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `maId` varchar(10) DEFAULT NULL,
  `sLogin` varchar(16) NOT NULL,
  `sMail` text NOT NULL,
  `sPassword_hash` varchar(128) NOT NULL,
  `sVorname` text NOT NULL,
  `sNachname` text NOT NULL,
  `iArbeitszeit` int(11) NOT NULL,
  `bZeitarbeiter` tinyint(1) NOT NULL,
  `bLogin_Allowed` tinyint(1) NOT NULL,
  `iAdmin` tinyint(1) NOT NULL,
  `bForce_Update_PW` tinyint(1) NOT NULL,
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `deleted_date` date DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `sLogin` (`sLogin`),
  UNIQUE KEY `maId` (`maId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `ma_view` (
	`userId` SMALLINT(5) UNSIGNED NOT NULL,
	`maId` VARCHAR(10) NULL 
	`sLogin` VARCHAR(16) NOT NULL 
	`sMail` TEXT NOT NULL 
	`sVorname` TEXT NOT NULL, 
	`sNachname` TEXT NOT NULL, 
	`iArbeitszeit` INT(11) NOT NULL,
	`bZeitarbeiter` TINYINT(1) NOT NULL,
	`bLogin_Allowed` TINYINT(1) NOT NULL,
	`iAdmin` TINYINT(1) NOT NULL,
	`bForce_Update_PW` TINYINT(1) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `projekte` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `Projekt` text NOT NULL,
  `deleted` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `projekte_tickets` (
  `ticketId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `projektId` int(10) unsigned NOT NULL,
  `ticketName` tinytext NOT NULL,
  `ticketNumberSwitch` tinyint(3) unsigned NOT NULL,
  `durationSwitch` tinyint(3) unsigned NOT NULL,
  `counterSwitch` tinyint(3) unsigned NOT NULL,
  `counterName` tinytext,
  `shortcut` char(1),
  `undoneSwitch` tinyint(1) unsigned NOT NULL,
  `charge_ticket` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `charge_counter` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `charge_duration` decimal(5,4) NOT NULL DEFAULT '0.0000',
  PRIMARY KEY (`ticketId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `projekte_zuordnung` (
  `iUser` smallint(5) unsigned NOT NULL,
  `iProjekt` tinyint(3) unsigned NOT NULL,
  `iRolle` tinyint(4) NOT NULL,
  PRIMARY KEY (`iUser`,`iProjekt`),
  KEY `iUser` (`iUser`,`iProjekt`,`iRolle`),
  KEY `iProjekt` (`iProjekt`),
  KEY `iRolle` (`iRolle`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `pz_full` (
	`iUser` SMALLINT(5) UNSIGNED NOT NULL,
	`sLogin` VARCHAR(16) NOT NULL, 
	`sVorname` TEXT NOT NULL, 
	`sNachname` TEXT NOT NULL, 
	`iProjekt` TINYINT(3) UNSIGNED NOT NULL,
	`Projekt` TEXT NOT NULL, 
	`iRolle` TINYINT(4) NOT NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` smallint(5) unsigned NOT NULL,
  `date` date NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ticketId` smallint(5) unsigned NOT NULL,
  `ticketNumber` int(10) unsigned DEFAULT NULL,
  `duration` smallint(5) unsigned DEFAULT NULL,
  `counter` smallint(5) unsigned DEFAULT NULL,
  `undone` tinyint(1) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;

CREATE TABLE `tickets_view` (
	`ticketId` INT(10) UNSIGNED NULL,
	`userId` SMALLINT(5) UNSIGNED NOT NULL,
	`projektId` INT(10) UNSIGNED NULL,
	`done_tickets` DECIMAL(27,0) NULL,
	`sum_counter` DECIMAL(28,0) NULL,
	`sum_duration` DECIMAL(28,0) NULL,
	`date` DATE NOT NULL,
	`timestamp` TIMESTAMP NULL
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `zeiterfassung` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `iUserID` smallint(5) unsigned NOT NULL,
  `Date` date NOT NULL,
  `Time_Start` datetime NOT NULL,
  `Time_End` datetime NOT NULL,
  `iProjekt` tinyint(3) unsigned NOT NULL,
  `iCat` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `iUserID` (`iUserID`),
  KEY `iProject` (`iProjekt`),
  KEY `iCat` (`iCat`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `ze_full` (
	`id` INT(11) UNSIGNED NOT NULL,
	`iUserID` SMALLINT(5) UNSIGNED NOT NULL,
	`Date` DATE NOT NULL,
	`Time_Start` DATETIME NOT NULL,
	`Time_End` DATETIME NOT NULL,
	`iProjekt` TINYINT(3) UNSIGNED NOT NULL,
	`iCat` TINYINT(3) UNSIGNED NOT NULL,
	`Projekt` TEXT NOT NULL 
	`class` TINYTEXT NOT NULL 
	`ListLabel` TINYTEXT NOT NULL 
	`ButtonLabel` TINYTEXT NOT NULL 
	`Duration` TIME NULL,
	`timestamp` TIMESTAMP NOT NULL
) ENGINE=MyISAM;

DROP TABLE IF EXISTS `ma_view`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ma_view` AS select `ma`.`userId` AS `userId`,`ma`.`maId` AS `maId`,`ma`.`sLogin` AS `sLogin`,`ma`.`sMail` AS `sMail`,`ma`.`sVorname` AS `sVorname`,`ma`.`sNachname` AS `sNachname`,`ma`.`iArbeitszeit` AS `iArbeitszeit`,`ma`.`bZeitarbeiter` AS `bZeitarbeiter`,`ma`.`bLogin_Allowed` AS `bLogin_Allowed`,`ma`.`iAdmin` AS `iAdmin`,`ma`.`bForce_Update_PW` AS `bForce_Update_PW` from `ma` where ((`ma`.`deleted` = 0) or (`ma`.`deleted` > curdate()));

DROP TABLE IF EXISTS `pz_full`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pz_full` AS select `ma`.`userId` AS `iUser`,`ma`.`sLogin` AS `sLogin`,`ma`.`sVorname` AS `sVorname`,`ma`.`sNachname` AS `sNachname`,`pr`.`id` AS `iProjekt`,`pr`.`Projekt` AS `Projekt`,`pz`.`iRolle` AS `iRolle` from ((`projekte_zuordnung` `pz` join `ma` on((`ma`.`userId` = `pz`.`iUser`))) join `projekte` `pr` on((`pr`.`id` = `pz`.`iProjekt`))) where (`pr`.`deleted` <> 1);

DROP TABLE IF EXISTS `tickets_view`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tickets_view` AS select `pt`.`ticketId` AS `ticketId`,`ti`.`userId` AS `userId`,`pt`.`projektId` AS `projektId`,(count(`ti`.`id`) - coalesce(sum(`ti`.`undone`),0)) AS `done_tickets`,sum(`ti`.`counter`) AS `sum_counter`,sum(`ti`.`duration`) AS `sum_duration`,`ti`.`date` AS `date`,max(`ti`.`timestamp`) AS `timestamp` from (`tickets` `ti` left join `projekte_tickets` `pt` on((`pt`.`ticketId` = `ti`.`ticketId`))) group by `ti`.`date`,`ti`.`userId`,`ti`.`ticketId`;

DROP TABLE IF EXISTS `ze_full`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ze_full` AS select `ze`.`id` AS `id`,`ze`.`iUserID` AS `iUserID`,`ze`.`Date` AS `Date`,`ze`.`Time_Start` AS `Time_Start`,`ze`.`Time_End` AS `Time_End`,`ze`.`iProjekt` AS `iProjekt`,`ze`.`iCat` AS `iCat`,`p`.`Projekt` AS `Projekt`,`cat`.`class` AS `class`,`cat`.`ListLabel` AS `ListLabel`,`cat`.`ButtonLabel` AS `ButtonLabel`,if((`ze`.`Time_End` > 0),timediff(`ze`.`Time_End`,`ze`.`Time_Start`),timediff(now(),`ze`.`Time_Start`)) AS `Duration`,`ze`.`timestamp` AS `timestamp` from ((`zeiterfassung` `ze` join `projekte` `p` on((`ze`.`iProjekt` = `p`.`id`))) join `dispoCodes` `cat` on((`ze`.`iCat` = `cat`.`id`))) order by `ze`.`Time_Start`;