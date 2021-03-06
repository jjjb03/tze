/* 
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
                                                    var time = (data.record) ? data.record.Time_Start : false;
                                                    return createDateTime(time, "Time_Start", false);
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
        var mom = moment(time);
        var timeDateVal, timeVal, dateVal;
        
        var timeFormat = "HH:mm:ss";
        var dateFormat = "DD.MM.YYYY";
        
        var hiddenInputFormat = "YYYY-MM.DD HH:mm:ss";

        if (mom.isValid()) {
            timeVal = mom.format(timeFormat);
            dateVal = mom.format(dateFormat);
            timeDateVal = time;
        } else if (button) {
            timeVal = "offen";
            dateVal = "";
            timeDateVal = "0000-00-00 00:00:00";
        } else {
            var date = me.$datepicker.val();
            timeVal = moment().format(timeFormat);
            dateVal = moment(date).format(dateFormat);
            timeDateVal = date + ' ' + timeVal;
        }

        var hiddenInput = $('<input type="hidden" name="' + InputName + '" value="' + timeDateVal + '">');

        var timeGrp = $('<div class="input-group"></div>');
        var timePicker = $('<input class="form-control" type="text" value="' + timeVal + '">');
        var timeButton = $('<span class="input-group-btn"><span class="btn btn-default"><span class="glyphicon glyphicon-time"></span></span></span>');

        var dateGrp = $('<div class="input-group"></div>');
        var datePicker = $('<input class="form-control" type="text" value="' + dateVal + '">');
        var dateButton = $('<span class="input-group-btn"><span class="btn btn-default"><span class="glyphicon glyphicon-calendar"></span></span></span>');

        timeGrp.append(timePicker, timeButton);
        timeGrp.datetimepicker({widgetPositioning: {vertical: "top"}, showClose: false, keepInvalid: true, format: timeFormat});

        dateGrp.append(datePicker, dateButton);
        dateGrp.datetimepicker({widgetPositioning: {vertical: "top"}, showClose: false, keepInvalid: true, format: dateFormat});

        timePicker.on("input change", function () {
            var date = moment(datePicker.val(), dateFormat);
            var d = moment($(this).val(), timeFormat);
            updateTime(d, date, hiddenInput, timePicker, datePicker);
        });

        timeGrp.on("dp.show", function () {
            var picker = timeGrp.data("DateTimePicker");
            var timeStart = moment($("#Edit-Time_Start > input[name='Time_Start']").val(), hiddenInputFormat);
            var timeEnd = moment($("#Edit-Time_End > input[name='Time_End']").val(), hiddenInputFormat);
            
            var inputTime = moment($(this).closest(".row").children("input:hidden").val(), hiddenInputFormat);
            picker.date(inputTime);
            
            if (button) {
                picker.minDate(timeStart);

                if (timeEnd.isBefore(timeStart) || !timeEnd.isValid()) {
                    picker.date(timeStart);
                }
            } else {
                picker.maxDate(timeEnd);

                if (timeStart.isAfter(timeEnd) || !timeStart.isValid()) {
                    picker.date(timeEnd);
                }
            }
        });

        dateGrp.on("dp.show", function () {
            var picker = dateGrp.data("DateTimePicker");
            var timeStart = moment($("#Edit-Time_Start > input[name='Time_Start']").val(), hiddenInputFormat);
            var timeEnd = moment($("#Edit-Time_End > input[name='Time_End']").val(), hiddenInputFormat);
            
            var inputTime = moment($(this).closest(".row").children("input:hidden").val(), hiddenInputFormat);
            picker.date(inputTime);
            
            if (button) {
                picker.minDate(timeStart);

                if (timeEnd.isBefore(timeStart) || !timeEnd.isValid()) {
                    picker.date(timeStart);
                }
            } else {
                picker.maxDate(timeEnd);

                if (timeStart.isAfter(timeEnd) || !timeStart.isValid()) {
                    picker.date(timeEnd);
                }
            }
        });

        timeGrp.on("dp.update dp.change change", function (e) {
            var date = moment(datePicker.val(), dateFormat);
            updateTime(e.date, date, hiddenInput, timePicker, datePicker);
        });

        datePicker.on("input change", function () {
            var e = moment($(this).val(), dateFormat);
            var time = moment(timePicker.val(), timeFormat);
            updateDate(e, time, hiddenInput, timePicker, datePicker);
        });

        dateGrp.on("dp.update dp.change change", function (e) {
            var time = moment(timePicker.val(), timeFormat);
            updateDate(e.date, time, hiddenInput, timePicker, datePicker);
        });

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

    function updateTime(newTime, mDate, hiddenInput, timePicker, datePicker) {
        if (!mDate.isValid()) {
            mDate = moment(me.$datepicker.val());
        }

        mDate.hour(newTime.hour());
        mDate.minute(newTime.minute());
        mDate.second(newTime.second());

        hiddenInput.val(mDate.format("YYYY-MM-DD HH:mm:ss"));
        timePicker.val(mDate.format("HH:mm:ss"));
        datePicker.val(mDate.format("DD.MM.YYYY"));
    }

    function updateDate(newDate, Time, hiddenInput, timePicker, datePicker) {
        if (!Time.isValid()) {
            Time = moment(me.$datepicker.val());
        }

        Time.year(newDate.year());
        Time.month(newDate.month());
        Time.date(newDate.date());

        hiddenInput.val(Time.format("YYYY-MM-DD HH:mm:ss"));
        timePicker.val(Time.format("HH:mm:ss"));
        datePicker.val(Time.format("DD.MM.YYYY"));
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
})(jQuery);