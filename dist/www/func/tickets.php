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

$tze = new tze();
$oDatenbank = $tze->mysql();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $jtSorting = filter_input(INPUT_POST, 'jtSorting', FILTER_SANITIZE_STRIPPED);
    if (is_null($sort)) {
        $jtSorting = '';
    } else {
        $jtSorting = " order by $jtSorting ";
    }

    // öfter benötigte Variablen...

    $jtStartIndex = filter_input(INPUT_POST, 'jtStartIndex', FILTER_SANITIZE_NUMBER_INT);
    $jtPageSize = filter_input(INPUT_POST, 'jtPageSize', FILTER_SANITIZE_NUMBER_INT);
    $jtSorting = filter_input(INPUT_POST, 'jtSorting', FILTER_SANITIZE_STRIPPED);

    if (!empty($jtPageSize)) {
        $jtStartIndex = !empty($jtPageSize) ? $jtStartIndex : 0;
        $limit = " LIMIT $jtStartIndex, $jtPageSize ";
    } else {
        $limit = "";
    }

    if (!empty($jtSorting)) {
        $orderBy = " Order By $jtSorting ";
    } else {
        $orderBy = "";
    }

    # letzen, nicht beendeten Tag abrufen
    $QueryLastDay = 'SELECT Date FROM `ze_full` WHERE iUserID = ? and Time_End = "0000-00-00 00:00:00"';
    $LastLogedTime = $tze->get_Results($QueryLastDay, "i", $_SESSION['userId']);

    if (count($LastLogedTime) > 0) {
//    if (!empty($LastLogedTime[0]['Date'])) {
        $strDate = $LastLogedTime[0]['Date'];
    } else {
        $strDate = date("Y-m-d");
    }

    $action = filter_input(INPUT_POST, 'action');
    $mode = filter_input(INPUT_POST, 'mode');

    if ($mode == "admin") {
        #
        #   Admin Status Prüfen
        #
        if (!$_SESSION['iAdmin'] == 1) {
            exit_error('unzureichende Rechte!');
        } else {
            $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);
            $Date = $tze->sqlDate($Date);

            if ($action == "list") {

                $strQuery = "SELECT 
                        id, 
                        Projekt, 
                        done_tickets, 
                        sum_counter, 
                        sum_duration 
                    FROM `projekte` 
                    left join (
                            select 
                                    projektId,
                                    sum(done_tickets) as done_tickets,
                                    sum(sum_counter) as sum_counter,
                                    sum(sum_duration) as sum_duration
                            from tickets_view
                            WHERE Date = ?
                            group by projektId
                    ) tickets on (tickets.projektId = projekte.id)
                    WHERE id > 0 AND deleted <> 1";
                $rows = $tze->get_Results($strQuery, "s", $Date);

                exit(json_encode(array("Result" => "OK", "Records" => $rows)));
            }

            if ($action == "list-ma") {
                $id = filter_input(INPUT_POST, "id", FILTER_SANITIZE_NUMBER_INT);

                $query = "select * from pz_full ma
                    left join (
                            select
                                    userId,
                                    sum(done_tickets) as done_tickets,
                                    sum(sum_counter) as sum_counter,
                                    sum(sum_duration) as sum_duration
                            from tickets_view where date = ?
                            group by userId
                    ) tickets on (tickets.userId = ma.iUser)
                    where iProjekt = ? $orderBy $limit";

                $rows = $tze->get_Results($query, "si", $Date, $id);

                $jtResult = json_encode(["Result" => "OK", "Records" => $rows]);
                exit($jtResult);
            }

            if ($action == "list-ticket-classes") {
                
            }
            exit_error("Fehlerhafter Aufruf");
        }
    }

    if ($action == 'list') {
        $projektId = filter_input(INPUT_POST, 'projektId', FILTER_VALIDATE_INT);
        $userId = $_SESSION['userId'];

        if (!empty($projektId)) {

            $query = "select
                alltickets.*,
                COALESCE(tickets.done_tickets, 0) as tickets,
                COALESCE(tickets.sum_counter, 0) as counter,
                COALESCE(tickets.sum_duration, 0) as duration,
                COALESCE(tickets.timestamp, 0) as timestamp
            from projekte_tickets alltickets
            left join (
                select *
                from `tickets_view`
                where userId = ? and date = ?
            ) tickets on (alltickets.ticketId = tickets.ticketId)
            where alltickets.projektId = ?";

            $rows = $tze->get_Results($query, "isi", $userId, $strDate, $projektId);

            $json_data = ['Result' => "OK", 'data' => $rows];
            print json_encode($json_data);
            exit;
        }
    }

    if ($action == 'new') {

        $ticketId = filter_input(INPUT_POST, 'ticketId', FILTER_VALIDATE_INT);
        $ticketNumber = filter_input(INPUT_POST, 'ticketNumber', FILTER_VALIDATE_INT);
        $counter = filter_input(INPUT_POST, 'counter', FILTER_VALIDATE_INT);
        $duration = filter_input(INPUT_POST, 'duration', FILTER_VALIDATE_INT);
        $undone = filter_input(INPUT_POST, 'undone', FILTER_VALIDATE_BOOLEAN);

        if ($ticketId !== null && $ticketId !== false) {

            $project_result = $tze->get_Results('Select * from projekte_tickets where ticketId = ?', 'i', $ticketId);

            $intTest = ['ticketNumber', 'counter', 'duration'];
            foreach ($intTest as $testele) {
                if ($project_result['0'][$testele . 'Switch'] > 2) {
                    if (is_null($$testele) || $$testele == false) {
                        exit_error('Angabe fehlt!', null, null, ["errorIn" => $testele]);
                    }
                }
            }

            $boolTest = ['undone'];
            foreach ($boolTest as $testele) {
                if ($project_result['0'][$testele . 'Switch'] > 1) {
                    if (is_null($$testele)) {
                        exit_error('Angabe fehlt!', null, null, ["errorIn" => $testele]);
                    }
                }
            }

            $ticketTable = 'tickets'; //_' . $project_result['0']['projektId'];

            $insertQuery = "insert into $ticketTable (userId, date, ticketId, ticketNumber, duration, counter, undone) value (?, ?, ?, ?, ?, ?, ?)";

            if ($tze->query($insertQuery, 'isiiiis', $_SESSION['userId'], $strDate, $ticketId, $ticketNumber, $duration, $counter, $undone)) {
                $query = "select "
                        . "done_tickets as tickets, "
                        . "sum_counter as counter, "
                        . "sum_duration as duration, "
                        . "timestamp "
                        . "from tickets_view "
                        . "where userId = ? and  date = ? and ticketId = ?";

                $rows = $tze->get_Results($query, "isi", $_SESSION['userId'], $strDate, $ticketId);

                $message = ["Result" => "OK", "data" => $rows[0], "undone" => $undone];
                exit(json_encode($message));
            }
        }
    }
}

exit_error('Ungültiger Aufruf!', $oDatenbank);
