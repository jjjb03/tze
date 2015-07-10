/*! 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

/* global moment */

var tze;
tze = tze || (function ($) {
    var template = {
        process:
                '<div class="modal fade" data-backdrop="static">' +
                '   <div class="modal-dialog modal-sm">' +
                '       <div class="modal-content modal-body">' +
                '           <p class="text-center"></p>' +
                '           <div class="progress">' +
                '               <div class="progress-bar progress-bar-striped active" style="width: 100%"></div>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>',
        leavePage: '<div class="modal fade" data-backdrop="static"></div>',
        popOutScreen:
                '<style type="text/css">' +
                '    div.m-app-loading {' +
                '        position: absolute;' +
                '    }' +
                '    div.m-app-loading div.animated-container {' +
                '        background-color: #333333; ' +
                '        bottom: 0px; left: 0px; opacity: 1.0; ' +
                '        position: fixed; right: 0px; top: 0px; ' +
                '        z-index: 999999;' +
                '    }' +
                '    div.m-app-loading div.messaging {' +
                '        color: #FFFFFF; ' +
                '        font-family: monospace; ' +
                '        left: 0px; ' +
                '        margin-top: -37px; ' +
                '        position: absolute; ' +
                '        right: 0px; ' +
                '        text-align: center; ' +
                '        top: 50%;' +
                '    }' +
                '    div.m-app-loading h1 {' +
                '        font-size: 26px; ' +
                '        line-height: 35px; ' +
                '        margin: 0px 0px 20px 0px;' +
                '    }' +
                '    div.m-app-loading p {' +
                '        font-size: 18px; ' +
                '        line-height: 14px; ' +
                '        margin: 0px 0px 0px 0px;' +
                '    }' +
                '</style>' +
                '<div class="m-app-loading">' +
                '    <div class="animated-container">' +
                '        <div class="messaging">' +
                '            <p>Fenster kann jetzt geschlossen werden</p>' +
                '        </div>' +
                '    </div>' +
                '</div>'
    };

    var me = {};

    me.waitPopup = "";

    /**
     * Erstellt und Zeigt Wartefenster
     * @param {string} text Anzuzeigender Text
     * @returns {object} PopUp-Objekt
     */
    me.showProcess = function (text, nofade) {
        text = text || "Verarbeite...";
        nofade = nofade || false;

        var dialog = $(template.process);
        this.waitPopup = dialog;

        if (nofade) {
            dialog.removeClass("fade");
        } else {
            dialog.addClass("fade");
        }

        dialog.modal('show').find("p").text(text);

        return dialog;
    };

    /**
     * Blendet Wartefenster aus und entfernt es anschließend.
     * @param {Object} popup Popup-Object.
     * @param {bool} nofade Ausblend-Animation unterdrücken
     */
    me.hideProcess = function (popup, nofade) {
        popup = popup || this.waitPopup;
        nofade = nofade || false;

        if (nofade) {
            popup.removeClass('fade').modal('hide');
        } else {
            popup.addClass('fade').modal('hide');
        }

        popup.on("hidden.bs.modal", function () {
            popup.remove();
        });
    };

    /**
     * Gibt Wert aus URL-Data zurück
     * @param {String} variable Angeforderter Wert.
     * @returns {String|Boolean}
     */
    me.urlData = function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        return(false);
    };

    me.isPoppedOut = function () {
        return this.urlData("popout");
    };

    /**
     * Blendet Fenster 
     */
    me.leavePage = function () {
        this.
                $(template.leavePage).modal('show');
    };

    me.popOut = function () {
        window.open(document.location.href + "?popout=true", "", "resizable=1,location=0,menubar=0,status=0,toolbar=0,scrollbars=1,width=320px,height=720px");
        $('body').prepend(template.popOutScreen);
    };

    return me;
})(jQuery);


$(document).ready(function () {

    bootbox.setLocale('de');

    if (tze.isPoppedOut()) {
        $('#popout').remove();
    }
    $('nav').on('click', '#popout', function () {
        tze.popOut();
    });

    $(window).on("beforeunload", function () {
        tze.showProcess('Seite wird geladen...');
    });

    /* Sekundentimer für Zeitanzeige */
    var iIntervall = 1000;
    setInterval(function () {
        $("body").find('.clockme').each(function (ele) {
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
            
            var oldTime = $(this).text();
            var timeFormat = "hh:mm:ss";
            var newtime = moment(oldTime, timeFormat).add(iIntervall, "ms").format(timeFormat);
            $(this).text(newtime);
        });
    }, iIntervall);
});