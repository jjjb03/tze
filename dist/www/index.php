<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

require_once(__DIR__ . '/../includes/auth.inc');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    require_once(__DIR__ . '/../includes/functions.inc');

    $Datenbank = tze::mysql();

    if (filter_input(INPUT_POST, 'action') == "getProjects") {
        $sQuery = 'SELECT pr.id as id, pr.Projekt as ButtonLabel
		FROM `projekte_zuordnung` as pz
		INNER JOIN `projekte` as pr ON (pr.id = pz.iProjekt)
		where iUser = ' . $_SESSION['userId'];

        $result = $Datenbank->query($sQuery);

        if ($result) {
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }

            $message = json_encode(["Result" => "OK", "Data" => $rows]);
            exit($message);
        } else {
            exit_error();
        }
    }

    if (filter_input(INPUT_POST, 'action') == "getTimes") {
        $result = $Datenbank->query('SELECT * From dispoCodes ORDER BY `position` ASC, `code` ASC');
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            $rows[] = ["id" => "0", "ButtonLabel" => "Feierabend"];
            $message = json_encode(["Result" => "OK", "Data" => $rows]);
            exit($message);
        } else {
            exit_error();
        }
    }

    exit_error();
};
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
        <link rel="icon" href="res/logo_only.png">
        <link rel="stylesheet" href="css/framework.css">
    </head>
    <body>
        <?php include __DIR__ . '/../includes/loadscreen.inc'; ?>
        <?php include __DIR__ . '/../includes/navi.inc'; ?>
        <div class="container" ><!--style="visibility: hidden;"-->
            <div class="row">
                <div class="col-sm-6 col-sm-push-6 col-md-3 col-md-push-9" id="sidebar_right">
                    <div class="panel panel-default">
                        <div class="panel-heading">Tickets</div>
                        <div id="Tickets" class="list-group"></div>
                    </div>
                </div>
                <div class="col-sm-6 col-sm-pull-6 col-md-3 col-md-pull-3" id="sidebar_left">
                    <div class="panel panel-default">
                        <div class="panel-heading">Zeiten</div>
                        <div class="list-group">
                            <div class="list-group-item">
                                <span>Arbeit</span>
                                <time class="pull-right" id="AZ_Total" datetime="AZ_Total" hh:mm:ss>00:00:00</time>
                            </div>
                            <div class="list-group-item">
                                <span>Pause</span>
                                <time class="pull-right" id="PZ_Total" datetime="PZ_Total" hh:mm:ss>00:00:00</time>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">Projekte</div>
                        <div class="list-group text-center" role="group" id="buttons_projects"></div>
                    </div>
                    <div class="panel panel-default">
                        <div class="panel-heading">Zeiterfassung</div>
                        <div class="list-group text-center" role="group" id="buttons_times"></div>
                    </div>
                </div>
                <div class="col-sm-12 col-md-6 col-md-pull-3" id="main">
                    <div id="timetable"></div>
                </div>
            </div>
        </div>
        <script src="js/framework.min.js"></script>
        <script src="js/TZE.js"></script>
    </body>
</html>
