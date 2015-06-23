<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

require_once __DIR__ . '/../../includes/auth.inc';
require_once __DIR__ . '/../../includes/functions.inc';

$Datenbank = tze::mysql();

# letzten, nicht beendeten Tag abrufen
$string_Query = 'SELECT id, MAX(Time_Start), Date FROM `ze_full` WHERE iUserID = ' .
        $_SESSION['userId'] . ' and Time_End = "0000-00-00 00:00:00"';

$result = $Datenbank->query($string_Query);
if ($result) {
    $row = $result->fetch_assoc();
    if ($row['id'] > 0) {
        $strDate = "'" . $row['Date'] . "'";
    } else {
        $strDate = 'CURRENT_DATE()';
    }
} else {
    exit("Fehler mit der Datenbank");
}

$string_Query = 'SELECT 
			sec_to_time(sum(time_to_sec(Duration))) as Duration,
			if (`iCat` = 3, False, True) as AZ,
			if (min(`Time_End`) > 0, false, true) as Timer
		FROM
			`ze_full`
		WHERE
			`iUserID` = ' . $_SESSION['userId'] . ' AND `Date` = ' . $strDate . '
		group by `AZ`';

$AZ_Total = "00:00:00";
$PZ_Total = "00:00:00";

$AZ_Timer = "";
$PZ_Timer = "";

$result = $Datenbank->query($string_Query);
if ($result) {
    # Min. 1 Treffer
    if ($result->num_rows > 0) {

        while ($row = $result->fetch_assoc()) {
            if ($row['AZ'] == True) {
                $AZ_Total = $row['Duration'];
                $AZ_Timer = $row['Timer'];
            } else {
                $PZ_Total = $row['Duration'];
                $PZ_Timer = $row['Timer'];
            }
        }
    }
}
print
        '{
"AZ_Total": { "time": "' . $AZ_Total . '", "clockme": "' . $AZ_Timer . '"},
"PZ_Total": { "time": "' . $PZ_Total . '", "clockme": "' . $PZ_Timer . '"}
}';
