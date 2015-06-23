/* 
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

        this.jtable = $(init_jtable);
        this.datepicker = $(init_datepicker);

        var jtable = this.jtable;
        var datepicker = this.datepicker;

        datepicker.datepicker({dateFormat: "yy-mm-dd"})
                .on("change", function () {
                    $.extend(me.filter, {Date: $(this).val()});
                    jtable.jtable('load', me.filter);
                });

        jtable.jtable({
            title: "&nbsp;",
            fields: {
                id: {key: true, list: false},
                Projekt: {title: "Projekt", width: "30%"},
                Tickets: {title: "Zusammenfassung", width: "43%", display: function (data) {
                        var tickets = data.record.done_tickets;
                        var count = data.record.sum_counter;
                        var duration = data.record.sum_duration;
                        return tickets + " - " + count + " - " + duration;
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
            }
        }).jtable('load');
    };

    me.childperTA = function (Zeile, Record, parentRecord) {
        
        var id = Record.id;
        var userId = Record.userId || (parentRecord) ? parentRecord.userId : undefined;
        
        var parameters = $.param({id: id, userId: userId});

        this.jtable.jtable('openChildTable',
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
        
        this.jtable.jtable('openChildTable',
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
        this.jtable.jtable('destroy');
    };

    return me;
}(jQuery);