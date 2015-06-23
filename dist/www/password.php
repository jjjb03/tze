<?php
# 
# Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
#
# Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
# Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
# http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
#

$strSubSiteName = 'Passwort';

require_once(__dir__ . '/../includes/auth.inc');
require_once(__dir__ . '/../includes/functions.inc');
require_once(__dir__ . '/../includes/passwordLib.inc');

$tze = new tze();
$oDB = $tze->mysql();

$sError = "";
$sIntro = "";

if ($_SESSION["bForce_Update_PW"]) {
    $sIntro = "<p>Das Passwort muss geändert werden!</p>\n";
}

$iPasswordUserID = $_SESSION['userId'];

$result = $tze->get_Results('SELECT * FROM ma WHERE userId = ?', 'i', $iPasswordUserID);
if ($result) {
    if (count($result) == 1) {
        $sUserName = $result[0]["sLogin"] . " (" . $result[0]['sVorname'] . " " . $result[0]['sNachname'] . ")";
        $sOldPassword_hash = $result[0]["sPassword_hash"];
    } else {
        $sUserName = "<span style=\"font-size: smaller; color: #800000;\">User nicht gefunden!</span>\n";
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $passwd_old = filter_input(INPUT_POST, 'passwd_old', FILTER_SANITIZE_STRIPPED);
    $passwd_new_1 = filter_input(INPUT_POST, 'passwd_new_1', FILTER_SANITIZE_STRIPPED);
    $passwd_new_2 = filter_input(INPUT_POST, 'passwd_new_2', FILTER_SANITIZE_STRIPPED);

    $return = "OK";

    # Falls alles korrekt gefüllt, Passwort auf Änderung prüfen
    if ($passwd_new_1 == "") {
        $return = "ERROR";
        $ErrorFields[] = [
            "Field" => "passwd_new_1",
            "Message" => "Neues Passwort fehlt!"
        ];
    }

    if ($passwd_new_1 <> $passwd_new_2) {
        $return = "ERROR";
        $ErrorFields[] = [
            "Field" => "passwd_new_2",
            "Message" => "Passworter stimmen nicht überein!"
        ];
    }

    if (!password_verify($passwd_old, $sOldPassword_hash)) {
        $return = "ERROR";
        $ErrorFields[] = [
            "Field" => "passwd_old",
            "Message" => "Passwort ist falsch!"
        ];
    }

    if (password_verify($passwd_new_1, $sOldPassword_hash)) {
        $return = "ERROR";
        $ErrorFields[] = [
            "Field" => "passwd_new_1",
            "Message" => "Darf nicht altem Passwort identisch sein!"
        ];
    }

    if ($return == "OK") {
        $sNewPassword_hash = password_hash($passwd_new_1, PASSWORD_DEFAULT);
        if ($tze->query("UPDATE ma set sPassword_hash = ?, bForce_Update_PW = '0' WHERE userId = ?", "si", $sNewPassword_hash, $iPasswordUserID)) {
            $_SESSION["bForce_Update_PW"] = 0;
            $message = ["Result" => $return, "Message" => "Passwort erfolgreich geändert.", "GoTo" => "."];
        } else {
            $message = ["Result" => "ERROR", "Message" => "Passwort konnte nicht gespeichert werden!"];
        }
    } else {
        $message = ["Result" => $return, "ErrorFields" => $ErrorFields];
    }

    exit(json_encode($message));
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
        <title><?php print strip_tags($PageTitle) ?></title>
        <link rel="stylesheet" href="css/framework.min.css">
    </head>
    <body>
        <?php include __DIR__ . '/../includes/loadscreen.inc'; ?>
<?php include __DIR__ . '/../includes/navi.inc'; ?>
        <div class="container">
            <div class="row">
                <div class="col-sm-offset-3 col-sm-6">
                    <div class="panel panel-default">
                        <div class="panel-heading">Passwort ändern</div>
                        <div class="panel-body">
                            <form method="post" class="form-horizontal">
                                <div class="form-group">
                                    <label class="col-sm-6 control-label">Login</label>
                                    <div class="col-sm-6">
                                        <p class="form-control-static"><?php echo $sUserName; ?></p>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="passwd_old" class="col-sm-6 control-label">altes Passwort</label>
                                    <div class="col-sm-6">
                                        <input type="password" class="form-control" id="passwd_old" name="passwd_old" placeholder="Passwort" autocomplete=off required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="passwd_new_1" class="col-sm-6 control-label">neues Passwort</label>
                                    <div class="col-sm-6">
                                        <input type="password" class="form-control" id="passwd_new_1" name="passwd_new_1" placeholder="Passwort" autocomplete=off required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="passwd_new_2" class="col-sm-6 control-label">neues Passwort wiederholen</label>
                                    <div class="col-sm-6">
                                        <input type="password" class="form-control" id="passwd_new_2" name="passwd_new_2" placeholder="Passwort" autocomplete=off required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-sm-12">
                                        <button type="submit" class="btn btn-default btn-block">Passwort setzen</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>  
                </div>
            </div>
        </div>
        <script src="js/framework.min.js"></script>
        <script>
            $(function () {
                $(".m-app-loading").fadeOut(function () {
                    $(".m-app-loading").remove();
                });

                $('form').on("submit", function (event) {
                    $('.popover').remove();
                    event.preventDefault();
                    $(".form-group").removeClass('has-error')
                    tze.showProcess();
                    var values = $(this).serializeArray();
                    $.post('password.php', values, function (data) {
                        tze.hideProcess();
                        if (data.Message !== undefined) {
                            bootbox.alert({
                                message: data.Message,
                                callback: function () {
                                    if (data.GoTo !== undefined) {
                                        window.location.replace(data.GoTo);
                                    }
                                }
                            });
                        }

                        if (data.Result === "ERROR") {
                            if (data.ErrorFields !== undefined) {
                                $.each(data.ErrorFields, function () {
                                    $('#' + this.Field).closest(".form-group").addClass('has-error');
                                    if (this.Message !== undefined) {
                                        $('#' + this.Field).popover({content: this.Message, trigger: "manual"}).popover('show');
                                    }
                                });
                            }
                            if (data.Message !== undefined) {
                                bootbox.alert({
                                    message: data.Message,
                                    callback: function () {
                                        if (data.GoTo !== undefined) {
                                            window.location.replace(data.GoTo);
                                        }
                                    }
                                });
                            }
                        }
                    }, "json");
                });
            });
        </script>
    </body>
</html>