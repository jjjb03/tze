<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#
// Nur Fehler melden
error_reporting(E_ERROR);

$strSubSiteName = 'Login';
require_once __DIR__ . '/../includes/settings.inc';
require_once __DIR__ . '/../includes/functions.inc';


if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "") { # Auf HTTPS umleiten und beenden
    $redirect = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $redirect");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && filter_input(INPUT_POST, 'action') === "login") {
    require_once __DIR__ . '/../includes/mysql.inc';
    require_once __DIR__ . '/../includes/passwordLib.inc';

    $regexPattern = array("options" => array("regexp" => "/^[a-zA-Z0-9]+$/"));
    $sLogin = filter_input(INPUT_POST, 'tze_login', FILTER_VALIDATE_REGEXP, $regexPattern);
    if (is_null($sLogin) || !$sLogin) {
        sleep(3);
        exit('{"Result":"ERROR","Message":"Login ungültig!"}');
    }

    $sPassword = filter_input(INPUT_POST, 'tze_passwd');

    $Datenbank = tze::mysql();

    $result = $Datenbank->query("SELECT * FROM ma WHERE sLogin = '$sLogin' AND `deleted` <> '1'");
    if (!$result) {
        $sError = "Fehler mit der Datenbank!";
    } else {
        if ($result->num_rows !== 1) {
            $sError = "Name oder Passwort falsch!";
        } else {
            $row = $result->fetch_assoc();
            if (!$row["bLogin_Allowed"]) {
                $sError = "Hinweis: Login ist gesperrt!";
            } else {
                if (!password_verify($sPassword, $row["sPassword_hash"])) {
                    $sError = "Name oder Passwort falsch!";
                } else {
                    session_start();
                    $_SESSION['logged_in'] = true;
                    $_SESSION['userId'] = $row["userId"];
                    $_SESSION['iAdmin'] = $row["iAdmin"];
                    $_SESSION['sLogin'] = $row["sLogin"];
                    $_SESSION['sVorname'] = $row["sVorname"];
                    $_SESSION['sNachname'] = $row["sNachname"];
                    $_SESSION["bForce_Update_PW"] = $row["bForce_Update_PW"];
                    exit('{"Result":"OK","GoTo":"https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/"}');
                }
            }
        }
    }
    sleep(3);
    exit('{"Result":"FAIL","Message":"' . $sLogin . ': ' . $sError . '"}');
}
?><!DOCTYPE html>
<!--
Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>

Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
-->
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php print strip_tags($PageTitle) ?></title>
        <link rel="stylesheet" href="css/framework.min.css">
        <link rel="icon" href="res/logo_only.png">
    </head>
    <body>
        <?php include __DIR__ . '/../includes/navi.inc'; ?>
        <div class="container" style="visibility: hidden;">
            <div class="row">
                <form class="form-signin col-sm-4 col-sm-offset-4">
                    <div class="form-group">
                        <label for="tze_login" class="sr-only">Login</label>
                        <input type="text" name="tze_login" class="form-control" placeholder="Login" required autofocus>
                        <label for="tze_passwd" class="sr-only">Passwort</label>
                        <input type="password" name="tze_passwd" class="form-control" placeholder="Passwort" required>
                    </div>	
                    <div class="form-group">
                        <button class="btn btn-lg btn-primary btn-block" type="submit">Anmelden</button>
                    </div>	
                </form>
            </div>	
        </div> <!-- /container -->
        <script src="js/framework.min.js"></script>
        <script>
            $(document).on("ready", function () {
                $('form').on("submit", function (event) {
                    $('.alert').remove();
                    event.preventDefault();
                    tze.showProcess();
                    $.post("", $(this).serialize() + "&action=login", function (data) {
                        if (data.Result === "OK") {
                            window.location.replace(data.GoTo);
                        } else {
                            var classStr = "alert alert-dissmissable";
                            if (data.Result === "ERROR") {
                                classStr += " alert-danger";
                            } else {
                                classStr += " alert-warning";
                            }
                            $('.form-group').first().after('<div class="' + classStr + '" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + data.Message + '</div>');
                            $("#process-text").html("Login fehlgeschlagen<br>");
                            tze.hideProcess();
                        }
                    }, "json");
                });
                $(".container").css("visibility", "visible");
            });
        </script>
    </body>
</html>