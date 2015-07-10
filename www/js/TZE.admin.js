/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */


var dispocodes = function ($) {
    var me = {};

    me.init = function (jTableID) {
        this.jtable = $(jTableID);
        var jtable = this.jtable;

        jtable.jtable({
            title: "&nbsp;",
            sorting: true,
            fields: {
                id: {key: true, list: false},
                code: {title: "Nummer"},
                ListLabel: {title: "Name für Liste"},
                ButtonLabel: {title: "Name für Button"},
                class: {title: "Klasse"},
                position: {list: false, title: "Rangfolge"},
                usual: {list: false, title: "Gruppe", type: "combobox", options: {1: 'Übliche Liste', 0: 'Versteckte Liste'}}
            },
            actions:{
                listAction: function (nothing, jtParams) {
                    return actionFunc('func/dispocodes.php', 'mode=admin&action=list&', jtParams);
                },
                createAction: function (postData) {
                    return actionFunc('func/dispocodes.php', 'mode=admin&action=insert&' + postData);
                },
                updateAction: function (postData) {
                    return actionFunc('func/dispocodes.php', 'mode=admin&action=update&' + postData);
                },
                deleteAction: function (postData) {
                    return actionFunc('func/dispocodes.php', 'mode=admin&action=delete&id=' + postData.id);
                }                
            }
        }).jtable('load');
    };
    
    me.destroy = function() {
        this.jtable.jtable('destroy');
        delete this.jtable;
    };

    return me;
}(jQuery);/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

/** 
 * @function getOptions
 * @param {URL} urlString Adresse, von welcher Optionen geladen werden
 * @param {String} dataString Daten, welche per POST übertragen werden
 * */
function getOptions(urlString, dataString) {
    var options = [];
    $.ajax({
        url: urlString, type: 'POST', dataType: 'json', async: false,
        data: dataString,
        success: function (data) {
            options = data.Options;
        }
    });
    return options;
}

/**
 * @typedef {object} KeyElemPairs
 * @property {string} key Name of key
 * @property {string} element jQuery Selector, where key gets attached, if key is defined in server response
 */

/** 
 * @function actionFunc
 * @param {URL} urlString Adresse, von welcher Records geladen werden
 * @param {String} dataString Daten, welche per POST übertragen werden
 * @param {jTable-Data} jTableData jTable Daten für Sortierung und Seitenanzeige
 * @param {jTable-PostData} jTablePostData Sonstige Post Daten, welche Übertragen werden sollen
 * @param {...KeyElemPairs} processData if "foo" is defined in server response, value of foo gets attached to "#bar" as "foo"
 * 
 **/
function actionFunc(urlString, dataString, jTableData, jTablePostData, processData) {

    $.each([jTableData, jTablePostData], function (i, el) {
        if (el !== undefined) {
            var addData = $.param(el);
            if (addData.length > 0) {
                dataString += "&" + addData;
            }
        }
    });

    function saveData(recData, processData) {
        if (processData !== undefined) {
            $.each(processData, function (key, element) {
//            key: "last", element: last
                $.each(recData, function (name, value) {
                    if (name === element.key) {
                        $(element.element).data(name, value);
                    }
                });
            });
        }
    }

    return $.Deferred(function ($dfd) {
        $.ajax({
            url: urlString,
            type: 'POST',
            dataType: 'json',
            data: dataString,
            success: function (data) {
                saveData(data, processData);
                $dfd.resolve(data);
            },
            error: function () {
                $dfd.reject();
            }
        });
    });
}/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */


var mitarbeiter = (function ($) {
    var me = {};

    me.init = function () {

        me.table = $('#mitarbeiter');
        me.table.jtable({
            title: '&nbsp;',
            sorting: true,
            defaultSorting: 'sNachname ASC',
            paging: true,
            pageSizes: [10, 20, 50, 100],
            pageSize: 20,
//            selecting: true,
//            selectingCheckboxes: true,
//            multiselect: true,
            actions: {
                listAction: function (postData, jtParams) {
                    return actionFunc('func/mitarbeiter.php', 'mode=admin&action=list&', jtParams, postData);
                },
                createAction: function (postData) {
                    return actionFunc('func/mitarbeiter.php', 'mode=admin&action=insert&' + postData);
                },
                updateAction: function (postData) {
                    return actionFunc('func/mitarbeiter.php', 'mode=admin&action=update&' + postData);
                },
                deleteAction: function (postData) {
                    return actionFunc('func/mitarbeiter.php', 'mode=admin&action=delete&userId=' + postData.userId);
                }
            },
            fields: {
                userId: {key: true, list: false},
                maId: {title: "Kürzel", inputClass: 'validate[required]'},
                sVorname: {title: "Vorname", inputClass: 'validate[required]'},
                sNachname: {title: "Nachname", inputClass: 'validate[required]'},
                sLogin: {title: "Login", inputClass: 'validate[required]'},
                sMail: {title: "E-Mail", inputClass: 'validate[required]'},
                iArbeitszeit: {title: "AZ", inputClass: 'validate[required]'},
                bZeitarbeiter: {title: "Leih-A.", type: "combobox", options: {0: 'Nein', 1: 'Ja'}},
                bLogin_Allowed: {title: "Freig.", type: "combobox", options: {0: 'Nein', 1: 'Ja'}},
                iAdmin: {title: "Zugriff", type: "combobox", options: {0: 'Nutzer', 1: 'Admin'}},
                sPassword_hash: {title: "Passwort", list: false, create: false, type: "checkbox", values: {"": "keine Änderung", "neuespw": "Neues Passwort vergeben"}},
                bForce_Update_PW: {create: false, list: false, title: "Muss neues Passwort erstellen?", type: "checkbox", values: {0: 'Nein', 1: 'Ja'}}
            },
            //Initialize validation logic when a form is created
            formCreated: function (event, data) {
                //data.form.validationEngine();
            },
            //Validate form when it is being submitted
            formSubmitting: function (event, data) {
                //return data.form.validationEngine('validate');
            },
            //Dispose validation logic when form is closed
            formClosed: function (event, data) {
//                data.form.validationEngine('hide');
//                data.form.validationEngine('detach');
            },
            recordUpdated: function (event, data) {
                if (typeof (data.serverResponse.Password) !== "undefined") {
                    var mailTemplate = "Hallo " + data.record.sVorname + ",\n\n" +
                            "hiermit erhältst du dein Login für unsere Zeiterfassung:\n\n" +
                            "Login:\n" +
                            data.record.sLogin + "\n\n" +
                            "Passwort:\n" +
                            data.serverResponse.Password + "\n\n" +
                            "Die Zeiterfassung erreichst du unter folgender Adresse:\n" +
                            "https://" + window.location.hostname + "/\n\n" +
                            "Bitte beachte, dass die Seite erst ab Version 10 des Internet Explorers " +
                            "korrekt angezeigt wird, eventuell musst du also einen anderen Browser verwenden.";

                    var mailbody = encodeURI(mailTemplate);
                    var mailsubject = encodeURI("Login für Zeiterfassung");

                    bootbox.alert({
                        title: "Neuer Passwort",
                        message: '<p>Für ' + data.record.sVorname + ' ' + data.record.sNachname + ' wurde ein neues Passwort erstellt.</p>' +
                                '<div class="alert alert-info">' +
                                '<strong>Hinweis:</strong> Passwort muss beim nächsten Login geändert werden!' +
                                '</div>' +
                                '<div class="form-group">' +
                                '<label>Login</label>' +
                                '<pre>' + data.record.sLogin + '</pre>' +
                                '</div>' +
                                '<div class="form-group">' +
                                '<label>Passwort</label>' +
                                '<pre>' + data.serverResponse.Password + '</pre>' +
                                '</div>' +
                                '<p><a href="mailto:' + data.record.sMail + '?subject=' + mailsubject + '&body=' + mailbody + '" target="_blank">Per E-Mail versenden</a></p>'
                    });
                }
            },
            recordAdded: function (event, data) {

                var mailTemplate = "Hallo " + data.record.sVorname + ",\n\n" +
                        "hiermit erhältst du dein Login für unsere Zeiterfassung:\n\n" +
                        "Login:\n" +
                        data.record.sLogin + "\n\n" +
                        "Passwort:\n" +
                        data.serverResponse.Password + "\n\n" +
                        "Die Zeiterfassung erreichst du unter folgender Adresse:\n" +
                        "https://" + window.location.hostname + "/\n\n" +
                        "Bitte beachte, dass die Seite erst ab Version 10 des Internet Explorers " +
                        "korrekt angezeigt wird, eventuell musst du also einen anderen Browser verwenden.";

                var mailbody = encodeURI(mailTemplate);
                var mailsubject = encodeURI("Login für Zeiterfassung");

                bootbox.alert({
                    title: "Neuer Mitarbeiter",
                    message: '<p>Das Login für ' + data.record.sVorname + ' ' + data.record.sNachname + ' wurde erstellt.</p>' +
                            '<div class="alert alert-info">' +
                            '<strong>Hinweis:</strong> Passwort muss beim nächsten Login geändert werden!' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label>Login</label>' +
                            '<pre>' + data.record.sLogin + '</pre>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label>Passwort</label>' +
                            '<pre>' + data.serverResponse.Password + '</pre>' +
                            '</div>' +
                            '<p><a href="mailto:' + data.record.sMail + '?subject=' + mailsubject + '&body=' + mailbody + '" target="_blank">Per E-Mail versenden</a></p>'
                });
            },
            toolbar: {
                items: [{
                        // Feld für Namenssuche
                        text: 'Filter: <input id="nameFilter" name="nameFilter" style="width: 6em; margin: -5px 0px; border: none;" type="text" />'
                    }, {
                        text: '<span name="undelete">gelöschte Mitarbeiter<span>'
                    }]
            }
        });

        $('#mitarbeiter').on('keydown', 'input[name="nameFilter"]', function () {
            if (me.updateTimer !== undefined) {
                clearTimeout(me.updateTimer);
            }

            var $filter = $(this);

            // kurz warten, um nicht bei jedem Tastendruch ne zu suchen...
            me.updateTimer = setTimeout(function () {
                delete me.updateTimer;
                me.table.jtable("load", {nameFilter: $filter.val()});
            }, 400);
        });

        $('#mitarbeiter').on('click', 'span[name="undelete"]', function () {
            // Ladeanimation
            var popup = tze.showProcess();

            $.post('func/mitarbeiter.php', {mode: "admin", action: "list-deleted"}, function (data) {

                //Ladeanimation ausblenden
                tze.hideProcess(popup, true);

                if (data.Result === "OK") {
                    var ddMenu = $('<select name="undelSelection" class="form-control"></select>');
                    var ddDiv = $('<div class="col-sm-8"></div>').append(ddMenu);

                    // Form-group erstellen
                    var formGroup = $('<div class="form-group"></div>')
                            .append("<div class='col-sm-4 control-label'>Gelöschte Mitarbeiter</div>")
                            .append(ddDiv);

                    var Message = $('<form class="form-horizontal"></form>')
                            .append(formGroup);

                    // unsichtbaren Eintrag einfügen
                    ddMenu.append('<option style="display: none;">bitte auswählen</option>');

                    // gelöschte MA einfügen
                    $.each(data.Records, function () {
                        ddMenu.append('<option value="' + this.userId + '">' + this.name + '</option>');
                    });


                    bootbox.confirm({
                        title: "Mitarbeiter wiederherstellen",
                        message: Message,
                        closeButton: false,
                        animate: false,
                        backdrop: true,
                        callback: function (confirmed) {
                            if (confirmed) {
                                var auswahl = $('select[name="undelSelection"]').val();
                                if (auswahl !== "") {
                                    $.post("func/mitarbeiter.php", {mode: "admin", action: "undelete", userId: auswahl}, function (data) {
                                        if (data.Result === "OK") {
                                            me.table.jtable('reload');
                                        } else if (data.Message !== undefined) {
                                            bootbox.alert(data.Message);
                                        }
                                    }, "json");
                                }
                            }
                        }
                    });

                } else if (data.Message !== undefined) {
                    bootbox.alert(data.Result);
                }
            }, "json");
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

var projekte = (function ($) {
    var me = {};
    
    me.init = function () {
         $('#projekte').jtable({
                openChildAsAccordion: true,
                title: "&nbsp;",
                fields: {
                    id: {key: true, list: false},
                    Projekt: {title: "Projekte"},
                    MA: {
                        create: false,
                        edit: false,
                        display: function (data) {
                            var projekt = $('<button style="width: 100%">zugeordnete Mitarbeiter</button>');
                            projekt.on("click", function () {
                                $('#projekte').jtable('openChildTable',
                                        projekt.closest('tr'), //Parent row
                                        {
                                            title: data.record.Projekt + " - zugeordnete Mitarbeiter",
                                            fields: {
                                                iUser: {
                                                    key: true,
                                                    list: false,
                                                    title: "Mitarbeiter",
                                                    create: true,
                                                    options: getOptions('func/projekte.php', 'mode=admin&action=projekt-get-users-detached&id=' + data.record.id)
                                                },
                                                sVorname: {title: "Vorname", create: false},
                                                sNachname: {title: "Nachname", create: false},
                                                sLogin: {title: "Login", create: false}
                                            },
                                            actions: {
                                                listAction: function () {
                                                    return actionFunc('func/projekte.php', 'mode=admin&action=projekt-get-users-attached&id=' + data.record.id);
                                                },
                                                createAction: function (addData) {
                                                    return actionFunc("func/projekte.php", 'mode=admin&action=projekt-add-user&data=json&id=' + data.record.id + '&' + addData);
                                                },
                                                deleteAction: function (delData) {
                                                    return actionFunc("func/projekte.php", 'mode=admin&action=projekt-del-user&data=json&id=' + data.record.id + '&iUser=' + delData.iUser);
                                                }
                                            }
                                        },
                                function (data) { //opened handler
                                    data.childTable.jtable('load');
                                }
                                );
                            });
                            return projekt;
                        }
                    },
                    Tickets: {
                        create: false,
                        edit: false,
                        display: function (data) {
                            var tickets = $('<button style="width: 100%">Ticketarten</button>');
                            tickets.on("click", function () {
                                $('#projekte').jtable('openChildTable',
                                        tickets.closest('tr'), // Parent row
                                        {
                                            title: data.record.Projekt + " - Ticketarten",
                                            fields: {
                                                ticketId: {key: true, list: false},
                                                ticketName: {title: "Name"},
                                                undoneSwitch: {
                                                    title: "Abschluss",
                                                    options: {
                                                        '0': 'Immer',
                                                        '1': 'Wählbar'
                                                    }
                                                },
                                                ticketNumberSwitch: {
                                                    title: "Ticketnummer",
                                                    options: {
                                                        '1': 'keine',
                                                        '2': 'Optional',
                                                        '3': 'Erforderlich'
                                                    }
                                                },
                                                counterSwitch: {
                                                    title: "Anzahl",
                                                    options: {
                                                        '1': 'keine',
                                                        '2': 'Optional',
                                                        '3': 'Erforderlich'
                                                    }
                                                },
                                                counterName: {
                                                    title: "Name für Anzahl"
                                                },
                                                durationSwitch: {
                                                    title: "Dauer",
                                                    options: {
                                                        '1': 'keine',
                                                        '2': 'Optional',
                                                        '3': 'Erforderlich'
                                                    }
                                                },
                                                shortcut: {
                                                    title: "Taste"
                                                },
                                                charge_ticket: {
                                                    title: "€/Ticket"
                                                },
                                                charge_counter: {
                                                    title: "€/Anzahl"
                                                },
                                                charge_duration: {
                                                    title: "€/Minute"
                                                }
                                            },
                                            actions: {
                                                listAction: function () {
                                                    return actionFunc('func/projekte.php', 'mode=admin&action=projekt-ticket-list&projektId=' + data.record.id);
                                                },
                                                createAction: function (addData) {
                                                    return actionFunc("func/projekte.php", 'mode=admin&action=projekt-ticket-create&projektId=' + data.record.id + '&' + addData);
                                                },
                                                updateAction: function (updateData) {
                                                    return actionFunc("func/projekte.php", 'mode=admin&action=projekt-ticket-update&projektId=' + data.record.id + '&' + updateData);
                                                },
                                                deleteAction: function (delData) {
                                                    return actionFunc("func/projekte.php", 'mode=admin&action=projekt-ticket-delete&projektId=' + data.record.id + '&ticketId=' + delData.ticketId);
                                                }
                                            }
                                        },
                                function (data) { //opened handler
                                    data.childTable.jtable('load');
                                }
                                );
                            });
                            return tickets;
                        }
                    }
                },
                actions: {
                    listAction: function () {
                        return actionFunc("func/projekte.php", "mode=admin&action=projekt-list");
                    },
                    updateAction: function (data) {
                        return actionFunc("func/projekte.php", "mode=admin&action=projekt-set-name&" + data);
                    },
                    deleteAction: function (data) {
                        return actionFunc("func/projekte.php", "mode=admin&action=projekt-delete&id=" + data.id);
                    },
                    createAction: function (data) {
                        return actionFunc("func/projekte.php", "mode=admin&action=projekt-create&" + data);
                    }
                }
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


var tickets = function ($) {
    var me = {};

    me.filter = {};

    me.init = function (init_jtable, init_datepicker) {

        this.$jtable = $(init_jtable);
        this.$datepicker = $(init_datepicker);

        var $jtable = this.$jtable;
        var $datepicker = this.$datepicker;

        $datepicker.datepicker({dateFormat: "yy-mm-dd"})
                .on("change", function () {
                    $.extend(me.filter, {Date: $(this).val()});
                    $jtable.jtable('load', me.filter);
                });

        $jtable.jtable({
            title: "&nbsp;",
            fields: {
                id: {key: true, list: false},
                Projekt: {title: "Projekt", width: "30%"},
                Tickets: {title: "Zusammenfassung", width: "43%", display: function (data) {
                        var charge_tickets = data.record.charge_tickets;
                        var tickets = data.record.done_tickets;
                        var count = data.record.sum_counter;
                        var duration = data.record.sum_duration;
                        return "Tickets: " + charge_tickets + " (Gesamt: " + tickets + ", Einheiten: " + count + ", Zeit: " + duration + ")";
                    }},
                perMA: {title: "", width: "12%", display: function (data) {
                        var buttonPerMA = $("<button>per MA</button>");
                        buttonPerMA.on("click", function () {
                            me.childperMA(buttonPerMA, data.record);
                        });
                        return buttonPerMA;
                    }},
                perTA: {title: "", width: "15%", display: function (data) {
                        var ButtonPerTA = $("<button>per Ticket</button>");
                        ButtonPerTA.on("click", function () {
                            me.childperTA(ButtonPerTA, data.record);
                        });
                        return ButtonPerTA;
                    }}
            },
            actions: {
                listAction: function (data, jtdata) {
                    return actionFunc("func/tickets.php", "mode=admin&action=list", jtdata, data);
                }
            },
            toolbar: {items: [{
                        text: '<div><span class="glyphicon glyphicon-refresh"></span> Aktualisieren</div>',
                        click: function () {
                            $jtable.jtable("reload");
                        }
                    }, {
                        text: '<div><span class="glyphicon glyphicon-download-alt"></span> Excel-Report</div>',
                        click: function () {
                            me.Report($datepicker.val());
                        }
                    }] //Array of your custom toolbar items.
            }
        }).jtable('load');
    };

    me.Report = function (date) {
        tze.showProcess();
        $.ajax({
            url: "func/report_tickets.php",
            data: {Date: date, mode: "admin"},
            type: "POST",
            dataType: 'binary',
            success: function (blob, status, xhr) {
                var filename = xhr.getResponseHeader("Content-Disposition").replace("attachment;filename=", "");

                if (!!navigator.userAgent.match(/Trident/)) {
                    tze.hideProcess();
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var button = $('<a />', {
                        'class': "text-center btn btn-default",
                        'id': "reportDownload",
                        'href': url,
                        'download': filename,
                        'text': "Download starten"
                    });
                    $(document).one("click", "a#reportDownload", function () {
                        setTimeout(function () {
                            window.URL.revokeObjectURL(url);
                        }, 1000);
                    });
                    button.hide().appendTo("body")[0].click();
                    tze.hideProcess();
                }

            }
        });
    };

    me.childperTA = function (Zeile, Record, parentRecord) {

        var id = Record.id;
        var userId = Record.userId || (parentRecord) ? parentRecord.userId : undefined;

        var parameters = $.param({id: id, userId: userId});

        this.$jtable.jtable('openChildTable',
                Zeile.closest('tr'),
                {
                    title: "Aufstellung nach Tickets",
                    fields: {
                        ticketId: {},
                        done_tickets: {},
                        sum_counter: {},
                        sum_duration: {}
                    },
                    actions: {
                        listAction: function () {
                            return actionFunc("func/tickets.php", "mode=admin&action=list-ticket-classes&" + parameters);
                        }
                    }
                },
        function (data) {
            data.childTable.jtable('load');
        });
    };

    me.childperMA = function (Zeile, Record) {
        var parameters = $.param({id: Record.id});

        this.$jtable.jtable('openChildTable',
                Zeile.closest('tr'),
                {
                    title: "Aufstellung nach Mitarbeiter",
                    fields: {
                        userId: {key: true, list: false},
                        sVorname: {title: "Vorname", width: "25%"},
                        sNachname: {title: "Nachname", width: "25%"},
                        Tickets: {title: "Zusammenfassung", width: "35%"},
                        perTA: {title: "", width: "15%", display: function (data) {
                                var button = $("<button>per Ticket</button>");
                                button.on("click", function () {
                                    me.childperTA(button, data, Record);
                                });
                                return button;
                            }
                        }
                    },
                    actions: {
                        listAction: function () {
                            return actionFunc("func/tickets.php", "mode=admin&action=list-ma&" + parameters);
                        }
                    }
                },
        function (data) {
            data.childTable.jtable('load');
        });
    };

    me.destroy = function () {
        this.$jtable.jtable('destroy');
    };

    return me;
}(jQuery);/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */


/* global moment */

var zeiterfassung = (function ($) {
    var me = {};

    me.autoUpdate = function () {
        if ($.active > 0) {
            //falls bereits eine Anfrage an den Server läuft...
            $(document).one("ajaxStop", function () {
                me.autoUpdate();
            });
        } else {
            var filterData = $('#filter').data();
            var dataString = $.param({mode: "admin", action: "get-users-update", last: filterData.last});
            if (filterData.filter !== undefined) {
                var addData = $.param(filterData.filter);
                if (addData.length > 0) {
                    dataString += "&" + addData;
                }
            }

            // me.updateRequest used in me.toggleUpdater()
            me.updateRequest = $.post("func/zeiterfassung.php", dataString, function (data) {
                delete me.updateRequest;
                if (data.Result === "OK") {
                    $('#filter').data('last', data.last);
                    $.each(data.Records, function () {
                        me.updateRow(this);
                    });
                    var check = $('#autoreload').prop('checked');
                    if (check) {
                        me.autoUpdateTimer = setTimeout(function () {
                            me.autoUpdate();
                        }, 2000);
                    }
                }
            }, "json");
        }
    };

    me.datepicker = function (element) {
        me.$datepicker = $(element);
        var $datepicker = me.$datepicker;

        if (me.$jtable) {
            /* Kalender einrichten */
            $datepicker.datepicker({dateFormat: "yy-mm-dd"})
                    .on("change", function () {
                        var filter = $('#filter').data("filter") || {};
                        me.$jtable.jtable('load', filter);
                    });
        }
    };

    me.filter = {
        /**
         * Pulls list for filtering by project
         * @param jQuery-Object liste element where the list gets attached
         * @returns nothing
         */
        projektFilterInit: function (liste) {
            me.filter.$liste = $(liste);
            var $liste = me.filter.$liste;

            // $('#projekt-toggle').children().length

            $liste.on("show.bs.collapse", function (e) {
                $liste.empty().append("<span class='wait text-muted'>Lädt...&nbsp;<span class='glyphicon glyphicon-refresh glyphicon-spin'></span></span>");

                $.post("func/projekte.php", {'mode': 'admin', 'action': 'projekt-list'}, function (data) {
                    if (data.Result === "OK") {
                        $liste.empty();

                        //$(liste).append(link);

                        $.each(data.Records, function (ind, ele) {
                            var link = $('<a href="#zeiterfassung" class="filter list-group-item"></a>');
                            link.text(ele.Projekt).data("filter", {filter: "Projekt", filterId: ele.id});
                            $liste.append(link);
                        });
                    } else {
                        $liste.empty().append("Es ist Fehler aufgetreten!");
                    }
                }, "json");
            });
        },
        /**
         * resets all filter Data
         */
        reset: function () {

            // Filter leeren
            $('#filter').removeData("filter");

            // Dropdown-List ausblenden
            var $liste = me.filter.$liste || false;
            if ($liste) {
                $liste.collapse('hide');
            }

            // Schalter zurücksetzen
            $.each(me.filter.toggleElements, function (i, el) {
                // Update UI
                var $el = $(el);
                $el.removeClass("active");

                var toggledata = $el.data("filter") || false;

                // Remove Data
                if (toggledata) {
                    if (toggledata.toggleProp) {
                        delete toggledata[toggledata.toggleProp];
                    }
                }
            });

            // Namensfilter leeren
            $('input[name="nameFilter"]').val('');
        },
        toggleElements: [
            '#filter a[href=#loggedOnly]'
        ],
        settings: {}
    };

    me.init = function (parentElement, jTableElement, datepickerElement) {
        me.$jtable = $(jTableElement);
        var $jtable = this.$jtable;

        me.datepicker(datepickerElement);

        $jtable.jtable({
            title: "&nbsp;",
            openChildAsAccordion: true,
            fields: {
                iUserID: {key: true, list: false},
                sVorname: {title: "Vorname", width: "25%"},
                sNachname: {title: "Nachname", width: "25%"},
                AZ: {
                    title: "Arbeit",
                    width: "10%",
                    display: function (data) {
                        var time = data.record.AZ || "";
                        var clockme = "";
                        if (data.record.working === 1) {
                            clockme = "clockme";
                        }
                        return '<time class="' + clockme + '">' + time + '</time>';
                    }
                },
                PZ: {
                    title: "Pause",
                    width: "10%",
                    display: function (data) {
                        var time = data.record.PZ || "";
                        var clockme = "";
                        if (data.record.working === 0) {
                            clockme = "clockme";
                        }
                        return '<time class="' + clockme + '">' + time + '</time>';
                    }
                },
                Projekt: {
                    title: "Projekt",
                    width: "15%"
                },
                Status: {
                    title: "Status",
                    width: "10%"
                },
                Details: {width: "5%", sorting: false, display: function (data) {
                        var Details = $('<button>Details</button>');
                        Details.on("click", function () {
                            $jtable.jtable('openChildTable',
                                    Details.closest('tr'),
                                    {
                                        sorting: true,
                                        defaultSorting: "Time_Start ASC",
                                        title: "Detailansicht - " + data.record.sVorname + " " + data.record.sNachname,
                                        fields: {
                                            id: {key: true, list: false},
                                            iProjekt: {title: "Projekt", list: false, type: "combobox",
                                                options: getOptions('func/zeiterfassung.php', 'mode=admin&action=get-users-projekts&iUserId=' + data.record.iUserID)},
                                            iCat: {title: "Art", list: false, type: "combobox",
                                                options: getOptions('func/zeiterfassung.php', 'mode=admin&action=get-users-classes&iUserId=' + data.record.iUserID)},
                                            Eintrag: {title: "Eintrag", create: false, edit: false, width: "55%", display: function (data) {
                                                    return data.record.Projekt + " " + data.record.ListLabel;
                                                }},
                                            Time_Start: {
                                                title: "von",
                                                width: "15%",
                                                display: function (data) {
                                                    return data.record.Time_Start.substr(-8);
                                                },
                                                input: function (data) {
//                                                    var objDate = new Date();
//                                                    var Zeit = objDate.toTimeString().substr(0, 8);
//                                                    var Datum = me.$datepicker.val();
//                                                    var hiddenInput;

                                                    var time = (data.record) ? data.record.Time_Start : false;
//                                                    if (data.record) {
//                                                        hiddenInput = $('<input type="text" name="Time_Start" value="' + data.record.Time_Start + '">').datetimepicker({
//                                                            dateFormat: "yy-mm-dd",
//                                                            timeFormat: "HH:mm:ss",
//                                                            controlType: 'select',
//                                                            oneLine: true,
//                                                            parse: "loose"
//                                                        });
//                                                    } else {
//                                                        hiddenInput = $('<input type="text" name="Time_Start" value="' + Datum + ' ' + Zeit + '">').datetimepicker({
//                                                            dateFormat: "yy-mm-dd",
//                                                            timeFormat: "HH:mm:ss",
//                                                            controlType: 'select',
//                                                            oneLine: true,
//                                                            parse: "loose"
//                                                        });
//                                                    }
                                                    return createDateTime(time, "Time_Start", false);
//                                                    return hiddenInput;
                                                }
                                            },
                                            Time_End: {title: "bis", width: "15%", display: function (data) {
                                                    var strTime = data.record.Time_End.substr(-8);
                                                    if (strTime === "00:00:00") {
                                                        strTime = "offen";
                                                    }
                                                    return strTime;
                                                },
                                                input: function (data) {
                                                    var time = (data.record) ? data.record.Time_End : false;
                                                    return createDateTime(time, "Time_End", true);
                                                }
                                            },
                                            Duration: {title: "Dauer", width: "15%", create: false, edit: false}
                                        },
                                        actions: {
                                            listAction: function () {
                                                var currentDate = $('#datepicker').val();
                                                return actionFunc("func/zeiterfassung.php", "mode=admin&action=get-users-timetable&Date=" + currentDate + "&iUserID=" + data.record.iUserID);
                                            },
                                            createAction: function (childData) {
                                                var currentDate = $('#datepicker').val();
                                                return actionFunc("func/zeiterfassung.php", "mode=admin&action=insert-users-timetable&Date=" + currentDate + "&iUserID=" + data.record.iUserID + "&" + childData);
                                            },
                                            updateAction: function (childData) {
                                                return actionFunc("func/zeiterfassung.php", "mode=admin&action=update-users-timetable&" + childData);
                                            },
                                            deleteAction: function (childData) {
                                                return actionFunc("func/zeiterfassung.php", "mode=admin&action=delete-users-timetable&id=" + childData.id);
                                            }
                                        },
                                        // EVENTS
                                        rowInserted: function (event, data) {
                                            if (data.record.ListLabel === "Pause") {
                                                $(data.row).addClass('info').closest('table').addClass('table');
                                            }
                                            if (data.record.ListLabel === "Meeting") {
                                                $(data.row).addClass('danger').closest('table').addClass('table');
                                            }
                                            if (data.record.ListLabel === "Sonstiges") {
                                                $(data.row).addClass('warning').closest('table').addClass('table');
                                            }
                                        },
                                        rowUpdated: function (event, data) {
                                            if (data.record.ListLabel === "Pause") {
                                                $(data.row).addClass('info').removeClass('danger warning').closest('table').addClass('table');
                                            } else
                                            if (data.record.ListLabel === "Meeting") {
                                                $(data.row).addClass('danger').removeClass('info warning').closest('table').addClass('table');
                                            } else
                                            if (data.record.ListLabel === "Sonstiges") {
                                                $(data.row).addClass('warning').removeClass('danger info').closest('table').addClass('table');
                                            } else
                                            {
                                                $(data.row).removeClass('warning danger info').closest('table').addClass('table');
                                            }
                                        }},
                            function (data) {
                                data.childTable.jtable('load');
                            }
                            );
                        });
                        return Details;
                    }}
            }, actions: {
                listAction: function (postData, jtParams) {
                    //var last = me.last;
                    return actionFunc("func/zeiterfassung.php",
                            "mode=admin&action=get-users&Date=" + $('#datepicker').val(),
                            jtParams, postData, [{key: "last", element: "#filter"}]);
                }
            },
            toolbar: {
                items: [{
                        // Feld für Namenssuche
                        text: 'Filter: <input id="nameFilter" name="nameFilter" style="width: 6em; margin: -5px 0px; border: none;" type="text" />'
                    }, {
                        // Button für Liveview
                        text: '<div><input id="autoreload" style="margin: 0;" type="checkbox" /><span class="hidden glyphicon glyphicon-refresh"></span> AutoUpdate</div>',
                        click: function () {
                            me.toggleUpdater();
                        }
                    }, {
                        // manuelles neuladen
                        text: '<div><span class="glyphicon glyphicon-refresh"></span> Aktualisieren</div>',
                        click: function () {
                            $jtable.jtable("reload");
                        }
                    }, {
                        // 
                        text: '<div><span class="glyphicon glyphicon-download-alt"></span> Excel-Report</div>',
                        click: function () {
                            var currentDate = me.$datepicker.val();
                            zeiterfassung.Report(currentDate);
                        }
                    }] //Array of your custom toolbar items.
            },
            // EVENTS
            rowInserted: function (event, data) {
                if (data.record.AZ === null) {
                    $(data.row).addClass('danger').closest('table').addClass('table');
                }
                if (data.record.Status === "Pause") {
                    $(data.row).addClass('info').closest('table').addClass('table');
                }
                if (data.record.Status === "Meeting") {
                    $(data.row).addClass('warning').closest('table').addClass('table');
                }
            },
            loadingAnimationDelay: 100,
            sorting: true
        }).jtable("load");

        // Toggle Button für logged Only
        $('a[href=#loggedOnly]').data("filter", {toggleProp: "loggedOnly"});

        $("#zeiterfassung").on("click", "a.filter", function (e) {
            e.preventDefault();

            // Filter laden bzw. leer anlegen
            var filter = $('#filter').data("filter") || $('#filter').data("filter", {}).data("filter");

            // Daten des neuen Filters laden
            var $this = $(this);
            var newFilter = $this.data("filter") || false;

            if (newFilter) {
                // falls toggleProp gesetzt, dieses toggeln
                if (newFilter.toggleProp) {
                    newFilter[newFilter.toggleProp] = !newFilter[newFilter.toggleProp];

                    if (newFilter[newFilter.toggleProp]) {
                        $this.addClass("active");
                    } else {
                        $this.removeClass("active");
                    }
                } else {
//                // UI anpassen
//                if (newFilter.filter === filter.filter && newFilter.filterId === filter.filterId && !newFilter.action) {
                    $this.addClass("active").siblings().removeClass("active");
//                }
                }

                // Filter mit neuem Filter ergänzen
                $.extend(filter, newFilter);

                delete filter.toggleProp;

            } else {
                me.filter.reset();
                filter = {};
                $this.siblings().removeClass("active").children().removeClass("active");
            }

            $jtable.jtable('load', filter);
        });

        $("#zeiterfassung").on('keydown', 'input[name="nameFilter"]', function () {
            var $this = $(this);

            // letzte Anfrage löschen, um nicht bei jedem Tastendruch neu zu suchen...
            if (me.updateTimer) {
                clearTimeout(me.updateTimer);
            }

            // kurz warten, um nicht bei jedem Tastendruck neu zu suchen...
            me.updateTimer = setTimeout(function () {

                // Filter laden bzw. leer anlegen
                var filter = $('#filter').data("filter") || $('#filter').data("filter", {}).data("filter");
                // Text in Filter aufnehmen
                filter.nameFilter = $this.val();

                $jtable.jtable("load", filter);
            }, 400);
        });
    };

    function createDateTime(time, InputName, button) {
        var dateVal = me.$datepicker.val();
        var timeDateVal = time || dateVal + ' ' + moment().format("hh:mm:ss");
        var timeVal = moment(timeDateVal).format("hh:mm:ss");
        var hiddenInput = $('<input type="hidden" name="' + InputName + '" value="' + timeDateVal + '">');

        var timeGrp = $('<div class="input-group"></div>');
        var timePicker = $('<input class="form-control" type="text" value="' + timeVal + '">');
        var timeButton = $('<span class="input-group-addon"><span class="glyphicon glyphicon-time"></span></span>');

        var dateGrp = $('<div class="input-group"></div>');
        var datePicker = $('<input class="form-control" type="text" value="' + moment(dateVal).format("DD.MM.YYYY") + '">');
        var dateButton = $('<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>');

        timePicker.on("input change", function () {
            var date = moment(datePicker.val(), "DD.MM.YYYY");
            var d = moment($(this).val(), "hh:mm:ss");
            updateTime(d, date, hiddenInput);
        });

        timeGrp.on("dp.update dp.change change", function (e) {
            var date = moment(datePicker.val(), "DD.MM.YYYY");
            updateTime(e.date, date, hiddenInput);
        });

        datePicker.on("input change", function () {
            var e = moment($(this).val(), "DD.MM.YYYY");
            var time = moment(timePicker.val(), "hh:mm:ss");
            updateDate(e, time, hiddenInput);
        });

        dateGrp.on("dp.update dp.change change", function (e) {
            var time = moment(timePicker.val(), "hh:mm:ss");
            updateDate(e.date, time, hiddenInput);
        });

        timeGrp.append(timePicker, timeButton);
        timeGrp.datetimepicker({widgetPositioning: {vertical: "top"}, showClose: false, keepInvalid: true, format: "HH:mm:ss"});

        dateGrp.append(datePicker, dateButton);
        dateGrp.datetimepicker({widgetPositioning: {vertical: "top"}, showClose: false, keepInvalid: true, format: "DD.MM.YYYY"});

        var offen = "";
        if (button) {
            offen = $('<button type="button" class="btn btn-default">Offen</button>');

            offen.on("click", function (e) {
                //inputGroup.data("DateTimePicker").clear();
                timeGrp.data("DateTimePicker").hide();
                dateGrp.data("DateTimePicker").hide();
                hiddenInput.val("0000-00-00 00:00:00");
                datePicker.val("");
                timePicker.val("offen");
            });
        }

        var $row = $("<div class='row'></div>");

        var $col1 = $('<div class="col-sm-2"></div>');
        var $col2 = $('<div class="col-sm-5"></div>');
        var $col3 = $('<div class="col-sm-5"></div>');

        $row.append(hiddenInput, $col1, $col2, $col3);

        $col1.append(offen);
        $col2.append(dateGrp);
        $col3.append(timeGrp);

        return $row;
    }

    function updateTime(newTime, mDate, hiddenInput) {
        if (!mDate.isValid()) {
            mDate = moment();
        }

        mDate.hour(newTime.hour());
        mDate.minute(newTime.minute());
        mDate.second(newTime.second());

        hiddenInput.val(mDate.format("YYYY-MM-DD HH:mm:ss"));
    }

    function updateDate(newDate, Time, hiddenInput) {
        if (!Time.isValid()) {
            Time = moment();
        }

        Time.year(newDate.year());
        Time.month(newDate.month());
        Time.date(newDate.date());

        hiddenInput.val(Time.format("YYYY-MM-DD HH:mm:ss"));
    }

    me.Report = function (date) {
        tze.showProcess();
        $.ajax({
            url: "func/report.php",
            data: {Date: date, mode: "admin"},
            type: "POST",
            dataType: 'binary',
            success: function (blob, status, xhr) {
                var filename = xhr.getResponseHeader("Content-Disposition").replace("attachment;filename=", "");

                if (!!navigator.userAgent.match(/Trident/)) {
                    tze.hideProcess();
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var button = $('<a />', {
                        'class': "text-center btn btn-default",
                        'id': "reportDownload",
                        'href': url,
                        'download': filename,
                        'text': "Download starten"
                    });
                    $(document).one("click", "a#reportDownload", function () {
                        setTimeout(function () {
                            window.URL.revokeObjectURL(url);
                        }, 1000);
                    });
                    button.hide().appendTo("body")[0].click();
                    tze.hideProcess();
                }

            }
        });
    };

    me.toggleUpdater = function () {
        clearTimeout(me.timeout);
        me.timeout = setTimeout(function () {
            var savedCheck = $('#autoreload').data('checked');
            savedCheck = (savedCheck !== undefined) ? savedCheck : false;
            if (savedCheck) {
                console.log("AutoUpdate deaktiviert");
                clearTimeout(me.autoUpdateTimer);

                if (me.updateRequest !== undefined) {
                    me.updateRequest.abort();
                }

                $('#autoreload').data('checked', false);
                $('#autoreload').prop('checked', false);
            } else {
                console.log("AutoUpdate aktiviert");
                me.autoUpdate();
                $('#autoreload').data('checked', true);
                $('#autoreload').prop('checked', true);
            }
        }, 100);
    };

    me.updateRow = function (Record) {
        this.jtable.jtable('updateRecord', {record: Record, clientOnly: true});
    };

    return me;
})(jQuery);/* 
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

//            /* Kalender */
//            $('#datepicker').datepicker({dateFormat: "yy-mm-dd"})
//                    .on("change", function () {
//                        $('#jtable_ZE').jtable('load');
//                    });

            /* Tabelle Mitarbeiter mit Untertabelle Zeiterfassung*/
            zeiterfassung.init("#zeiterfassung", "#jtable_ZE", "#datepicker");
            zeiterfassung.filter.projektFilterInit("#projekt-toggle");
            
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