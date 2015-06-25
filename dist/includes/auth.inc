<?php

# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

include_once 'settings.inc';
include_once 'functions.inc';

# Session Starten
if (!isset($_SESSION)) {
    session_start();
}

// Ablehnen, wenn IP nicht bekannt!
if ( !isset($_SESSION['lastIP']) || $_SESSION['lastIP'] != $_SERVER['REMOTE_ADDR']) { 
    require_once 'mysql.inc';

    $tze = new tze();

    $ipTest = 'fail';
    $IpRanges = $tze->get_Results('select `ip_range` from `ip_ranges`');

    foreach ($IpRanges as $range) {
        if (ip_in_range($_SERVER['REMOTE_ADDR'], $range['ip_range'])) {
            $ipTest = "success";
        }
    }
    
    if ($ipTest == 'fail') {
//        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
//            exit('{"Result":"ERROR","Message":"Dein Passwort ist abgelaufen, du musst dieses jetzt ändern!","Goto":"' . $sProject_URL . 'password.php"}');
//        } else {
//            header('Location: ' . $sProject_URL . 'password.php');
//            exit;
//        }
        exit('<h1>Zugriff nicht gestattet!</h1><span class="text-muted">Bist du gerade nicht auf Arbeit?</span>');
    }
    
    $_SESSION['lastIP'] = $_SERVER['REMOTE_ADDR'];
}

// Abmelden nach 2 Stunden
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 7200)) {
    // last request was more than 2 hours ago
    session_unset();     // unset $_SESSION variable for the run-time
    session_destroy();   // destroy session data in storage
    // exit;
} else {
    $_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
}

if (!isset($_SESSION['CREATED'])) {
    $_SESSION['CREATED'] = time();
} else if (time() - $_SESSION['CREATED'] > 1800) {
    // session started more than 30 minutes ago
    session_regenerate_id(true);    // change session ID for the current session and invalidate old session ID
    $_SESSION['CREATED'] = time();  // update creation time
}

# Auf Login Seite weiterleiten, falls nicht eingeloggt
if ((!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) && ((basename($_SERVER['PHP_SELF']) <> "login?.php"))) {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        exit('{"Result":"ERROR","Message":"Du warst zu lange inaktiv und wurdest daher abgemeldet! \n Bitte melde dich wieder an und führe die Aktion erneut aus.","Goto":"' . $sProject_URL . 'login.php"}');
    } else {
        header('Location: ' . $sProject_URL . 'login.php');
        exit;
    }
}

# Falls eingelogt prüfen ob erzwungener PW-Reset
if (basename($_SERVER['PHP_SELF']) <> "password.php" &&
        basename($_SERVER['PHP_SELF']) <> "logout.php" &&
        ( isset($_SESSION["bForce_Update_PW"]) &&
        $_SESSION["bForce_Update_PW"] )
) {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        exit('{"Result":"ERROR","Message":"Dein Passwort ist abgelaufen, du musst dieses jetzt ändern!","Goto":"' . $sProject_URL . 'password.php"}');
    } else {
        header('Location: ' . $sProject_URL . 'password.php');
        exit;
    }
}
?>