<?php

/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

// select `ze`.* ,p.Projekt, cat.class, cat.ListLabel,
		// if( (`ze`.`Time_End` > 0),
           // TIMEDIFF(`ze`.`Time_End`, `ze`.`Time_Start`),
           // TIMEDIFF(now(), `ze`.`Time_Start`)
          // ) AS `Duration`
// from `zeiterfassung` `ze`
// join `projekte` `p` on (`ze`.`iProjekt` = `p`.`id`)
// join `projekte_kategorien` `cat` on (`ze`.`iCat` = `cat`.`id`)
