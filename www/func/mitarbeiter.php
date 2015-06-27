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
require_once __DIR__ . '/../../includes/passwordLib.inc';


$tze = new tze();

function Neues_Passwort() {
//  Generate Custom PW
    $chars = "abcdefghijkmnpqrtuvwxyz";
    $chars .= strtoupper($chars) . "023456789";
    $len = strlen($chars);
    $temppw = '';
    for ($i = 0; $i < 8; $i++) {
        $temppw .= substr($chars, rand(0, $len - 1), 1);
    }

//  the finished password
    return str_shuffle($temppw);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (filter_input(INPUT_POST, 'mode') == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {

//          öfter benötigte Variablen...

            $jtStartIndex = filter_input(INPUT_POST, 'jtStartIndex', FILTER_SANITIZE_NUMBER_INT);
            $jtPageSize = filter_input(INPUT_POST, 'jtPageSize', FILTER_SANITIZE_NUMBER_INT);
            $jtSorting = filter_input(INPUT_POST, 'jtSorting', FILTER_SANITIZE_STRIPPED);

            if (!empty($jtPageSize)) {
                $jtStartIndex = !empty($jtPageSize) ? $jtStartIndex : 0;
                $limit = " LIMIT $jtStartIndex, $jtPageSize ";
            } else {
                $limit = "";
            }

            if (!empty($jtSorting)) {
                $orderBy = " Order By $jtSorting ";
            } else {
                $orderBy = "";
            }

            $action = filter_input(INPUT_POST, 'action');

//          Mitarbeiter Auflisten
            if ($action == "list") {
                $nameFilter = filter_input(INPUT_POST, 'nameFilter', FILTER_SANITIZE_STRIPPED);

                if (empty($nameFilter)) {
                    $nameFilter = '';
                } else {
                    $nameFilter = "where `maId` like '%$nameFilter%' or `sVorname` like '%$nameFilter%' or `sNachname` like '%$nameFilter%' or `sLogin` like '%$nameFilter%' ";
                }

                //Get record count
                $recordCounts = $tze->get_Results("SELECT COUNT(sLogin) AS RecordCount FROM ma_view $nameFilter");
                $recordCount = $recordCounts[0]['RecordCount'];

                $queryString = "SELECT * FROM ma_view $nameFilter $orderBy $limit";

                $rows = $tze->get_Results($queryString);
//                $rows = array();
//                while ($row = $result->fetch_assoc()) {
//                    $rows[] = $row;
//                }
                //Return result to jTable
                $jTableResult = [
                    'Result' => "OK",
                    'Records' => $rows,
                    'TotalRecordCount' => $recordCount];
                print json_encode($jTableResult);
                exit;
            }

// Mitarbeitern updaten
            if ($action == "update") {
                # Werte einlesen
                $regexPattern = array("options" => array("regexp" => "/^[a-zA-Z0-9]+$/"));
                $inputArray['maId'] = filter_input(INPUT_POST, 'maId', FILTER_SANITIZE_STRIPPED);
                $inputArray['sLogin'] = filter_input(INPUT_POST, 'sLogin', FILTER_VALIDATE_REGEXP, $regexPattern);
                $inputArray['sVorname'] = filter_input(INPUT_POST, 'sVorname', FILTER_SANITIZE_STRIPPED);
                $inputArray['sNachname'] = filter_input(INPUT_POST, 'sNachname', FILTER_SANITIZE_STRIPPED);
                $inputArray['sMail'] = filter_input(INPUT_POST, 'sMail', FILTER_SANITIZE_EMAIL);
                $inputArray['iArbeitszeit'] = filter_input(INPUT_POST, 'iArbeitszeit', FILTER_VALIDATE_INT);
                $inputArray['bZeitarbeiter'] = filter_input(INPUT_POST, 'bZeitarbeiter', FILTER_VALIDATE_INT);
                $inputArray['bLogin_Allowed'] = filter_input(INPUT_POST, 'bLogin_Allowed', FILTER_VALIDATE_INT);
                $inputArray['iAdmin'] = filter_input(INPUT_POST, 'iAdmin', FILTER_VALIDATE_INT);
                
//                $sql = 'UPDATE ma set maId = ?, sLogin = ?, sVorname = ?, sMail = ?, iArbeitszeit = ?, bZeitarbeiter = ?, bLogin_Allowed = ?, iAdmin = ? where userId = ?';
//                $vals = 'ssssiiiii';

                foreach ($inputArray as $key => $value) {
//                    if (empty($value)) {
//                        $valtype = substr($key, 0, 1);
//                        if ($valtype == "i" || $valtype == "b") {
//                            if ($value != null) {
//                                $updateQuery .= "`$key` = 0, ";
//                            }
//                        } else {
//                            exit(json_encode(array('Result' => "ERROR", "Message" => 'Fehler in ' . $key, "ValType" => $valtype)));
//                        }
//                    } else {
                        $updateQuery .= '`' . $key . '` = "' . $value . '", ';
//                    }
                }
                $userId = filter_input(INPUT_POST, 'userId', FILTER_VALIDATE_INT);
                if (!empty($userId)) {
                    $newPassword = filter_input(INPUT_POST, 'sPassword_hash');
                    $forceNewPassword = filter_input(INPUT_POST, 'bForce_Update_PW', FILTER_VALIDATE_BOOLEAN);

                    if (!empty($newPassword)) {
                        $pw = Neues_Passwort();
                        $pw_string = password_hash($pw);
                        if (!$tze->query('UPDATE ma set sPassword_hash = ?,`bForce_Update_PW` = 1 WHERE userId = ?', 'si', $pw_string, $userId)) {
                            exit_error("Fehler bei PW-Update");
                        }
                    } elseif (!empty($forceNewPassword)) {
                        if (!$tze->query('UPDATE ma set `bForce_Update_PW` = 1 WHERE userId = ?', 'i', $userId)) {
                            exit_error("Fehler bei PW-Update");
                        }
                    }

//                    $result = $tze->query($sql, $vals, $inputArray);
                    $result = $tze->Result_nPrep('UPDATE ma set ' . substr($updateQuery, 0, -2) . ' WHERE userId = "' . $userId . '"');
                    if ($result) {
                        $rows = $tze->get_Results('SELECT * from ma_view WHERE `userId` = ?', "i", $userId);
                        $row = $rows[0];

                        $jTableResult = array('Result' => "OK", 'Record' => $row); //, "input" => $inputArray);

                        if (isset($pw)) {
                            $jTableResult["Password"] = $pw;
                        }

                        exit(json_encode($jTableResult));
                    }
                }
            }

// Mitarbeiter einfügen
            if ($action == "insert") {
                # Werte einlesen
                $regexPattern = array("options" => array("regexp" => "/^[a-zA-Z0-9]+$/"));
                $inputArray['sLogin'] = filter_input(INPUT_POST, 'sLogin', FILTER_VALIDATE_REGEXP, $regexPattern);
                $inputArray['sVorname'] = filter_input(INPUT_POST, 'sVorname', FILTER_SANITIZE_STRIPPED);
                $inputArray['sNachname'] = filter_input(INPUT_POST, 'sNachname', FILTER_SANITIZE_STRIPPED);
                $inputArray['sMail'] = filter_input(INPUT_POST, 'sMail', FILTER_SANITIZE_EMAIL);
                $inputArray['iArbeitszeit'] = filter_input(INPUT_POST, 'iArbeitszeit', FILTER_VALIDATE_INT);
                $inputArray['bZeitarbeiter'] = filter_input(INPUT_POST, 'bZeitarbeiter', FILTER_VALIDATE_BOOLEAN);
                $inputArray['bLogin_Allowed'] = filter_input(INPUT_POST, 'bLogin_Allowed', FILTER_VALIDATE_BOOLEAN);
                $inputArray['iAdmin'] = filter_input(INPUT_POST, 'iAdmin', FILTER_VALIDATE_BOOLEAN);

                foreach ($inputArray as $key => $value) {
//                    if (empty($value)) {
//                        $valtype = substr($key, 0, 1);
//                        if ($valtype == "i" || $valtype == "b") {
//                            $valarray[] = false;
//                            if ($value = null) {
//                                $insertQuery .= "`$key` = 0, ";
//                            }
//                        } else {
//                            exit(json_encode(array('Result' => "ERROR", "Message" => 'Fehler in ' . $key, "ValType" => $valtype)));
//                        }
//                    } else {
//                        $valarray[] = $value;
                        $insertQuery .= '`' . $key . '` = "' . $value . '", ';
//                    }
                }


                $insertQuery = 'INSERT INTO `ma` '
                        . '(sLogin, sVorname, '
                        . 'sNachname, sMail, '
                        . 'iArbeitszeit, bZeitarbeiter, '
                        . 'bLogin_Allowed, iAdmin, '
                        . 'sPassword_hash, bForce_Update_PW) '
                        . 'values '
                        . '(?, ?, ?, ?, ?, ?, ?, ?, "passwort", 1)';

                array_unshift($valarray, $insertQuery, "ssssiiii");

                $stmt = call_user_func_array([$tze, 'query'], $valarray);

                if ($stmt) {
                    #UserId
                    $userId = $stmt->insert_id;

                    # Zufälliges Passwort
                    $pw = Neues_Passwort();
                    $pw_string = password_hash($pw);
                    if (!$tze->query('UPDATE ma set sPassword_hash = ? WHERE userId = ?', 'si', $pw_string, $userId)) {
                        exit_error("Fehler bei PW-Update");
                    }

                    $query = 'SELECT * FROM ma_view WHERE `userId` = ?';
                    $rows = $tze->get_Results($query, "i", $userId);


                    //Return result to jTable
                    $jTableResult = array('Result' => "OK", 'Record' => $rows[0], "Password" => $pw);
                    print json_encode($jTableResult);
                    exit;
                }
            }

// Mitarbeiter löschen
            if ($action == "delete") {
                $userId = filter_input(INPUT_POST, 'userId', FILTER_VALIDATE_INT);
                if (!empty($userId)) {
                    if ($tze->query('UPDATE ma set `deleted` = "1", `deleted_date` = CURRENT_DATE WHERE userId = ?', 'i', $userId)) {
                        exit(json_encode(array('Result' => "OK")));
                    } else {
                        exit(json_encode(array('Result' => "ERROR", "Message" => $oDatenbank->error)));
                    }
                }
            }

// gelöschte Mitarbeiter auflisten
            if ($action == "list-deleted") {

                $queryString = "select userId, CONCAT(sVorname, ' ', sNachname) as `name` from ma where deleted <> 0 order by name";

                $rows = $tze->get_Results($queryString);

                exit(json_encode(array('Result' => "OK", 'Records' => $rows)));
            }

            // Mitarbeiter "entlöschen"
            if ($action == "undelete") {
                $userId = filter_input(INPUT_POST, 'userId', FILTER_VALIDATE_INT);
                if (!empty($userId)) {
                    if ($tze->query('UPDATE ma set `deleted` = 0, `deleted_date` = null WHERE userId = ?', 'i', $userId)) {
                        exit(json_encode(array('Result' => "OK")));
                    } else {
                        exit(json_encode(array('Result' => "ERROR", "Message" => $oDatenbank->error)));
                    }
                }
            }
        }
    }
}
exit(json_encode(array('Result' => "ERROR")));

