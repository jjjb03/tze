<?php

/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

require_once __DIR__ . '/../../includes/auth.inc';
require_once __DIR__ . '/../../includes/functions.inc';
require_once __DIR__ . '/../../includes/PHPExcel.php';

$tze = new tze();
$oDatenbank = $tze->mysql();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (filter_input(INPUT_POST, 'mode') == "admin") {
#
#   Admin Status Prüfen
#
if (!$_SESSION['iAdmin'] == 1) {
    exit_error('unzureichende Rechte!');
} else {

    // Datum einlesen
    $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);

    // Datum SQL passend formatieren
    $Date = $tze->sqlDate($Date);

    // Arbeitsmappe erstellen
    $objPHPExcel = new PHPExcel();

    //Projekte einlesen
    $query = 'select * from projekte where deleted != 1';
    $projects = $tze->get_Results($query);

    //jedes Projekt einzeln
    foreach ($projects as $project) {
        $projectId = $project["id"];

        $queryTicketTypes = "select * from projekte_tickets where projektId = ?";
        $ticketTypes = $tze->get_Results($queryTicketTypes, "i", $projectId);

        $ticketHead = "";
        $ticketQuery = "";

        foreach ($ticketTypes as $tickettyp) {
            $ticketName = filter_var($tickettyp['ticketName'], FILTER_SANITIZE_STRING);
            $ticketId = $tickettyp['ticketId'];

            $ticketHead .= ", tickets.`$ticketName` \n";
            $ticketQuery .= ", sum(if(ticketId = $ticketId, done_tickets, 0)) as `$ticketName` \n";

            if ($tickettyp['counterSwitch'] > 1) {
                $counterName = filter_var($tickettyp['counterName'], FILTER_SANITIZE_STRING);
                $ticketHead .= ", tickets.`$ticketName - $counterName` \n";
                $ticketQuery .= ", sum(if(ticketId = $ticketId, sum_counter, 0)) as `$ticketName - $counterName` \n";
            }

            if ($tickettyp['durationSwitch'] > 1) {
                $ticketHead .= ", tickets.`$ticketName - Zeit`\n";
                $ticketQuery .= ", sum(if(ticketId = $ticketId, sum_duration, 0)) as `$ticketName - Zeit`\n";
            }
        }

        $query = "SELECT 
                            maId as `Kürzel`,
                            sNachname AS Nachname,
                            sVorname AS Vorname, 
                            sum_tickets.tickets as `Summe Tickets`
                            $ticketHead
                        FROM ma
                        left join (
                            SELECT 
                                userId,
                                sum(done_tickets) as tickets
                            FROM tickets_view 
                            WHERE `projektId` = ? and date = ?
                            group by userId
                        ) sum_tickets on (ma.userId = sum_tickets.userId)
                        left join (
                            SELECT 
                                userId
                                $ticketQuery
                            FROM tickets_view 
                            WHERE `projektId` = ? and date = ?
                            group by userId
                        ) tickets on (ma.userId = tickets.userId)
                        WHERE deleted = 0 or deleted_date > ?
                        order by sNachname";

        $stmt = $tze->query($query, 'isiss', $projectId, $Date, $projectId, $Date, $Date);

        $headers = $tze->fetch_headers($stmt);
        $rows = $tze->fetch_assoc($stmt);

        //neues Blatt anlegen, Blatt benennen und Inhalt einfügen
        $worksheet = $objPHPExcel
                ->createSheet()
                ->setTitle($project["Projekt"])
                ->fromArray($headers)
                ->fromArray($rows, null, "A2");

        $numRows = count($rows);
        $highestColumn = $worksheet->getHighestColumn();
        $highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn); //e.g., 6

        $firstRowStyle = [
            'font' => ['bold' => true],
            'borders' => [
                'bottom' => [
                    'style' => PHPExcel_Style_Border::BORDER_THIN
                ]
            ],
//                'alignment' => [
//                    'wrap' => true,
//                    'rotation' => 45
//                ]
        ];
        
        $firstRowTicketStyle = [
            'font' => ['bold' => true],
            'borders' => [
                'bottom' => [
                    'style' => PHPExcel_Style_Border::BORDER_THIN
                ]
            ],
//                'alignment' => [
////                    'wrap' => true,
//                    'rotation' => 45
//                ]
        ];

        $worksheet
                ->getStyle('A1:' . $highestColumn . '1')
                ->applyFromArray($firstRowStyle);
        
        $worksheet
                ->getStyle('D1:' . $highestColumn . '1')
                ->getAlignment()
                ->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER)
                ->setWrapText(true)
                ->setTextRotation(90);
        
        $worksheet->getRowDimension('1')->setRowHeight("95");

        $worksheet->getColumnDimension('A')->setAutoSize(true);
        $worksheet->getColumnDimension('B')->setAutoSize(true);
        $worksheet->getColumnDimension('C')->setAutoSize(true);

//        for ($column = 3; $column < $highestColumnIndex; $column++) {
//            //columns are 0 indexed
//            $columnLetter = PHPExcel_Cell::stringFromColumnIndex($column);
//            //$objPHPExcel->getActiveSheet()->getColumnDimension($columnLetter)->setAutoSize(true);
//            $worksheet
//                    ->getColumnDimension($columnLetter)
//                    ->setWidth(9);
//        }
        
        $worksheet->setAutoFilter('A1:' . $highestColumn . ($numRows + 1));
    }

    // 1. Blatt entfernen, da aktuell leer
    $objPHPExcel->removeSheetByIndex(0);

    $DateiName = 'tickets_' . $Date . '.xlsx';

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename=' . $DateiName);
    header('Cache-Control: max-age=0');
    // If you're serving to IE 9, then the following may be needed
    header('Cache-Control: max-age=1');

    // If you're serving to IE over SSL, then the following may be needed
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
    header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
    header('Pragma: public'); // HTTP/1.0

    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    $objWriter->save('php://output');
    exit;
        }
    }
}

exit("Fehler!");
