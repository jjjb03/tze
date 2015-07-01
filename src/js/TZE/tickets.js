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
})(jQuery);