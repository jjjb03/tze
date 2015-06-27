<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#
// Nur Fehler melden
// error_reporting(E_ERROR);

$strSubSiteName = 'Verwaltung';

require_once __DIR__ . '/../includes/auth.inc';

$tze = new tze();

$Datenbank = $tze->mysql();

#
#	Admin Status Prüfen
#
$result = $Datenbank->query("SELECT iAdmin FROM ma WHERE userId = '" . $_SESSION['userId'] . "'");
if ($result) {
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        if (!$row["iAdmin"]) {
            header('Location: ' . $sProject_URL . 'login.php');
            exit;
        }
    }
}
$stylesheets[] = "/o2bo/res/jquery-ui-timepicker-addon.css";
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
        <title><?php print strip_tags($PageTitle) ?></title>
        <link rel="stylesheet" href="css/framework.min.css">
        <link rel="icon" href="res/logo_only.png">
    </head>
    <body>
        <?php include __DIR__ . '/../includes/loadscreen.inc'; ?>
        <?php include __DIR__ . '/../includes/navi.inc'; ?>
        <div class="container" id="main">
            <div role="tabpanel">
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#uebersicht" role="tab" data-toggle="tab">Übersicht</a></li>
                    <li role="presentation"><a href="#mitarbeiter" role="tab" data-toggle="tab">Mitarbeiter</a></li>
                    <li role="presentation"><a href="#projekte" role="tab" data-toggle="tab">Projekte</a></li>
                    <li role="presentation"><a href="#dispocodes" role="tab" data-toggle="tab">Dispocodes</a></li>
                    <li role="presentation"><a href="#zugriff" role="tab" data-toggle="tab">Externer Zugriff</a></li>
                    <li role="presentation"><a href="#zeiterfassung" role="tab" data-toggle="tab">Zeiterfassung</a></li>
                    <li role="presentation"><a href="#tickets" role="tab" data-toggle="tab">Tickets</a></li>
                    <li role="presentation"><a href="#umsatz" role="tab" data-toggle="tab">Umsatz</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane panel-body active" role="tabpanel" id="uebersicht">
                        <div>Hier kannst du die Mitarbeiter, Zeiterfassungen und Projekte verwalten.</div>
                        <div>Unter dem Reiter <a href="#zugriff" role="tab" data-toggle="tab">Zugriff</a> kannst du festlegen, von welcher IP-Range Änderungen zulässig sind.</div>
                    </div>
                    <div class="tab-pane panel-body" role="tabpanel" id="mitarbeiter"></div>
                    <div class="tab-pane panel-body" role="tabpanel" id="projekte"></div>
                    <div class="tab-pane panel-body" role="tabpanel" id="dispocodes"></div>
                    <div class="tab-pane panel-body" role="tabpanel" id="zugriff"></div>
                    <div class="tab-pane panel-body" role="tabpanel" id="umsatz"></div>
                    <div class="tab-pane panel-body" role="tabpanel" id="zeiterfassung">
                        <div class="row">
                            <div class="col-md-4 col-lg-3">
                                <div class="form-group">
                                    <div id="datepicker"></div>
                                </div>
                                <div class="panel panel-default">
                                    <div id="filterPanel" class="panel-heading">Filter</div>
                                    <div class="list-group" id="filter">
                                        <a href="#zeiterfassung" class="list-group-item filter">
                                            <span>Alle Filter deaktivieren</span>
                                        </a>
                                        <a href="#loggedOnly" class="list-group-item filter">
                                            <span>nur anwesende Mitarbeiter</span>
                                        </a>
<!--                                        <a href="#zeiterfassung" class="list-group-item">alle</a>
                                        <a href="#zeiterfassung" class="list-group-item">nur anwesende</a>
                                        <a href="#zeiterfassung" class="list-group-item">nur im gewählten Projekt</a>-->

                                        <a href="#projekt-toggle" class="list-group-item" data-toggle="collapse">
                                            <span>Projekt <span class="caret"></span></span>
                                        </a>
                                        <div id="projekt-toggle" class="list-group collapse"></div>

                                        <a href="#zeiterfassung" class="dropdown hidden list-group-item">
                                            <span>Team <span class="caret"></span></span>
                                            <ul class="dropdown-menu" role="menu"></ul>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-8 col-lg-9" id="jtable_ZE"></div>
                        </div>
                    </div>
                    <div class="tab-pane panel-body" role="tabpanel" id="tickets">
                        <div class="row">
                            <div class="col-md-4 col-lg-3">
                                <div class="form-group">
                                    <div id="datepicker_tickets"></div>
                                </div>
                            </div>
                            <div class="col-md-8 col-lg-9" id="jtable_Tickets"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="js/framework.min.js"></script>
        <script type="text/javascript" src="js/TZE.admin.js"></script>
    </body>
</html>
<!--kommentieren-->