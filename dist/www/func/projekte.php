<?php

/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

require_once __DIR__ . '/../../includes/auth.inc';
require_once __DIR__ . '/../../includes/functions.inc';
require_once __DIR__ . '/../../includes/functions.inc';

$tze = new tze();
$oDatenbank = $tze->mysql();


if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $action = filter_input(INPUT_POST, 'action');
    $mode = filter_input(INPUT_POST, 'mode');
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

    if ($mode == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {
// ziehe Projekte Liste
            if ($action == 'projekt-list') {
                $strQuery = "SELECT id, Projekt FROM `projekte` WHERE id > 0 AND deleted != 1";
                $request = $oDatenbank->query($strQuery);
                $rows = array();
                while ($row = $request->fetch_assoc()) {
                    $rows[] = $row;
                }
                exit(json_encode(array("Result" => "OK", "Records" => $rows)));
            }

// ziehe Mitarbeiter-Liste für ein Projekt
            if ($action == 'projekt-get-users-attached' && $id > 0) {
                $strQuery = "SELECT `iUser`, `sVorname`, `sNachname`, `sLogin` FROM `pz_full` WHERE iProjekt = ?";
                $rows = $tze->get_Results($strQuery, "i", $id);
                exit(json_encode(array("Result" => "OK", "Records" => $rows)));
            }

// Setze Name für ein Projekt
            if ($action == 'projekt-set-name' && $id > 0) {
                $neuerName = filter_input(INPUT_POST, 'Projekt', FILTER_SANITIZE_STRIPPED);

                if (!is_null($neuerName)) {
                    $strQuery = 'UPDATE projekte set Projekt = "' . $neuerName . '" WHERE id = ' . $id;
                    if ($tze->query($strQuery)) {
                        $message = ["Result" => "OK", "Record" => ["id" => $id, "Projekt" => $neuerName]];
                        exit(json_encode($message));
                    } else {
                        exit_error("Name konnte nicht übernommen werden.");
                    }
                } else {
                    exit_error("Name darf nicht leer sein!");
                }
            }

// Füge neues Projekt ein
            if ($action == 'projekt-create') {
                $neuerName = filter_input(INPUT_POST, 'Projekt', FILTER_SANITIZE_STRIPPED);
                if ($neuerName !== false and ! is_null($neuerName)) {
                    $strQuery = 'INSERT INTO `projekte` (`Projekt`) VALUE (?)';

                    $request = $tze->query($strQuery, "s", $neuerName);

                    if ($request) {
                        $strQuery = 'SELECT * FROM `projekte` WHERE `id` = ?';
                        $rows = $tze->get_Results($strQuery, "i", $request->insert_id);
                        exit(json_encode(array("Result" => "OK", "Record" => $rows[0])));
                    } else {
                        exit_error("Fehler beim Anlegen des Projekts!");
                    }
                }
            }

// Lösche bestehendes Projekt
            if ($action == 'projekt-delete') {
                if ($id > 0) {
                    $strQuery = 'UPDATE `projekte` set `deleted` = 1 WHERE id = ?';
                    $request = $tze->query($strQuery, "i", $id);
                    if ($request) {
                        exit('{"Result":"OK"}');
                    } else {
                        exit_error("Projekt konnte nicht gelöscht werden!", $oDatenbank);
                    }
                }
            }

// nicht zugeordnete Mitarbeiter auflisten
            if ($action == 'projekt-get-users-detached') {
                if ($id > 0) {
                    $strQuery = 'SELECT `userId` as Value, CONCAT(`sVorname`, " ", `sNachname`, " (",`sLogin`, ")") as DisplayText FROM `ma` where `userId` not in (SELECT iUser from `pz_full` where `iProjekt` = ' . $id . ') and `deleted` <> "1"';
                    $request = $oDatenbank->query($strQuery);
                    if ($request) {
                        $rows = array();
                        while ($row = $request->fetch_assoc()) {
                            $rows[] = $row;
                        }
                        exit(json_encode(array("Result" => "OK", "Options" => $rows)));
                    } else {
                        exit_error("Liste konnte nicht erstellt werden!", $oDatenbank);
                    }
                }
            }

// Entferne MA von einem Projekt
            if ($action == 'projekt-del-user') {
                $iUser = filter_input(INPUT_POST, 'iUser', FILTER_VALIDATE_INT);
                if ($id > 0 && $iUser > 0) {

                    $strQuery = 'DELETE FROM `projekte_zuordnung` WHERE `iUser` = ' . $iUser . ' AND `iProjekt` = ' . $id . ' LIMIT 1';
                    if ($oDatenbank->query($strQuery)) {
                        exit('{"Result":"OK"}');
                    } else {
                        exit_error("Mitarbeiter konnte nicht entfernt werden.", $oDatenbank);
                    }
                }
            }

// Füge MA zu einem Projekt hinzu
            if ($action == 'projekt-add-user') {
                $iUser = filter_input(INPUT_POST, 'iUser', FILTER_VALIDATE_INT);
                if (!empty($id) && !empty($iUser)) {
                    //$strQuery = 'INSERT INTO `projekte_zuordnung` (`iUser`, `iProjekt`) VALUES (' . $iUser . ', ' . $id . ')';
                    $strQuery = 'INSERT INTO `projekte_zuordnung` (`iUser`, `iProjekt`) VALUES (?, ?)';
                    if ($tze->query($strQuery, 'ii', $iUser, $id)) {
                        //if ($oDatenbank->query($strQuery)) {
                        $rows = $tze->get_Results("SELECT `iUser`, `sVorname`, `sNachname`, `sLogin` FROM `pz_full` WHERE `iUser` = ? AND iProjekt = ?", "ii", $iUser, $id);
                        exit(json_encode(array("Result" => "OK", "Record" => $rows[0])));
                    } else {
                        exit_error("Mitarbeiter konnte nicht hinzugefügt werden.", $oDatenbank);
                    }
                }
            }

            if ($action == "projekt-ticket-list") {
                $projektId = filter_input(INPUT_POST, 'projektId', FILTER_VALIDATE_INT);

                if (!empty($projektId)) {
                    $result = $oDatenbank->query("SELECT * FROM `projekte_tickets` where projektId = " . $projektId);
                    $rows = array();
                    while ($row = $result->fetch_assoc()) {
                        $rows[] = $row;
                    }

                    //Return result to jTable
                    $jTableResult = array('Result' => "OK", 'Records' => $rows);
                    print json_encode($jTableResult);
                    exit;
                }
            }

            if (preg_match("/^projekt-ticket-/i", $action)) {

                $projektId = filter_input(INPUT_POST, 'projektId', FILTER_VALIDATE_INT);
                $ticketId = filter_input(INPUT_POST, 'ticketId', FILTER_VALIDATE_INT);
                $ticketName = filter_input(INPUT_POST, 'ticketName', FILTER_SANITIZE_STRING);
                $ticketNumberSwitch = filter_input(INPUT_POST, 'ticketNumberSwitch', FILTER_VALIDATE_INT);
                $durationSwitch = filter_input(INPUT_POST, 'durationSwitch', FILTER_VALIDATE_INT);
                $counterSwitch = filter_input(INPUT_POST, 'counterSwitch', FILTER_VALIDATE_INT);
                $counterName = filter_input(INPUT_POST, 'counterName', FILTER_SANITIZE_STRING);
                $shortcut = filter_input(INPUT_POST, 'shortcut', FILTER_SANITIZE_STRING);
                $charge_ticket = filter_input(INPUT_POST, 'charge_ticket', FILTER_VALIDATE_FLOAT);
                $charge_duration = filter_input(INPUT_POST, 'charge_duration', FILTER_VALIDATE_FLOAT);
                $charge_counter = filter_input(INPUT_POST, 'charge_counter', FILTER_VALIDATE_FLOAT);
                $undoneSwitch = filter_input(INPUT_POST, 'undoneSwitch', FILTER_VALIDATE_BOOLEAN);

                if ($action == "projekt-ticket-create") {
                    if (!empty($projektId) and ! empty($ticketName) and ! empty($ticketNumberSwitch) and ! empty($durationSwitch) and ! empty($counterSwitch)) {
                        if ($counterSwitch == 1) {
                            $counterName = null;
                        }

                        $query = "insert into `projekte_tickets` 
                                (`projektId`, `ticketName`, `ticketNumberSwitch`, 
                                `durationSwitch`, `counterSwitch`, `counterName`, 
                                `shortcut`, charge_ticket, charge_counter, 
                                charge_duration, `undoneSwitch`) 
                                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                        $valarray = [
                            $projektId, $ticketName, $ticketNumberSwitch,
                            $durationSwitch, $counterSwitch, $counterName,
                            $shortcut, $charge_ticket, $charge_counter,
                            $charge_duration, $undoneSwitch
                        ];

                        $stmt = $tze->query($query, 'isiiissdddi', $valarray);
                        if ($stmt) {
                            $rows = $tze->get_Results('select * from `projekte_tickets` where ticketId = ?', "i", $stmt->insert_id);
                            //Return result to jTable
                            $jTableResult = array('Result' => "OK", 'Record' => $rows[0]);
                            print json_encode($jTableResult);
                            exit;
                        }
                    }
                }

                if ($action == "projekt-ticket-update") {

                    if (!empty($ticketId) and ! empty($projektId) and ! empty($ticketName) and ! empty($ticketNumberSwitch) and ! empty($durationSwitch) and ! empty($counterSwitch)) {
                        if ($counterSwitch == 1) {
                            $counterName = null;
                        }

                        $query = "update `projekte_tickets` set "
                                . "`projektId` = ?, `ticketName` = ?, `ticketNumberSwitch` = ?, "
                                . "`durationSwitch` = ?, `counterSwitch` = ?, `counterName` = ?, "
                                . "`shortcut` = ?, `charge_ticket` = ? , `charge_counter` = ?, "
                                . "`charge_duration` = ?, `undoneSwitch` = ? where `ticketId` = ?";

                        $valarray = [$projektId, $ticketName, $ticketNumberSwitch, $durationSwitch, $counterSwitch, $counterName, $shortcut, $charge_ticket, $charge_counter, $charge_duration, $undoneSwitch, $ticketId];

                        $stmt = $tze->query($query, 'isiiissdddii', $valarray);

                        if ($stmt) {
                            $rows = $tze->get_Results('select * from `projekte_tickets` where ticketId = ?', "i",$ticketId);
                            
                            //Return result to jTable
                            $jTableResult = array('Result' => "OK", 'Record' => $rows[0]);
                            print json_encode($jTableResult);
                            exit;
                        }
                    }
                }

                if ($action == "projekt-ticket-delete") {
                    $ticketId = filter_input(INPUT_POST, 'ticketId', FILTER_VALIDATE_INT);

                    if (!empty($ticketId)) {
                        $query = "DELETE FROM `projekte_tickets` WHERE `ticketId` = ? LIMIT 1";
                        $stmt = $tze->query($query, "i", $ticketId);
                        if ($stmt) {
                            $message = json_encode([
                                "Result" => "OK",
                            ]);
                            exit($message);
                        } else {
                            exit_error();
                        }
                    }
                }
            }
        }
    }

// Fehlermeldung, falls Ausführung bis hier
    exit_error("unbekannter Aufruf");
}
