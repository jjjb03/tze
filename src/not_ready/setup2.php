<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

require_once __DIR__ . '/../func/mysql.inc';
include_once __DIR__ . '/../settings.inc';

# Session Starten
if (!isset($_SESSION)) {
	session_start();
}

$Datenbank = o2bo::mysql(true);

if ($Datenbank) {
    #
    #	Falls Datenbank verfügbar => Admin Status Prüfen
    #
    $result = $Datenbank->get_Results("SELECT iAdmin FROM ma WHERE userId = '" . $_SESSION['userId'] . "'");
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        if (!$row["iAdmin"]) {
            print "missing iAdmin";
            print("header('Location: ' . $sProject_URL);");
            exit;
        }
    } else {
        print "$result->num_rows";
        print("header('Location: ' . $sProject_URL);");
        exit;
    }
}

$strSubSiteName = "Einrichtung";

require_once __DIR__ . '/../func/bo_header.inc';
?>
<body>
    <div class="container">
        <div class="row">
            <form class="form-signin col-sm-4 col-sm-offset-4">
                <div class="form-group">
                    <label for="sql-server">MySQL Server</label>
                    <input type="text" id="sql-server" class="form-control" placeholder="MySQL Server" required autofocus value="<?php if (isset($MySQL_Server)) {
    print $MySQL_Server;
} ?>">
                </div>	
                <div class="form-group">
                    <label for="sql-login">MySQL Login</label>
                    <input type="text" id="sql-login" class="form-control" placeholder="Login" required value="<?php if (isset($MySQL_User)) {
    print $MySQL_User;
} ?>">
                    <label for="sql-passwd" class="sr-only">Passwort</label>
                    <input type="password" id="sql-passwd" class="form-control" placeholder="Passwort" required value="<?php if (isset($MySQL_Passwd)) {
    print $MySQL_Passwd;
} ?>">
                </div>	
                <div class="form-group">
                    <label for="sql-database">MySQL Datenbank</label>
                    <input type="text" id="sql-database" class="form-control" placeholder="Datenbank" required value="<?php if (isset($MySQL_database)) {
    print $MySQL_database;
} ?>">
                </div>	
                <div class="form-group">
                    <label for="projekt-root">Root-Pfad</label>
                    <span class="help-block">Bezogen auf die URL</span>
                    <input type="text" id="projekt-root" class="form-control" required autofocus value="<?php if (isset($Project_Root)) {
    print $Project_Root;
} else {
    print dirname(dirname(filter_input(INPUT_SERVER, 'PHP_SELF')));
} ?>">
                </div>	
                <div class="form-group">
                    <button class="btn btn-lg btn-primary btn-block" type="submit">Einrichten</button>
                </div>	
            </form>
        </div>	
    </div> <!-- /container -->
</body>
</html>
