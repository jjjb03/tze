/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

/* global tze, bootbox, tickets */

var timetable = (function () {
    var me = {};
    var projektTimeout;
    me.loadTimes = function () {
        return $.get('func/times.php', function (data) {
            $("#AZ_Total").removeClass("clockme")
                    .text(data.AZ_Total.time).parent().addClass("disabled");
            $("#PZ_Total").removeClass("clockme")
                    .text(data.PZ_Total.time).parent().addClass("disabled");
            if (data.AZ_Total.clockme == "1") {
                $("#AZ_Total").addClass("clockme").parent().removeClass("disabled");
            }

            if (data.PZ_Total.clockme == "1") {
                $("#PZ_Total").addClass("clockme").parent().removeClass("disabled");
            }
        }, "json");
    };
    me.initTimetable = function () {
        // Zeiterfassung
        $("#timetable").jtable({
            title: "Zeiterfassung",
            fields: {
                id: {key: true, list: false},
                iProjekt: {list: false},
                Projekt: {
                    width: "50%",
                    title: "Projekt",
                    display: function (data) {
                        if (data.record.ListLabel !== "") {
                            return data.record.Projekt + ' - ' + data.record.ListLabel;
                        } else {
                            return data.record.Projekt;
                        }
                    }
                },
                iCat: {list: false},
                class: {list: false},
                ListLabel: {list: false},
                Time_Start: {
                    title: 'Anfang',
                    display: function (data) {
                        return data.record.Time_Start.substr(-8, 5);
                    }
                },
                Time_End: {
                    title: 'Ende',
                    display: function (data) {
                        return data.record.Time_End.substr(-8, 5);
                    }
                },
                Duration: {
                    title: 'Dauer',
                    display: function (data) {
                        var clockme = "";
                        if (data.record.Time_End === "0000-00-00 00:00:00") {
                            clockme = "clockme";
                        }
                        return '<time class="' + clockme + '">' + data.record.Duration.substr(-8) + '</time>';
                    }
                }
            },
            actions: {
                listAction: function () {
                    return $.Deferred(function ($dfd) {
                        $.ajax({
                            url: 'func/timetable.php', type: 'POST', dataType: 'json',
                            data: {"action": "getList"},
                            success: function (data) {
                                if (data.Result === "OK") {
                                    data.Records = data.Records || [];
                                    console.log('Recived Records: ' + data.Records.length);
                                    tickets.loadTickets(data.lastProj);
                                    me.projectButtons.set(data.lastProj);
                                    me.timeButtons.set(data.lastCat);
                                }
                                $dfd.resolve(data);
                            },
                            error: function () {
                                $dfd.reject();
                            }
                        });
                    });
                }
            }
        });
        this.loadTimetable();
    };
    me.loadTimetable = function () {
        $("#timetable").jtable('load');
    };
    me.timetableInsert = function (value) {
        $('#timetable').jtable('addRecord', {
            animationsEnabled: false,
            clientOnly: true,
            record: value
        });
    };
    me.timetableUpdate = function (value) {
        if ($("#timetable [data-record-key=" + value.id + "]").length > 0) {
            $('#timetable').jtable('updateRecord', {
                animationsEnabled: false,
                clientOnly: true,
                record: value
            });
        } else {
            me.timetableInsert(value);
        }
    };
    me.timeButtons = {
        /** @function
         * Speichert und aktiviert den Button 
         * @param {int} timeCat - Die id des Buttons.
         */
        set: function (timeCat) {
            // $("#buttons_projects").data("savedVal", undefined);
            $("#buttons_projects").removeData("savedVal");
            $("#buttons_times").data('timeCat', timeCat);
            return this.activate(timeCat);
            //console.log(activated);
        },
        /** @function
         * Aktiviert den Button 
         * @param {int} timeCat - Die id des Buttons.
         */
        activate: function (timeCat) {
            if (timeCat !== undefined && timeCat > 0) {
                this.enable();
                return $("#buttons_times").children("a").each(function () {
                    if ($(this).data("timeCat") === timeCat) {
                        $(this).addClass("active");
                    } else {
                        $(this).removeClass("active");
                    }
                });
            } else {
                me.projectButtons.set();
                this.disable();
            }
        },
        /** @function
         * Setzt alle Buttons zurück */
        reset: function () {
            return $("#buttons_times").children("a").removeClass("active");
        },
        /** @function
         * Aktiviert Buttons */
        enable: function () {
            return $("#buttons_times").children("a").removeClass("disabled");
        },
        /** @function
         * Deaktiviert Buttons */
        disable: function () {
            return $("#buttons_times").data('timeCat', undefined)
                    .children("a")
                    .addClass("disabled")
                    .removeClass("active");
//            $("#buttons_times a");
        },
        /** @function
         * Lädt Buttons */
        load: function () {
            return $.post("index.php", {action: "getTimes"}, function (data) {
                if (data.Result === "OK") {
                    var button_list = $('#buttons_times').empty();

                    $.each(data.Data, function () {
                        var button = $('<a href="#">' + this.ButtonLabel + '</a>')
                                .addClass(this.class)
                                .addClass("list-group-item")
                                .data('timeCat', this.id);

                        button_list.append(button);
                    });

                }
            }, "json");
        }
    };
    me.projectButtons = {
        set: function (projCat) {
            //console.log('Set Projekt: ' + projCat);
            // $("#buttons_projects").data("savedVal", undefined);
            $("#buttons_projects").removeData("savedVal");
            var activated = this.activate(projCat);
            //console.log(activated);
            return activated;
        },
        activate: function (projCat) {
            me.timeButtons.enable();
            return $("#buttons_projects").data('projCat', projCat)
                    .children("a").each(function () {
                if ($(this).data("projCat") === projCat) {
                    $(this).addClass("active");
                } else {
                    $(this).removeClass("active");
                }
            });
        },
        enable: function () {
            return $("#buttons_projects").children("a").removeClass("disabled");
        },
        disable: function () {
            return $("#buttons_projects").data('projCat', '0')
                    .children("a")
                    .addClass("disabled")
                    .removeClass("active");
        },
        reset: function () {
            return $("#buttons_projects").children("a").removeClass("active");
        },
        load: function () {
            return $.post("index.php", {action: "getProjects"}, function (data) {
                if (data.Result === "OK") {
                    $('#buttons_projects').empty();
                    $.each(data.Data, function () {
                        $('#buttons_projects').append('<a href="#">' + this.ButtonLabel + '</a>')
                                .children().last()
                                .addClass("list-group-item")
                                .data('projCat', this.id);
                    });
                }
            }, "json");
        }
    };
    me.init = function () {
        // Initialisieren
        var me = this;

        me.savedVal = $("#buttons_projects").data("savedVal");

        $.when(me.projectButtons.load(), me.timeButtons.load(), me.loadTimes()).then(function () {
            me.initTimetable();

            $(".m-app-loading").fadeOut(function () {
                $(".m-app-loading").remove();
            });
        });

        // Projektwahl
        $("#buttons_projects").on("click", "a:not(.disabled)", function (e) {
            e.preventDefault();

            // Timer zurück setzen
            clearTimeout(projektTimeout);
            // Werte einlesen
            var projCat = $(this).data("projCat");
            var projCatLast = $("#buttons_projects").data("projCat");
            var timeCatLast = $("#buttons_times").data('timeCat');
            var savedVal = $("#buttons_projects").data("savedVal");
            // Prüfen, ob Werte zwischengespeichert wurden
            if (savedVal === 0 || savedVal === undefined) {
                // Nein > Werte speichern
                $("#buttons_projects").data("savedVal", {
                    'projCat': projCatLast,
                    'timeCat': timeCatLast
                });
//                $(savedVal) = {
//                    projCat: projCatLast,
//                    timeCat: timeCatLast
//                };
            } else {
                // Ja > Werte lesen
                projCatLast = savedVal.projCat;
                timeCatLast = savedVal.timeCat;
            }

            if (projCat === projCatLast) {
                // Buttons setzen
                me.projectButtons.set(projCatLast);
                me.timeButtons.set(timeCatLast);
            } else {
                // Button setzen
                me.projectButtons.activate(projCat);
                me.timeButtons.reset();
                me.timeButtons.enable();
                // Timer setzen
                projektTimeout = setTimeout(function () {
                    me.projectButtons.set(projCatLast);
                    me.timeButtons.set(timeCatLast);
                    tickets.loadTickets(projCatLast);
                }, 7000);
            }

            // Tickets laden
            tickets.loadTickets(projCat);
        });
        // Zeitwahl
        $("#buttons_times").on("click", "a:not(.disabled)", function (e) {
            e.preventDefault();
            if ($("body").hasClass("modal-open")) {
                // Abbruch, falls bereits ein Dialog angezeigt wird...
                return;
            }

            // Timer zurück setzen
            clearTimeout(projektTimeout);
            // Werte einlesen
            var timeCat = $(this).data("timeCat");
            var timeCatLast = $("#buttons_times").data('timeCat');

            var projCat = $("#buttons_projects").data("projCat");
            var projCatLast = $("#buttons_projects").data("projCat");

            var savedVal = $("#buttons_projects").data("savedVal");

            // Prüfen, ob Werte zwischengespeichert wurden
            if (savedVal === undefined) {
                // Nein > Werte speichern
                $("#buttons_projects").data("savedVal", {
                    'projCat': projCatLast,
                    'timeCat': timeCatLast
                });
            } else {
                // Ja > Werte lesen
                projCatLast = savedVal.projCat;
                timeCatLast = savedVal.timeCat;
            }

            if (timeCat !== timeCatLast || projCat !== projCatLast) {
                clearTimeout(projektTimeout);
                var timeText = $(this).text();
                var projText = $("#buttons_projects a.active").text();
                var fragText = "Du wechselst auf " + projText + " - " + timeText + "!";
                me.dialogBox = bootbox.confirm({
                    message: fragText,
                    animate: false,
                    callback: function (antwort) {
                        if (antwort) {

                            var sendButton = $(".bootbox .modal-footer button");

                            // Ladeanimation
                            sendButton.addClass("disabled")
                                    .parent().prepend("<span class='wait text-muted'><span class='glyphicon glyphicon-refresh glyphicon-spin'></span>&nbsp;Senden...</span>&nbsp;");

                            sendStamp({
                                action: "TimeStamp",
                                ProjektID: projCat,
                                TimeClassID: timeCat
                            }, me.dialogBox, sendButton);

//                      Dialog wird durch Post Rückmeldung geschlossen.
                            return false;
                        } else {
                            me.projectButtons.set(projCatLast);
                            me.timeButtons.set(timeCatLast);
                            tickets.loadTickets(projCatLast);
                        }
                    }});
            }

            function sendStamp(postData, dialog, sendButton) {
                if ($.active > 0) {
                    $(document).one("ajaxStop", function () {
                        sendStamp(postData, dialog, sendButton);
                    });
                } else {
                    $.ajax({
                        url: "func/timetable.php",
                        method: "POST",
                        data: postData,
                        dataType: "json",
//                    beforeSend: function () {
//                        // Ladeanimation
//                        sendButton.addClass("disabled")
//                                .parent().prepend("<span class='wait text-muted'><span class='glyphicon glyphicon-refresh glyphicon-spin'></span>&nbsp;Senden...</span>&nbsp;");
//                    },
                        success: function (data) {
                            auswerten(data, dialog);
                        },
                        error: function () {
                            bootbox.error("Übertragung fehlgeschlagen!");
                        },
                        complete: function () {
                            //Ladeanimation entfernen...
                            sendButton.removeClass("disabled").siblings('span.wait').remove();
                        }
                    });
                }
            }

            function auswerten(Daten, dialog) {
//                tze.hideProcess();
                dialog.modal("hide");
                if (Daten.Result === "OK") {
                    $.each(Daten.Data, function () {
                        me.timetableUpdate(this);
                    });

                    me.loadTimes();

                    if (timeCat === 0) {
                        me.timeButtons.disable();
                        me.projectButtons.reset();
                    } else {
                        me.projectButtons.set(projCat);
                        me.timeButtons.set(timeCat);
                    }
                } else {
                    me.projectButtons.set(projCatLast);
                    me.timeButtons.set(timeCatLast);
                    tickets.loadTickets(projCatLast);
                    if (Daten.Message !== undefined) {
                        bootbox.alert({
                            title: "Fehler",
                            message: Daten.Message,
                            callback: function () {
                                if (Daten.Goto !== undefined) {
                                    window.location.href = Daten.Goto;
                                }
                            }
                        });
                    }
                }
            }
        });



    };
    return me;
})();