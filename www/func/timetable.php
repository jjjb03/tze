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

$tze = new tze();

$Datenbank = $tze->mysql();

# iUserID auf Session-Wert einstellen
$iUserID = $_SESSION['userId'];
$strTime = date('Y-m-d H:i:s');
$strDate = date('Y-m-d');
$iLastProj = null;
$iLastCat = null;

# letzen, nicht beendeten Tag abrufen
$QueryLastDay = 'SELECT id, iProjekt, iCat, MAX(Time_Start), Date FROM `ze_full` WHERE iUserID = ' .
        $_SESSION['userId'] . ' and Time_End = "0000-00-00 00:00:00"';

$result = $Datenbank->query($QueryLastDay);
if ($result) {
    $row = $result->fetch_assoc();
    if ($row['id'] > 0) {
        $strDate = $row['Date'];
        $strID = $row['id'];
        $iLastProj = $row['iProjekt'];
        $iLastCat = $row['iCat'];
    }
}

# Zeitstempel setzen
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (filter_input(INPUT_POST, 'action') == "TimeStamp") {

        $projectId = filter_input(INPUT_POST, 'ProjektID', FILTER_VALIDATE_INT);
        $timeClassId = filter_input(INPUT_POST, 'TimeClassID', FILTER_VALIDATE_INT);

        if (is_int($projectId) and is_int($timeClassId)) {
            if ($timeClassId != $iLastCat or $projectId != $iLastProj) {

                $old = [];
                $new = [];

                if (isset($strID)) {

                    $StampEnd = 'UPDATE `o2bo`.`zeiterfassung` '
                            . 'SET `Time_End` = ? '
                            . 'WHERE `id` = ?';

                    $stmt = $tze->query($StampEnd, 'si', $strTime, $strID);

                    if ($stmt) {
                        $old = $tze->get_Results('Select * from `o2bo`.`ze_full` WHERE `id` = ?', 'i', $strID);
                    } else {
                        exit_error("Fehler beim setzen von ID ' . $strID . '!");
                    }
                }

                if ($timeClassId > 0) {

                    $StampStart = 'INSERT INTO `zeiterfassung` '
                            . '(`iUserID`, `Date`, `Time_Start`, `iProjekt`, `iCat`) '
                            . 'VALUES (?,?,?,?,?)';
                    $stmt = $tze->query($StampStart, 'issii', $iUserID, $strDate, $strTime, $projectId, $_POST['TimeClassID']);
                    if ($stmt) {
                        $new = $tze->get_Results('Select * from `ze_full` WHERE `id` = ?', 'i', $stmt->insert_id);
                    } else {
                        exit_error("Fehler beim setzen des neuen Eintrags!");
                    }
                }

                $rows = array_merge($old, $new);
                exit(json_encode(array('Result' => 'OK', 'Data' => $rows)));
            } else {
                exit_error("Ist bereits eingeloggt.", $Datenbank);
            }
        }
    }

    if (filter_input(INPUT_POST, 'action') == "getList") {
        # Tabelle abrufen
        $string_query_timetable = 'select * from `ze_full`' .
                ' where `iUserID` = ? and Date = ?' .
                ' ORDER BY `ze_full`.`Time_Start` ASC';

        $rows = $tze->get_Results($string_query_timetable, 'is', $iUserID, $strDate);

        exit(json_encode(array('Result' => 'OK', 'Records' => $rows, "lastProj" => $iLastProj, "lastCat" => $iLastCat)));
    }

    exit(
            '{"Result": "FAIL", ' .
            '"Message": "Fehlerhafter Aufruf...!"}'
    );
}
