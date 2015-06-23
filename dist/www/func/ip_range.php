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

$oDatenbank = tze::mysql();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    if (filter_input(INPUT_POST, 'mode') == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {
            if (filter_input(INPUT_POST, 'action') == "list") {
                $result = $oDatenbank->query("SELECT * FROM `ip_ranges`");
                $rows = array();
                while ($row = $result->fetch_assoc()) {
                    $rows[] = $row;
                }
                //Return result to jTable
                $jTableResult = array('Result' => "OK", 'Records' => $rows);
                print json_encode($jTableResult);
                exit;
            }

            if (filter_input(INPUT_POST, 'action') == "update") {

                $ip255 = "([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])";
                $suf32 = "([012]?[0-9]|3[0-2])";

                $regexPattern = array("options" => array("regexp" => "/^" . $ip255 . "\." . $ip255 . "\." . $ip255 . "\." . $ip255 . "\/" . $suf32 . "$/"));
                $inputArray['ip_range'] = filter_input(INPUT_POST, 'ip_range', FILTER_VALIDATE_REGEXP, $regexPattern);
                $inputArray['id'] = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
                $inputArray['name'] = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRIPPED);

                foreach ($inputArray as $key => $value) {
                    if ($value == false or is_null($value)) {
                        exit(json_encode(array('Result' => "ERROR", "Message" => 'Fehler in ' . $key)));
                    }
                }

                $result = $oDatenbank->query('update `ip_ranges` set ' .
                        '`ip_range` = "' . $inputArray['ip_range'] . '", ' .
                        '`name` = "' . $inputArray['name'] . '" ' .
                        'where `id` = ' . $inputArray['id']);
                if ($result) {
                    $result = $oDatenbank->query('select * from `ip_ranges` where `id` = ' . $inputArray['id']);
                    $rows = array();
                    $row = $result->fetch_assoc();
                    //Return result to jTable
                    $jTableResult = array('Result' => "OK", 'Record' => $row);
                    print json_encode($jTableResult);
                    exit;
                } else {
                    exit(json_encode(array('Result' => "ERROR", "Message" => $oDatenbank->error)));
                }
            }

            if (filter_input(INPUT_POST, 'action') == "create") {

                $ip255 = "([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])";
                $suf32 = "([012]?[0-9]|3[0-2])";

                $regexPattern = array("options" => array("regexp" => "/^" . $ip255 . "\." . $ip255 . "\." . $ip255 . "\." . $ip255 . "\/" . $suf32 . "$/"));
                $inputArray['ip_range'] = filter_input(INPUT_POST, 'ip_range', FILTER_VALIDATE_REGEXP, $regexPattern);
                $inputArray['name'] = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRIPPED);

                foreach ($inputArray as $key => $value) {
                    if ($value == false or is_null($value)) {
                        exit(json_encode(array('Result' => "ERROR", "Message" => 'Fehler in ' . $key)));
                    }
                }

                $result = $oDatenbank->query('insert into `ip_ranges` set ' .
                        '`ip_range` = "' . $inputArray['ip_range'] . '", ' .
                        '`name` = "' . $inputArray['name'] . '"');
                if ($result) {
                    $result = $oDatenbank->query('select * from `ip_ranges` where `id` = ' . $oDatenbank->insert_id);
                    $row = $result->fetch_assoc();
                    //Return result to jTable
                    $jTableResult = array('Result' => "OK", 'Record' => $row);
                    print json_encode($jTableResult);
                    exit;
                } else {
                    exit(json_encode(array('Result' => "ERROR", "Message" => $oDatenbank->error)));
                }
            }

            if (filter_input(INPUT_POST, 'action') == "delete") {
                $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
                if ($id > 0) {
                    if ($oDatenbank->query('delete from `ip_ranges` WHERE id = "' . $id . '"')) {
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
