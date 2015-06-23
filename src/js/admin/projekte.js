/* 
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
})(jQuery);