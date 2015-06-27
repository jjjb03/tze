<?php

/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

require_once __DIR__ . '/../../includes/auth.inc';

$tze = new tze();
$oDatenbank = $tze->mysql();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    if (filter_input(INPUT_POST, 'mode') == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {

//  Tabelle Mitarbeiter
            if (filter_input(INPUT_POST, 'action') == 'get-users') {
                $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);
                $Date = $tze->sqlDate($Date);

                $strQuery = 'select 
    userId as iUserID, sVorname, sNachname, iArbeitszeit, 
    sec_to_time(iArbeitszeit * 60 * 60) as Arbeitszeit, 
    zeiten.AZ, zeiten.PZ, zeiten.iProjekt, zeiten.Projekt,
    zeiten.`Status`, zeiten.`working`, zeiten.`timestamp`
from ma_view mitarbeiter 
left join ( 
    select 
        (select 
            if(Time_End = 0, Projekt, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1) 
        as Projekt,  
        (select 
            if(Time_End = 0, iProjekt, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1)
	as iProjekt,
        (select 
            if(Time_End = 0, ButtonLabel, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1) 
        as `Status`, 
        (select 
            if(Time_End = 0, if (class="Pause", false, true), null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID and date=?
            order by Time_Start desc limit 1) 
        as `working`, 
        iUserID, max(`timestamp`) as `timestamp`,
        SEC_to_time(sum( if (class != "Pause", time_to_sec(Duration), 0))) as AZ, 
        SEC_to_time(sum( if (class = "Pause", time_to_sec(Duration), 0))) as PZ 
    from ze_full ze1 
    where date=?
    group by iUserID
) zeiten on ( mitarbeiter.userId = zeiten.iUserID) ';


                $filter = filter_input(INPUT_POST, 'filter', FILTER_SANITIZE_STRIPPED);
                $filterId = filter_input(INPUT_POST, 'filterId', FILTER_VALIDATE_INT);
//
//                switch ($filter) {
//                    case "Projekt":
//                        $strQueryFilter = ' join projekte_zuordnung projZu on (projZu.iUser = mitarbeiter.userId) '
//                                . 'where projZu.iProjekt = ' . $filterId . ' '
//                                . 'group by mitarbeiter.userid ';
//                        break;
//                    default:
//                        $strQueryFilter = "";
//                }

                $loggedOnly = filter_input(INPUT_POST, 'loggedOnly', FILTER_VALIDATE_BOOLEAN);
                switch ($filter) {
                    case "Projekt":
                        if ($loggedOnly) {
                            $strQueryFilter = " where iProjekt = $filterId ";
                        } else {
                            $strQueryFilter = ' join projekte_zuordnung projZu on (projZu.iUser = mitarbeiter.userId) '
                                    . "where projZu.iProjekt = $filterId "
                                    . 'group by mitarbeiter.userid ';
                        }
                        break;
                    default:
                        if ($loggedOnly) {
                            $strQueryFilter = " WHERE iProjekt > 0 ";
                        } else {
                            $strQueryFilter = "";
                        }
                }


                $sort = filter_input(INPUT_POST, 'jtSorting', FILTER_SANITIZE_STRIPPED);
                if (is_null($sort)) {
                    $sort = "sNachname ASC";
                }

                $strQuerySort = ' order by ' . $sort;

                $rows = $tze->get_Results($strQuery . $strQueryFilter . $strQuerySort, "sssss", $Date, $Date, $Date, $Date, $Date);

                if (count($rows) > 0) {
                    $last = max(array_column($rows, "timestamp"));
                }

                if (empty($last)) {
                    $last = "0000-00-00 00:00:00";
                }

                $message = json_encode([
                    "Result" => "OK",
                    "Records" => $rows,
                    "last" => $last
                ]);

                exit($message);
            }

            if (filter_input(INPUT_POST, 'action') == 'get-users-update') {
                $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);
                $Date = $tze->sqlDate($Date);

                $strQuery = 'select 
    userId as iUserID, sVorname, sNachname, iArbeitszeit, 
    sec_to_time(iArbeitszeit * 60 * 60) as Arbeitszeit, 
    zeiten.AZ, zeiten.PZ, zeiten.iProjekt, zeiten.Projekt,
    zeiten.`Status`, zeiten.`working`, zeiten.`timestamp`
from ma_view mitarbeiter 
left join ( 
    select 
        (select 
            if(Time_End = 0, Projekt, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1) 
        as Projekt, 
        (select 
            if(Time_End = 0, iProjekt, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1)
	as iProjekt,
        (select 
            if(Time_End = 0, ButtonLabel, null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID  and date=?
            order by Time_Start desc limit 1) 
        as `Status`, 
        (select 
            if(Time_End = 0, if (class="Pause", false, true), null) 
            from ze_full ze2 
            where ze1.iUserID = ze2.iUserID and date=?
            order by Time_Start desc limit 1) 
        as `working`, 
        iUserID, max(`timestamp`) as `timestamp`,
        SEC_to_time(sum( if (class != "Pause", time_to_sec(Duration), 0))) as AZ, 
        SEC_to_time(sum( if (class = "Pause", time_to_sec(Duration), 0))) as PZ 
    from ze_full ze1 
    where date=?
    group by iUserID
) zeiten on ( mitarbeiter.userId = zeiten.iUserID) ';


                $last = filter_input(INPUT_POST, 'last', FILTER_SANITIZE_STRIPPED);
                $lastQuery = " where `timestamp` > '$last'";

                if (empty($last)) {
                    exit_error("Unvollständig aufgerufen!");
                }

                $filter = filter_input(INPUT_POST, 'filter', FILTER_SANITIZE_STRIPPED);
                $filterId = filter_input(INPUT_POST, 'filterId', FILTER_VALIDATE_INT);

                $loggedOnly = filter_input(INPUT_POST, 'loggedOnly', FILTER_VALIDATE_BOOLEAN);

                switch ($filter) {
                    case "Projekt":
                        if ($loggedOnly) {
                            $lastQuery .= " and iProjekt = $filterId";
                        } else {
                            $strQueryFilter = ' join projekte_zuordnung projZu on (projZu.iUser = mitarbeiter.userId) '
                                    . $lastQuery . 'and projZu.iProjekt = ' . $filterId . ' '
                                    . 'group by mitarbeiter.userid ';
                            $lastQuery = $strQueryFilter;
                        }
                        break;
                }

                // main loop
                set_time_limit(40);
                $i = 1;
                session_write_close();
                while ($i < 15) {
                    $i++;

                    $rows = $tze->get_Results($strQuery . $lastQuery . $strQuerySort, "sssss", $Date, $Date, $Date, $Date, $Date);
                    session_write_close();

                    session_commit();

                    if (count($rows) > 0) {

                        // erst ab PHP 5.5...
                        $last = max(array_column($rows, "timestamp"));

                        $message = json_encode([
                            "Result" => "OK",
                            "Records" => $rows,
                            "last" => $last
                        ]);

                        exit($message);
                    }

                    session_write_close();
                    sleep(2);
                }

                $message = json_encode([
                    "Result" => "OK",
                    "Records" => [],
                    "last" => $last,
                    "query" => $strQuery . $lastQuery . $strQuerySort,
                    "date" => $Date
                ]);

                exit($message);
            }

//  Tabelle Mitarbeiter > Zeiterfassung
            if (filter_input(INPUT_POST, 'action') == "get-users-timetable") {
                $iUseriD = filter_input(INPUT_POST, 'iUserID', FILTER_VALIDATE_INT);
                if ($iUseriD > 0) {
                    $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);

                    $Date = $tze->sqldate($Date);

                    $string_query_timetable = 'SELECT * FROM `ze_full` ' .
                            'WHERE `iUserID` = ? AND `Date` = ? ORDER BY `Time_Start` ASC';

                    $rows = $tze->get_Results($string_query_timetable, "is", $iUseriD, $Date);

//                    $last = max(array_column($rows, "timestamp"));
//                    if (empty($last)) {
//                        $last = "0000-00-00 00:00:00";
//                    }

                    $message = json_encode([
                        "Result" => "OK",
                        "Records" => $rows
                    ]);

                    exit($message);
                }
            }

//  Erzeugen eines Eintrages
            if (filter_input(INPUT_POST, 'action') == "insert-users-timetable") {
                $insArray['iUserID'] = filter_input(INPUT_POST, 'iUserID', FILTER_VALIDATE_INT);
                $insArray['Time_Start'] = filter_input(INPUT_POST, 'Time_Start', FILTER_SANITIZE_STRIPPED);
                $insArray['Time_End'] = filter_input(INPUT_POST, 'Time_End', FILTER_SANITIZE_STRIPPED);
                $insArray['Date'] = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);
                $insArray['iProjekt'] = filter_input(INPUT_POST, 'iProjekt', FILTER_VALIDATE_INT);
                $insArray['iCat'] = filter_input(INPUT_POST, 'iCat', FILTER_VALIDATE_INT);

                foreach ($insArray as $key => $value) {
                    if (is_null($value)) {
                        exit_error("unvollständig!");
                    }
                }

                $query = 'INSERT INTO `zeiterfassung` '
                        . '(iUserID, Time_Start, Time_End, Date, iProjekt, iCat) Values '
                        . '(?, ?, ?, ?, ?, ?) ';
                $stmt = $tze->query($query, 'isssii', $insArray['iUserID'], $insArray['Time_Start'], $insArray['Time_End'], $insArray['Date'], $insArray['iProjekt'], $insArray['iCat']
                );

                if ($stmt) {
                    $query = 'SELECT * FROM `ze_full` WHERE `id` = ?';
                    $rows = $tze->get_Results($query, "i", $stmt->insert_id);
                    $message = json_encode([
                        "Result" => "OK",
                        "Record" => $rows[0]
                    ]);
                    exit($message);
                } else {
                    exit_error();
                }
            }

//  Update eines Eintrages
            if (filter_input(INPUT_POST, 'action') == "update-users-timetable") {

                $updArray['id'] = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
                $updArray['Time_Start'] = filter_input(INPUT_POST, 'Time_Start', FILTER_SANITIZE_STRIPPED);
                $updArray['Time_End'] = filter_input(INPUT_POST, 'Time_End', FILTER_SANITIZE_STRIPPED);
                $updArray['iProjekt'] = filter_input(INPUT_POST, 'iProjekt', FILTER_VALIDATE_INT);
                $updArray['iCat'] = filter_input(INPUT_POST, 'iCat', FILTER_VALIDATE_INT);

                foreach ($updArray as $key => $value) {
                    if (is_null($value)) {
                        exit_error("unvollständig!");
                    }
                }

                $query = 'UPDATE `zeiterfassung` set '
                        . 'Time_Start = ?, '
                        . 'Time_End = ?, '
                        . 'iProjekt = ?, '
                        . 'iCat = ? '
                        . 'WHERE `id` = ?';

                $stmt = $tze->query($query, 'ssiii', $updArray['Time_Start'], $updArray['Time_End'], $updArray['iProjekt'], $updArray['iCat'], $updArray['id']);

                if ($stmt) {
                    $query = 'SELECT * FROM `ze_full` WHERE `id` = ?';
                    $rows = $tze->get_Results($query, "i", $updArray['id']);
                    $message = json_encode([
                        "Result" => "OK",
                        "Record" => $rows[0]
                    ]);
                    exit($message);
                } else {
                    exit_error();
                }
            }

//  Eintrag löschen
            if (filter_input(INPUT_POST, 'action') == "delete-users-timetable") {

                $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

                if (is_null($id)) {
                    exit_error();
                }

                $query = 'DELETE FROM `zeiterfassung` WHERE `id` = ? LIMIT 1';
                $stmt = $tze->query($query, "i", $id);
                if ($stmt) {
                    $message = json_encode([
                        "Result" => "OK",
                    ]);
                    exit($message);
                } else {
                    exit_error();
                }
            }

//  Verfügbare Projekte
            if (filter_input(INPUT_POST, 'action') == "get-users-projekts") {

                $iUseriD = filter_input(INPUT_POST, 'iUserId', FILTER_VALIDATE_INT);

                if (empty($iUseriD)) {
                    exit_error("unvollständig!");
                }

                $query = 'SELECT `iProjekt` AS `Value`, `Projekt` AS `DisplayText` FROM `pz_full` WHERE `iUser` = ?'; // . $iUseriD;
                $rows = $tze->get_Results($query, 'i', $iUseriD);

                $message = json_encode([
                    "Result" => "OK",
                    "Options" => $rows
                ]);
                exit($message);
            }

//  Verfügbare Zeitklassen
            if (filter_input(INPUT_POST, 'action') == "get-users-classes") {
                $iUseriD = filter_input(INPUT_POST, 'iUserId', FILTER_VALIDATE_INT);

                if (empty($iUseriD)) {
                    exit_error("unvollständig!");
                }

//                $query = 'SELECT `id` AS `Value`, if (`ListLabel`="","Arbeiten",`ListLabel`) AS `DisplayText` FROM `dispoCodes`';
                $query = 'SELECT `id` AS `Value`, ButtonLabel AS `DisplayText` FROM `dispoCodes`';
                $rows = $tze->get_Results($query); //, 'i', $iUseriD);

                $message = json_encode([
                    "Result" => "OK",
                    "Options" => $rows
                ]);
                exit($message);
            }
        }
    }
    exit('{"Result":"ERROR"}');
}