/* 
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
})(jQuery);