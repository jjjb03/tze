<?php

/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
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

            $Date = filter_input(INPUT_POST, 'Date', FILTER_SANITIZE_STRIPPED);

            $Date = $tze->sqlDate($Date);

            $objPHPExcel = new PHPExcel();

            $dispoCodesArray = $tze->get_Results("select * from dispoCodes");

            foreach ($dispoCodesArray as $code) {
                $dispoCodes .= 'sum( if (icat = ' . $code['id'] . ', time_to_sec(Duration), 0)) / 24 / 60 / 60 as `' . $code['code'] . ". " . $code['ButtonLabel'] . '`, ';
                $dispoHeaders .= 'zeiten.`' . $code['code'] . ". " . $code['ButtonLabel'] . '`, ';
            }

            $dispoCodes = substr($dispoCodes, 0, -2);
            $dispoHeaders = substr($dispoHeaders, 0, -2);

            $query = "
                SELECT 
                    maId as `Kürzel`,
                    sNachname AS Nachname,
                    sVorname AS Vorname,
                    iArbeitszeit AS `Arbeitszeit Soll`,
                    zeiten.anfa as `First IN`,
                    zeiten.ende as `Last OUT`,
                    zeiten.az as `Gesamt exkl. Pause`,
                    $dispoHeaders
                FROM ma 
                LEFT JOIN (
                    SELECT 
                        iUserID, 
                        (time_to_sec(min(Time_Start)) - time_to_sec(Date))/24/60/60 as anfa,
                        (time_to_sec(max(Time_End)) - time_to_sec(Date))/24/60/60 as ende,
                        sum(if(class = 'Pause',0,time_to_sec(Duration)))/24/60/60 as az,
                        $dispoCodes
                    FROM ze_full 
                    WHERE DATE = ? group by iUserID
                ) zeiten ON (ma.userId = zeiten.iUserID)
                WHERE deleted = 0 or deleted_date > ?
                order by sNachname";

            $stmt = $tze->query($query, 'ss', $Date, $Date); // 

            $headers = $tze->fetch_headers($stmt);
            $rows = $tze->fetch_assoc($stmt);

            $numRows = count($rows);
            $worksheet = $objPHPExcel->getActiveSheet();

            $worksheet
                    ->setTitle("Zusammenfassung")
                    ->fromArray($headers)
                    ->fromArray($rows, null, "A2");

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

            $worksheet
                    ->getStyle('E2:' . $highestColumn . ($numRows + 1))
                    ->getNumberFormat()
                    ->setFormatCode('hh:mm:ss');

            $worksheet
                    ->getStyle('A1:' . $highestColumn . '1')
                    ->applyFromArray($firstRowStyle);

            $worksheet->getColumnDimension('A')->setAutoSize(true);
            $worksheet->getColumnDimension('B')->setAutoSize(true);
            $worksheet->getColumnDimension('C')->setAutoSize(true);
            $worksheet->getColumnDimension('D')->setWidth(4);

            for ($column = 4; $column < $highestColumnIndex; $column++) {
                //columns are 0 indexed
                $columnLetter = PHPExcel_Cell::stringFromColumnIndex($column);
                //$objPHPExcel->getActiveSheet()->getColumnDimension($columnLetter)->setAutoSize(true);
                $worksheet
                        ->getColumnDimension($columnLetter)
                        ->setWidth(9);
            }

            $worksheet->setAutoFilter('A1:' . $highestColumn . ($numRows + 1));

//            $worksheet
//                    ->getStyle('D1:P' . $numRows)
//                    ->getNumberFormat()
//                    ->setFormatCode('hh:mm:ss');

            $query = 'select * from projekte where deleted != 1';
            $projects = $tze->get_Results($query);

            foreach ($projects as $project) {
                $query = "select maId as `Kürzel`, sNachname as Nachname, sVorname as Vorname, iArbeitszeit AS `Arbeitszeit Soll`, 
                         $dispoHeaders
                        from ma
                        left join (
                            select iUserID,
                            $dispoCodes
                            from ze_full
                            where date = ? and iProjekt = ? group by iUserID
                        ) zeiten on ( ma.userId = zeiten.iUserID)
                        WHERE deleted = 0 or deleted_date > ?
                        order by sNachname";

                $stmt = $tze->query($query, 'sis', $Date, $project["id"], $Date);

                $headers = $tze->fetch_headers($stmt);
                $rows = $tze->fetch_assoc($stmt);

                $worksheet = $objPHPExcel
                        ->createSheet()
                        ->setTitle($project["Projekt"])
                        ->fromArray($headers)
                        ->fromArray($rows, null, "A2");

                $highestColumn = $worksheet->getHighestColumn();
                $highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn); //e.g., 6


                $worksheet
                        ->getStyle('E2:' . $highestColumn . ($numRows + 1))
                        ->getNumberFormat()
                        ->setFormatCode('hh:mm:ss');

                $worksheet
                        ->getStyle('A1:' . $highestColumn . '1')
                        ->applyFromArray($firstRowStyle);

                $worksheet->getColumnDimension('A')->setAutoSize(true);
                $worksheet->getColumnDimension('B')->setAutoSize(true);
                $worksheet->getColumnDimension('C')->setAutoSize(true);
                $worksheet->getColumnDimension('D')->setWidth(4);

                for ($column = 4; $column < $highestColumnIndex; $column++) {
                    //columns are 0 indexed
                    $columnLetter = PHPExcel_Cell::stringFromColumnIndex($column);
                    //$objPHPExcel->getActiveSheet()->getColumnDimension($columnLetter)->setAutoSize(true);
                    $worksheet
                            ->getColumnDimension($columnLetter)
                            ->setWidth(9);
                }

                $worksheet->setAutoFilter('A1:' . $highestColumn . ($numRows + 1));
            }

            $objPHPExcel->setActiveSheetIndex(0);

            $DateiName = 'report_' . $Date . '.xlsx';

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
