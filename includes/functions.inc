<?php

# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

require_once 'autoload.php';
require_once 'ip_in_range.inc';
require_once 'mysql.inc';


if (empty($strSiteName)) {
    $strSiteName = "TZE";
}

$PageTitle = strip_tags($strSiteName);

if (isset($strSubSiteName) && $strSubSiteName != '') {
    $PageTitle = strip_tags($strSiteName . ' - ' . $strSubSiteName);
}

/**
 * 
 * @param string $Meldung Fehlermeldung
 * @param mysqli $oDB SQL-Objekt
 * @param string $Result Fehler-Ergebnis
 * @param array $addArray Array, welches mit ausgegeben wird
 */
function exit_error($Meldung = '', $oDB = '', $Result = 'ERROR', $addArray = null) {

    $Fehler['Message'] = $Meldung;

    if (empty($Result)) {
        $Fehler["Result"] = 'ERROR';
    } else {
        $Fehler['Result'] = $Result;
    };

    if ($oDB instanceof mysqli) {
        $Fehler["SQL-Error"] = $oDB->error;
    }

    if (is_array($addArray)) {
        $Fehler = array_merge($Fehler, $addArray);
    }

    print json_encode($Fehler);
    exit;
}
