<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

include_once(__DIR__ . '/../includes/auth.inc');

if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    $hostname = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['PHP_SELF']);

    header('Location: https://' . $hostname . ($path == '/' ? '' : $path) . '');
    exit;
} else {
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', 0, $params['path'], $params['domain'], $params['secure'], isset($params['httponly']));
    }
    session_destroy();
}
?>
<!DOCTYPE html>
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
        <title><?php
// Nur Fehler melden
            error_reporting(E_ERROR);
            include_once (__DIR__ . '../includes/settings.inc');

            if (!isset($strSiteName) || $strSiteName == "") {
                $strSiteName = "o2 Backoffice - Benchmark Partner";
            }

            if (isset($strSubSiteName) && $strSubSiteName != '') {
                $strSiteName = $strSiteName . ' - ' . $strSubSiteName;
            }
            print strip_tags($strSiteName)
            ?></title>
        <link rel="stylesheet" href="css/framework.min.css">
    </head>
    <body>
        <?php include __DIR__ . '/../includes/navi.inc'; ?>
        <div class="container">
            <div class="row">
                <div class="col-sm-6 col-sm-offset-3">
                    <div class="jumbotron">
                        <h3 class="text-center">Du hast dich erfolgreich ausgeloggt.</h3>
                        <a class="btn btn-primary btn-block btn-lg" href="login.php">zum Login</a>
                    </div>
                </div>
            </div>
        </div>
        <script src="js/framework.min.js"></script>
    </body>
</html>