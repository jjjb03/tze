<?php

# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

require_once __DIR__ . '/settings.inc';

class tze {

    function error($message, $level = E_USER_NOTICE) {
        $debug = debug_backtrace();
        $caller = next($debug);
        exit_error('"' . $message . '" in <strong>' . $caller['function'] . '</strong> called from <strong>' . $caller['file'] . '</strong> on line <strong>' . $caller['line'] . '</strong>', "", "", $debug);
    }

    /**
     * Stellt die MySQL-Verbindung her.
     * @param bool $noExit If true, function will not exit script on Connection failure
     * @author Johannes Boost <jjjb at usw-tools.de>
     */
    public function mysql($noExit = false) {
        global $MySQL_Server, $MySQL_database, $MySQL_User, $MySQL_Passwd, $MySQL_Socket;
        $MySqlConn = new mysqli($MySQL_Server, $MySQL_database, $MySQL_User, $MySQL_Passwd, $MySQL_Socket);

        /* check connection */
        if ($MySqlConn->connect_errno) {
            if (!$noExit) {
                if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
                    $errorMsg = ["Result" => "ERROR", "Message" => sprintf("Datenbank nicht verfügbar:<br>%s", $MySqlConn->connect_error)];
                    sleep(1);
                    print json_encode($errorMsg);
                    exit();
                } else {
                    sleep(1);
                    printf("Datenbank ist nicht verfügbar: %s", $MySqlConn->connect_error);
                    exit();
                }
            }
        } else {

            # 
            # mySQL auf UTF-8 umstellen
            #
        if (!$MySqlConn->set_charset("utf8")) {
                printf("Error loading character set utf8: %s\n", mysqli_error($MySqlConn));
            }

            return $MySqlConn;
        }
    }

    /**
     * Performs SQL Query using binding parameters
     * @param string $query
     * @param string|bool|int $params
     * @return array 
     */
    public function get_Results($query, $params = "") {
        $valarray = [];
        $numargs = func_num_args();

        if ($numargs > 1) {
            if (strlen($params) + 2 == $numargs) {
                $valarray[] = $params;
                $argArray = func_get_args();
                for ($i = 2; $i < $numargs; $i++) {
                    $valarray[] = &$argArray[$i];
                }
            } else {
                $this->error("Unbekannter Fehler...");
            }
        }

        $sql = $this->mysql();
        $stmt = $sql->prepare($query);

        if ($stmt) {
            if (count($valarray) > 0) {
                if (!call_user_func_array(array($stmt, 'bind_param'), $valarray)) {
                    $this->error("Unbekannter Fehler...");
                }
            }
            if ($stmt->execute()) {
                $result = $this->fetch_assoc($stmt);
                return $result;
            } else {
                $this->error("Unbekannter Fehler...");
            }
        } else {
            $this->error("Unbekannter Fehler...");
        }
    }

    public function Result_nPrep($query) {

        $sql = $this->mysql();
        $result = $sql->query($query);

        if ($result) {
            if (!$result instanceof mysqli_result) {
                return $result;
            } else {
                while ($row = $result->fetch_assoc()) {
                    $rows[] = $row;
                }
                return $rows;
            }
        } else {
            $this->error("Unbekannter Fehler...");
        }
    }

    public function query($query, $params = null) {
        $valarray = [];
        $numargs = func_num_args();

        if ($numargs > 2) {
            if (strlen($params) + 2 == $numargs) {
                $valarray[] = $params;
                $argArray = func_get_args();
                for ($i = 2; $i < $numargs; $i++) {
                    $valarray[] = &$argArray[$i];
                }
            } else {
                $this->error('Wrong number of arguments');
            }
        }
        $sql = $this->mysql();
        $stmt = $sql->prepare($query);

        if ($stmt) {
            if (count($valarray) > 0) {
                call_user_func_array(array($stmt, 'bind_param'), $valarray);
            }
            if ($stmt->execute()) {
                return $stmt;
            } else {
                $this->error("Failure on execute");
            }
        } else {
            $this->error("Failure on prepare");
        }
    }

    /**
     * Formatiert Datum für SQL, oder gibt CURRENT_DATE aus
     * 
     * @param string $Date Datum
     * @return string Datum im SQL Format, oder CURRENT_DATE, falls null
     */
    public function sqlDate($Date = null) {

        if (is_null($Date)) {
            $result = date("Y-m-d");
        } elseif (strlen($Date) < 11) {
            $result = date("Y-m-d", strtotime($Date));
        } else {
            $result = date("Y-m-d H:i:s", strtotime($Date));
        }
        return $result;
    }

    /**
     * Formatiert Datum nach deutschen Regeln
     * 
     * @param String $dateStr Datum
     * @return string Datum im Deutschen Format
     */
    public function germDateTime($dateStr) {
        $date = date_create($dateStr);
        return date_format($date, 'd.m.Y H:i:s');
    }

    /**
     * gibt ein Array der Abfrage zurück
     * @param mysqli_stmt|mysqli_result $stmt Prepared and executed SQL Statement or SQL Resultset
     */
    public function fetch_assoc($stmt) {
        $array = array();

        if ($stmt instanceof mysqli_stmt) {
            if ($stmt->store_result()) {
                $variables = array();
                $meta = $stmt->result_metadata();

                if ($meta) {

                    $data = array();
                    while ($field = $meta->fetch_field()) {
                        $variables[] = &$data[$field->name]; // pass by reference
                    }

                    call_user_func_array(array($stmt, 'bind_result'), $variables);

                    $i = 0;
                    while ($stmt->fetch()) {
                        $array[$i] = array();
                        foreach ($data as $k => $v)
                            $array[$i][$k] = $v;
                        $i++;

                        // don't know why, but when I tried $array[] = $data, I got the same one result in all rows
                    }
                }
                $stmt->free_result();
            }
        } elseif ($stmt instanceof mysqli_result) {
            while ($row = $stmt->fetch_assoc())
                $array[] = $row;
        }

        return $array;
    }

    function fetch_headers($stmt) {

        $array = [];

        if ($stmt instanceof mysqli_stmt) {

            //$stmt->store_result();
            $meta = $stmt->result_metadata();

            while ($field = $meta->fetch_field()) {
                $array[] = $field->name;
            }
        } elseif ($stmt instanceof mysqli_result) {
            while ($field = $stmt->fetch_field()) {
                $array[] = $field->name;
            }
        }

        return $array;
    }

}
