SET NAMES utf8;

-- Exportiere Datenbank Struktur für o2bo
CREATE DATABASE IF NOT EXISTS `o2bo` DEFAULT CHARACTER SET utf8;
USE `o2bo`;


-- Exportiere Struktur von Tabelle o2bo.ip_ranges
CREATE TABLE IF NOT EXISTS `ip_ranges` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `ip_range` tinytext NOT NULL,
  `name` tinytext,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Exportiere Struktur von Tabelle o2bo.ma
CREATE TABLE IF NOT EXISTS `ma` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `sLogin` varchar(16) CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
  `sMail` text NOT NULL,
  `sPassword_hash` varchar(128) CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
  `sVorname` text CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
  `sNachname` text CHARACTER SET latin1 COLLATE latin1_german1_ci NOT NULL,
  `iArbeitszeit` int(11) NOT NULL,
  `bZeitarbeiter` tinyint(1) NOT NULL,
  `bLogin_Allowed` tinyint(1) NOT NULL,
  `iAdmin` tinyint(1) NOT NULL,
  `bForce_Update_PW` tinyint(1) NOT NULL,
  `deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sLogin` (`sLogin`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


-- Exportiere Struktur von Tabelle o2bo.projekte
CREATE TABLE IF NOT EXISTS `projekte` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `Projekt` text NOT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


-- Exportiere Struktur von Tabelle o2bo.projekte_zuordnung
CREATE TABLE IF NOT EXISTS `projekte_zuordnung` (
  `iUser` smallint(5) unsigned NOT NULL,
  `iProjekt` tinyint(3) unsigned NOT NULL,
  `iRolle` tinyint(4) NOT NULL,
  PRIMARY KEY (`iUser`,`iProjekt`),
  KEY `iUser` (`iUser`,`iProjekt`,`iRolle`),
  KEY `iProjekt` (`iProjekt`),
  KEY `iRolle` (`iRolle`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


-- Exportiere Struktur von View o2bo.pz_full
-- Erstelle temporäre Tabelle um View Abhängigkeiten zuvorzukommen
CREATE TABLE `pz_full` (
	`iUser` SMALLINT(5) UNSIGNED NOT NULL,
	`sLogin` VARCHAR(16) NOT NULL COLLATE 'latin1_german1_ci',
	`sVorname` TEXT NOT NULL COLLATE 'latin1_german1_ci',
	`sNachname` TEXT NOT NULL COLLATE 'latin1_german1_ci',
	`iProjekt` TINYINT(3) UNSIGNED NOT NULL,
	`Projekt` TEXT NOT NULL COLLATE 'utf8_general_ci',
	`iRolle` TINYINT(4) NOT NULL
) ENGINE=MyISAM;


-- Exportiere Struktur von Tabelle o2bo.tickets
CREATE TABLE IF NOT EXISTS `tickets` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `UserID` smallint(5) unsigned NOT NULL,
  `iProjekt` tinyint(3) unsigned NOT NULL,
  `Date` date NOT NULL,
  `Timestamp` datetime NOT NULL,
  `TicketID` int(10) unsigned NOT NULL,
  `TypeID` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`index`),
  KEY `UserID` (`UserID`),
  KEY `ProjectID` (`iProjekt`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Exportiere Struktur von Tabelle o2bo.zeiterfassung
CREATE TABLE IF NOT EXISTS `zeiterfassung` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `iUserID` smallint(5) unsigned NOT NULL,
  `Date` date NOT NULL,
  `Time_Start` datetime NOT NULL,
  `Time_End` datetime NOT NULL,
  `iProjekt` tinyint(3) unsigned NOT NULL,
  `iCat` tinyint(3) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `iUserID` (`iUserID`),
  KEY `iProject` (`iProjekt`),
  KEY `iCat` (`iCat`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Exportiere Struktur von Tabelle o2bo.dispoCodes
CREATE TABLE IF NOT EXISTS `dispoCodes` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `class` text NOT NULL,
  `ListLabel` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


-- Exportiere Struktur von View o2bo.ze_full
-- Erstelle temporäre Tabelle um View Abhängigkeiten zuvorzukommen
CREATE TABLE `ze_full` (
	`id` INT(11) UNSIGNED NOT NULL,
	`iUserID` SMALLINT(5) UNSIGNED NOT NULL,
	`Date` DATE NOT NULL,
	`Time_Start` DATETIME NOT NULL,
	`Time_End` DATETIME NOT NULL,
	`iProjekt` TINYINT(3) UNSIGNED NOT NULL,
	`iCat` TINYINT(3) UNSIGNED NOT NULL,
	`Projekt` TEXT NOT NULL COLLATE 'utf8_general_ci',
	`class` TEXT NOT NULL COLLATE 'utf8_general_ci',
	`ListLabel` TEXT NOT NULL COLLATE 'utf8_general_ci',
	`Duration` TIME NULL
) ENGINE=MyISAM;


-- Exportiere Struktur von View o2bo.pz_full
-- Entferne temporäre Tabelle und erstelle die eigentliche View
DROP TABLE IF EXISTS `pz_full`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pz_full` AS select `ma`.`id` AS `iUser`,`ma`.`sLogin` AS `sLogin`,`ma`.`sVorname` AS `sVorname`,`ma`.`sNachname` AS `sNachname`,`pr`.`id` AS `iProjekt`,`pr`.`Projekt` AS `Projekt`,`pz`.`iRolle` AS `iRolle` from ((`projekte_zuordnung` `pz` join `ma` on((`ma`.`id` = `pz`.`iUser`))) join `projekte` `pr` on((`pr`.`id` = `pz`.`iProjekt`))) where (`pr`.`deleted` <> 1);


-- Exportiere Struktur von View o2bo.ze_full
-- Entferne temporäre Tabelle und erstelle die eigentliche View
DROP TABLE IF EXISTS `ze_full`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ze_full` AS select `ze`.`id` AS `id`,`ze`.`iUserID` AS `iUserID`,`ze`.`Date` AS `Date`,`ze`.`Time_Start` AS `Time_Start`,`ze`.`Time_End` AS `Time_End`,`ze`.`iProjekt` AS `iProjekt`,`ze`.`iCat` AS `iCat`,`p`.`Projekt` AS `Projekt`,`cat`.`class` AS `class`,`cat`.`ListLabel` AS `ListLabel`,if((`ze`.`Time_End` > 0),timediff(`ze`.`Time_End`,`ze`.`Time_Start`),timediff(now(),`ze`.`Time_Start`)) AS `Duration` from ((`zeiterfassung` `ze` join `projekte` `p` on((`ze`.`iProjekt` = `p`.`id`))) join `dispoCodes` `cat` on((`ze`.`iCat` = `cat`.`id`)));


