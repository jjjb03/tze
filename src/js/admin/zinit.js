/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

$(document).ready(function () {
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        window.location.href = $(e.target).attr('href');

        /* Mitarbeiter Tabelle laden */
        if ($(e.target).attr('href') === "#mitarbeiter") {

            mitarbeiter.init();

            $('#mitarbeiter').jtable("load");

        } else if ($(e.relatedTarget).attr('href') === "#mitarbeiter") {
            $('#mitarbeiter').jtable("destroy");
        }

        /* Projekt-Tabelle laden */
        if ($(e.target).attr('href') === "#projekte") {
            projekte.init();
            $('#projekte').jtable("load");

        } else if ($(e.relatedTarget).attr('href') === "#projekte") {
            $('#projekte').jtable("destroy");
        }

        /* Zugriffsteuerung */
        if ($(e.target).attr('href') === "#zugriff") {
            $('#zugriff').jtable({
                title: "&nbsp;",
                fields: {
                    id: {key: true, list: false},
                    name: {title: "Name"},
                    ip_range: {title: "IP-Range"}
                },
                actions: {
                    listAction: function () {
                        return actionFunc("func/ip_range.php", "mode=admin&action=list");
                    },
                    updateAction: function (data) {
                        return actionFunc("func/ip_range.php", "mode=admin&action=update&" + data);
                    },
                    deleteAction: function (data) {
                        return actionFunc("func/ip_range.php", "mode=admin&action=delete&id=" + data.id);
                    },
                    createAction: function (data) {
                        return actionFunc("func/ip_range.php", "mode=admin&action=create&" + data);
                    }
                }
            }).jtable("load");
        } else if ($(e.relatedTarget).attr('href') === "#zugriff") {
            $('#zugriff').jtable("destroy");
        }

        /* Zeiterfassung */
        if ($(e.target).attr('href') === "#zeiterfassung") {

            /* Kalender */
            $('#datepicker').datepicker({dateFormat: "yy-mm-dd"})
                    .on("change", function () {
                        $('#jtable_ZE').jtable('load');
                    });

            /* Tabelle Mitarbeiter mit Untertabelle Zeiterfassung*/
            zeiterfassung.init();
                       
            $("#projekt-toggle").on("show.bs.collapse", function (e) {
                zeiterfassung.filter.init("#projekt-toggle");
            });

            $('#jtable_ZE').jtable("load");

        } else if ($(e.relatedTarget).attr('href') === "#zeiterfassung") {
            $('#jtable_ZE').jtable("destroy");
        }

        /* Tickets */
        if ($(e.target).attr('href') === "#tickets") {

            tickets.init("#jtable_Tickets", '#datepicker_tickets');

        } else if ($(e.relatedTarget).attr('href') === "#tickets") {
            tickets.destroy();
        }

        /* Dispocodes */
        if ($(e.target).attr('href') === "#dispocodes") {

            dispocodes.init("#dispocodes");

        } else if ($(e.relatedTarget).attr('href') === "#dispocodes") {
            dispocodes.destroy();
        }

    });

    
//  Bei Start der Seite direkt unterseite Aufrufen, sofern angegeben...
    var hashtag = $(location).attr('hash').split("/");
    if (hashtag[0] !== "") {
        try {
            $('a[href=' + hashtag[0] + ']').tab('show');
        }
        catch (err) {
            var Errorstring =
                    '<div class="alert alert-warning alert-dismissible">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Schließen"><span aria-hidden="true">&times;</span></button>' +
                    '<strong>Hinweis:</strong> Die Unterseite <span class="text-info">' + hashtag[0] + '</span> konnte nicht aufgerufen werden!' +
                    '</div>';
            $("#main").prepend(Errorstring);
        }
    }

//  Ladeanimation entfernen
    $(".m-app-loading").fadeOut(function () {
        $(".m-app-loading").remove();
    });
});