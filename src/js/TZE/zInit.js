/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

/* global bootbox */

$(document).ready(function () {
    timetable.init();
    tickets.init();

//    /* Sekundentimer für Zeitanzeige */
//    var iIntervall = 1000;
//    setInterval(function () {
//        $("body").find('.clockme').each(function (ele) {
//            //var Zeit = new Date("1 1, 1970 " + $(this).text());
//            //var Zeit = new Date("1970-01-01T"+$("#PZ_Total").text()); console.log(d);
//            
//            //var Zeit = new Date("Thu Jan 01 1970 " + $(this).text());
//            
//            var Zeit = new Date();
//            var ZeitArray = $(this).text().split(":");
//            
//            Zeit.setHours(ZeitArray[0], ZeitArray[1], ZeitArray[2]);
//            
//            var Zeitneu = new Date(Zeit.getTime() + iIntervall);
//            //Zeitneu.toLocaleTimeString();
//
////            $(this).text(Zeitneu.toLocaleTimeString());
//            function appendZero(num) {
//                if (num < 10)
//                {
//                    return "0" + num;
//                }
//                else {
//                    return num;
//                }
//            }
//
//            var Stunden = Zeitneu.getHours();
//            var Minuten = Zeitneu.getMinutes();
//            var Sekunden = Zeitneu.getSeconds();
//
//            var Zeit_String = appendZero(Stunden) + ":" + appendZero(Minuten) + ":" + appendZero(Sekunden);
//            $(this).text(Zeit_String);
//        });
//    }, iIntervall);

//    $(".m-app-loading").fadeOut(function () {
//        $(".m-app-loading").remove();
//    });

});