<?php

/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

require_once __DIR__ . '/../../includes/auth.inc';
require_once __DIR__ . '/../../includes/functions.inc';

$tze = new tze();


if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    if (filter_input(INPUT_POST, 'mode') == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {
            if (filter_input(INPUT_POST, 'action') == "list") {
                $jtSorting = filter_input(INPUT_POST, 'jtSorting', FILTER_SANITIZE_STRIPPED);

                if (!empty($jtSorting)) {
                    $sort = "Order by $jtSorting";
                } else {
                    $sort = '';
                }

                $rows = $tze->get_Results("select * from dispoCodes where deleted = false $sort");
                $json_data = json_encode(["Result" => "OK", "Records" => $rows]);
                exit($json_data);
            }

            if (filter_input(INPUT_POST, 'action') == "update") {
                $args = [
                    'code' => FILTER_VALIDATE_INT,
                    'ListLabel' => FILTER_SANITIZE_STRIPPED,
                    'ButtonLabel' => FILTER_SANITIZE_STRIPPED,
                    'class' => FILTER_SANITIZE_STRIPPED,
                    'position' => FILTER_VALIDATE_INT,
                    'usual' => FILTER_VALIDATE_INT,
                    'id' => FILTER_VALIDATE_INT
                ];
                $types = "isssiii";
                $inputs = filter_input_array(INPUT_POST, $args);

                foreach ($inputs as $key => &$value) {
                    if (empty($value)) {                        
                        if ($key == 'usual') {
                            $value = "0";
                        } elseif ($key == 'ListLabel' || $key == 'ButtonLabel' || $key == 'class') {
                            $value = "";
                        } else {
                            exit_error('Angabe fehlt!');
                        }
                    }
                }

                $updateQuery = 'update dispoCodes '
                        . 'set `code` = ?, `ListLabel` = ?, `ButtonLabel` = ?, '
                        . '`class` = ?, `position` = ?, `usual` = ? '
                        . 'where `id` = ?';
                $update = $tze->query($updateQuery, $types, $inputs);

                if ($update) {
                    $rows = $tze->get_Results("select * from dispoCodes where id = ?", 'i', $inputs['id']);
                    $json_data = json_encode(["Result" => "OK", "Record" => $rows[0]]);
                    exit($json_data);
                }
            }

            if (filter_input(INPUT_POST, 'action') == "insert") {
                $args = [
                    'code' => FILTER_VALIDATE_INT,
                    'ListLabel' => FILTER_SANITIZE_STRIPPED,
                    'ButtonLabel' => FILTER_SANITIZE_STRIPPED,
                    'class' => FILTER_SANITIZE_STRIPPED,
                    'position' => FILTER_VALIDATE_INT,
                    'usual' => FILTER_VALIDATE_INT
                ];
                $types = "isssii";
                $inputs = filter_input_array(INPUT_POST, $args);

                foreach ($inputs as $key => &$value) {
                    if (empty($value)) {
                        if ($key == 'usual') {
                            $value = "0";
                        } elseif ($key == 'ListLabel' || $key == 'ButtonLabel' || $key == 'class') {
                            $value = "";
                        } else {
                            exit_error('Angabe fehlt!');
                        }
                    }
                }
                $insertQuery = 'insert into dispoCodes '
                        . 'set `code` = ?, `ListLabel` = ?, `ButtonLabel` = ?, '
                        . '`class` = ?, `position` = ?, `usual` = ? ';
                $insert = $tze->query($insertQuery, $types, $inputs);

                if ($insert) {
                    $rows = $tze->get_Results("select * from dispoCodes where id = ?", 'i', $insert->insert_id);
                    $json_data = json_encode(["Result" => "OK", "Record" => $rows[0]]);
                    exit($json_data);
                }
            }

            if (filter_input(INPUT_POST, 'action') == "delete") {
                $id = filter_input(INPUT_POST, "id", FILTER_VALIDATE_INT);

                if (!empty($id)) {
                    $deleteQuery = 'update dispoCodes '
                            . 'set `deleted` = 1 where id = ?';
                    $delete = $tze->query($deleteQuery, 'i', $id);

                    if ($insert) {
                        $json_data = json_encode(["Result" => "OK"]);
                        exit($json_data);
                    }
                }
            }
        }
    }
}

exit_error("Unbekannter Fehler!");
