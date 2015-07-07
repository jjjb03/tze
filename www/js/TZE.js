/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */


/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

/* global bootbox */

var tickets = (function ($) {
    var me = {};
    var template = {
        'prompt': '<form class="form-horizontal"></form>',
        'formgroup': '<div class="form-group"></div>',
        'label': '<label class="col-sm-4 control-label"></label>',
        'input': '<div class="col-sm-8"><input class="bootbox-input bootbox-input-number form-control" autocomplete=off /></div>',
        'inputgroupbtn': '<span class="input-group-btn"></span>',
        'button1': '<button class="btn btn-default" tabindex="-1" data-step="1" type="button">+1</button>',
        'button5': '<button class="btn btn-default" tabindex="-1" data-step="5" type="button">+5</button>',
        'button10': '<button class="btn btn-default" tabindex="-1" data-step="10" type="button">+10</button>'
    };

    /**
     * Hängt ein neues Input an "form" an 
     * @param {jQuery Object} form Element, an welches das Input angehängt wird
     * @param {string} inputName Name des Input Elements
     * @param {string} label Beschriftung
     * @param {string} inputType Art des Inputfeldes
     * @returns {jQuery Object} Gibt Input Feld zurück
     */
    function addInput(form, inputName, label, inputType) {
        // create formgroup
        var formGroup = form.append(template.formgroup).children().last();

        // append Label to formgroup
        formGroup.append(template.label).children().last().prop({'for': inputName, 'textContent': label + ':'});

        // append input to formgroup
        formGroup.append(template.input).find('input').prop({'id': inputName, 'type': inputType});

        return formGroup.find('input');
    }


    function addInputSteps(input) {
        var inputGroup = input.wrapAll('<div class="input-group"></div>').parent();
        inputGroup.prepend(template.inputgroupbtn);
        inputGroup.children().first().append(template.button10 + template.button5 + template.button1);
    }

    /** @function hängt eine 'Badge' an übergebenes Element an
     * @param {object} element jQuery Objekt, in welches Badge eingefügt wird
     * @param {string} name Name des einzufügenden Elements
     * @param {string} value Wert, welcher angezeigt wird
     */
    function addBadge(element, name, value, appendText) {
        if (value > 0) {
            var title = (appendText !== undefined) ? value + ' ' + appendText : value;
            //title = (appendText !== undefined) ? ' ' + appendText : '';

            if (element.text().length > 0) {
                element.append(" | ");
            }
            element.show().append('<span class="' + name + '">' + title + '</span>');
        } else {
            element.append('<span name="' + name + '"></span>');
        }
    }

    function addDataTitle(element, name, value, preText) {
        var regex = new RegExp('<div name="' + name + '".*?</div>', "gi");
        var old_title = $(element).data("title").replace(regex, '');

        $(element).tooltip('destroy');

        //$("<div>" + old_title + "</div>").children("span[name=" + name + "]").remove();
        if (value > 0) {
            var title = (preText !== undefined) ?
                    '<div name="' + name + '" class="text-left">' + preText + ':&nbsp;<span class="">' + value + '</span><br></div>' :
                    '<div name="' + name + '"><span>' + value + '</span></div>';

            $(element).data("title", title + old_title);

        } else {
            $(element).data("title", old_title);
        }
    }

    me.loadTickets = function (projektId) {
        if (projektId !== null) {
            // Alle Key-Shortcuts löschen
            $(document).off("keydown");

            var tickets = $("#Tickets");
            tickets.children().addClass("disabled");

            var header = tickets.siblings(".panel-heading");

            // Ladeanimation
            // ToDo: Animation für alte Browser 'reparieren'
            $("<span class='badge badge-primary'><span class='glyphicon glyphicon-refresh glyphicon-spin'></span></span>").appendTo(header);

            $.post('func/tickets.php', {"action": "list", "projektId": projektId}, function (data) {
                // Ladeanimation entfernen
                header.children().fadeOut("fast", function () {
                    header.children().remove();
                });
                if (data.Result === "OK") {
                    $("#Tickets").empty();
                    if (data.data !== null) {
                        $.each(data.data, function (index, value) {
//                            var label_text;
                            var ticketId = 'ticketId_' + value.ticketId;
                            var button = $('<a href="#" id="' + ticketId + '" ' +
                                    'class="list-group-item">' + value.ticketName + '</a>');

                            // Daten im Button speichern...
                            button.data({
                                ticket: value,
                                html: true,
                                toggle: "tooltip",
                                placement: "top",
                                delay: {"show": 500, "hide": 100}
                            });

                            if (value.shortcut !== null) {
                                button.data({
                                    title: '<div class="text-left">Tastenkürzel:&nbsp;<span class="">' + value.shortcut + '</span></div>'
                                });

                                // Key-Shortcut setzen
                                $(document).on("keydown", function (event) {
                                    var keyPressed = (event.key.length === 1) ?
                                            event.key.toUpperCase() :
                                            String.fromCharCode(event.keyCode);

                                    if (keyPressed === value.shortcut.toUpperCase()) {
                                        if (!$('.bootbox').length) {
                                            event.preventDefault();
                                            button.click();
                                        }
                                    }
                                });
                            }

                            var label = $('<span class="badge badge-default absolute-right-15 nonOpaqueOnHover"></span>').hide().appendTo(button);

                            if (value.durationSwitch > 1) {
                                addBadge(label, "duration", value.duration, 'Min.');
                            }

                            if (value.counterSwitch > 1) {
                                addDataTitle(button, "counter", value.counter, value.counterName);
                            }

                            if (value.tickets !== null) {
                                addBadge(label, "tickets", value.tickets);
                            }

                            button.tooltip().appendTo("#Tickets");
                        });
                    }
                }
            }, "json");
        }
    };

    me.updateTicket = function (ticketButton, inputElements, dialogBox) {

        var ticketData = ticketButton.data("ticket");
        var ticketId = ticketData.ticketId;
        var badge = ticketButton.children("span.badge");

        // Ladeanimation
        // badge.html("<span class='glyphicon glyphicon-refresh glyphicon-spin'></span>");

        var sendButton = $(".bootbox .btn-primary");
        var sendButtonOld = sendButton.html();

        var postData = {"action": "new", "ticketId": ticketId};

        $.each(inputElements, function () {
            if ($(this).prop("type") === "checkbox") {
                postData[this.id] = !this.checked;
            } else if (this.value) {
                postData[this.id] = this.value;
            }
        });

        $.ajax({
            url: "func/tickets.php",
            method: "POST",
            data: postData,
            dataType: "json",
            async: "false",
            beforeSend: function () {
                sendButton.addClass("disabled").parent().prepend("<span class='wait text-muted'><span class='glyphicon glyphicon-refresh glyphicon-spin'></span>&nbsp;Senden...</span>&nbsp;");
            },
            success: function (data) {
                sendButton.removeClass("disabled").siblings('span.wait').remove();
                if (data.Result === "OK") {

//                    ticketButton.tooltip("destroy");

                    // neu Daten hinzufügen
                    $.extend(ticketButton.data("ticket"), data.data);
                    ticketButton.tooltip('destroy');

                    badge.empty();

                    if (ticketData.durationSwitch > 1) {
                        addBadge(badge, "duration", ticketData.duration, 'Min.');
                    }

                    if (ticketData.counterSwitch > 1) {
                        addDataTitle(ticketButton, "counter", ticketData.counter, ticketData.counterName);
                    }

                    if (ticketData.tickets !== null) {
                        addBadge(badge, "tickets", ticketData.tickets);
                    }

                    dialogBox.modal("hide");

                    setTimeout(function () {
                        ticketButton.tooltip();
                    }, 500);

                } else if (data.Result === "ERROR") {

                    inputElements.each(function () {
                        if (this.id === data.errorIn) {
                            $(this).data({
                                animation: false,
                                content: data.Message,
                                trigger: 'manual',
                                container: 'body',
                                toggle: "popover"
                            }).popover('show');
                        }
                    });
                }
            },
            error: function () {
                bootbox.error("Übertragung fehlgeschlagen!");
            }
        });

        return false;
    };

    me.init = function () {
        $(document).on("click", "button[data-step]", function () {
            var ele = this;
            var step = $(ele).data("step");
            var input = $(ele).closest(".input-group").children('input');
            input[0].value = Number(input[0].value) + step;
        });

        $("#Tickets").on("click", "a:not(.disabled)", function () {
            var ticketButton = $(this);
            var ticket = ticketButton.data("ticket");
            var ticketprompt = $(template.prompt);


            if (ticket.ticketNumberSwitch > 1) {
                var ticketNumber = addInput(ticketprompt, "ticketNumber", "Ticketnummer", "number");
                if (ticket.ticketNumberSwitch > 2) {
                    ticketNumber.prop({'required': true});
                }
            }

            if (ticket.counterSwitch > 1) {
                var counter = addInput(ticketprompt, "counter", ticket.counterName, "number");
                counter.prop({"autofocus": true});
                addInputSteps(counter);
                if (ticket.counterSwitch > 2) {
                    counter.prop({'required': true});
                }
            }

            if (ticket.durationSwitch > 1) {
                var duration = addInput(ticketprompt, "duration", "Dauer", "number");
                addInputSteps(duration);
                if (ticket.counterSwitch > 2) {
                    duration.prop({'required': true});
                }
            }

            if (ticket.undoneSwitch > 0) {
                // Achtung - Checkbox wird invertiert
                addInput(ticketprompt, "undone", "Abgeschlossen", "checkbox");
            }
            
            $(document).one("shown.bs.modal", function () {
                // workarround, 'cause bootbox autofocus on ok-button
                var autofocus_elem = $(".bootbox").find("input[autofocus]");
                autofocus_elem.first().focus();
            });

            me.dialogBox = bootbox.confirm({
                title: 'Neues Ticket [' + ticket.ticketName + ']',
                animate: false,
//                backdrop: null,
                message: ticketprompt,
                callback: function (result) {
                    $('.popover').popover('destroy');
                    if (result) {
                        ticketButton.tooltip('hide');

                        var cancel = false;
                        var inputs = $(this).find("input");

                        inputs.each(function () {
                            if (this.required) {
                                if (!this.value) {
                                    $(this).data({
                                        animation: false,
                                        content: 'Angabe fehlt!',
                                        trigger: 'manual',
                                        container: 'body',
                                        toggle: "popover"
                                    }).popover('show');
                                    cancel = true;
                                }
                            }
                        });

                        if (!cancel) {
                            me.updateTicket(ticketButton, inputs, me.dialogBox);
                        }

                        // Dialog wird durch Post-Rückmeldung geschlossen!
                        return false;
                    }
                }
            });

            $(me.dialogBox).on("keydown", function (event) {

                var keyPressed = event.which || event.keyCode;

                if (ticket.counterSwitch > 1) {
                    // 107 = Plus NumPad 
                    // 187 = Plus
                    if (keyPressed === 107 || keyPressed === 187) {
                        event.preventDefault();
                        var counter = $('#counter');
                        var newval = counter.val();
                        newval++;
                        counter.val(newval);
                    }
                }

                // 13 = Enter 
                if (keyPressed === 13) {
                    event.preventDefault();
                    $(this).find(".btn-primary:not(.disabled)").click();
                }
            });
        });
    };

    return me;
})(jQuery);/* 
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
})();/* 
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