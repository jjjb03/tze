/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */


var zeiterfassung = (function ($) {
    var me = {};
    me.filter = {
        init: function (liste) {
            $(liste).empty();

            $.post("func/projekte.php", {'mode': 'admin', 'action': 'projekt-list'}, function (data) {
                if (data.Result === "OK") {

                    //$(liste).append(link);

                    $.each(data.Records, function (ind, ele) {
                        var link = $('<a href="#zeiterfassung" class="filter list-group-item"></a>');
                        link.text(ele.Projekt).data("filter", {id: ele.id, typ: "Projekt"});

                        //var listenelement = $('<li class="list-group-item"></li>');
                        //listenelement.append(link);

                        $(liste).append(link);
                    });
                }
            }, "json");
        }
    };
    me.init = function () {
        this.jtable = $('#jtable_ZE');
        var $jtable = this.jtable;
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
                            $('#jtable_ZE').jtable('openChildTable',
                                    Details.closest('tr'),
                                    {
                                        sorting: true,
                                        defaultSorting: "Time_Start ASC",
                                        title: "Detailansicht - " + data.record.sVorname + " " + data.record.sNachname,
                                        fields: {
                                            id: {key: true, list: false},
                                            iProjekt: {title: "Projekt", list: false, type: "radiobutton",
                                                options: getOptions('func/zeiterfassung.php', 'mode=admin&action=get-users-projekts&iUserId=' + data.record.iUserID)},
                                            iCat: {title: "Art", list: false, type: "radiobutton",
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
                                                    var objDate = new Date();
                                                    var Zeit = objDate.toTimeString().substr(0, 8);
                                                    var Datum = $('#datepicker').val();
                                                    var hiddenInput;
                                                    if (data.record) {
                                                        hiddenInput = $('<input type="text" name="Time_Start" value="' + data.record.Time_Start + '">').datetimepicker({
                                                            dateFormat: "yy-mm-dd",
                                                            timeFormat: "HH:mm:ss",
                                                            controlType: 'select',
                                                            oneLine: true,
                                                            parse: "loose"
                                                        });
                                                    } else {
                                                        hiddenInput = $('<input type="text" name="Time_Start" value="' + Datum + ' ' + Zeit + '">').datetimepicker({
                                                            dateFormat: "yy-mm-dd",
                                                            timeFormat: "HH:mm:ss",
                                                            controlType: 'select',
                                                            oneLine: true,
                                                            parse: "loose"
                                                        });
                                                    }
                                                    return hiddenInput;
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
                                                    var objDate = new Date();
                                                    var Zeit = objDate.toTimeString().substr(0, 8);
                                                    var Datum = $('#datepicker').val();
                                                    var hiddenInput;
                                                    if (data.record) {
                                                        hiddenInput = $('<input type="text" name="Time_End" value="' + data.record.Time_End + '"></div>').datetimepicker({
                                                            dateFormat: "yy-mm-dd",
                                                            timeFormat: "HH:mm:ss",
                                                            controlType: 'select',
                                                            oneLine: true,
                                                            parse: "loose"
                                                        });
                                                    } else {
                                                        hiddenInput = $('<input type="text" name="Time_End" value="' + Datum + ' ' + Zeit + '">').datetimepicker({
                                                            dateFormat: "yy-mm-dd",
                                                            timeFormat: "HH:mm:ss",
                                                            controlType: 'select',
                                                            oneLine: true,
                                                            parse: "loose"
                                                        });
                                                    }
                                                    return hiddenInput;
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
                            jtParams, postData, [{key: "last", elem: "#filter"}]);
                }
            },
            toolbar: {
                hoverAnimation: true, //Enable/disable small animation on mouse hover to a toolbar item.
                hoverAnimationDuration: 60, //Duration of the hover animation.
                hoverAnimationEasing: undefined, //Easing of the hover animation. Uses jQuery's default animation ('swing') if set to undefined.
                items: [{
                        text: '<div><input id="autoreload" style="margin: 0;" type="checkbox" /><span class="hidden glyphicon glyphicon-refresh"></span> AutoUpdate</div>',
                        click: function () {
                            me.toggleUpdater();
                        }
                    }, {
                        text: '<div><span class="glyphicon glyphicon-refresh"></span> Aktualisieren</div>',
                        click: function () {
                            $jtable.jtable("reload");
                        }
                    }, {
                        text: '<div><span class="glyphicon glyphicon-download-alt"></span> Excel-Report</div>',
                        click: function () {
                            var currentDate = $('#datepicker').val();
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
        });

        $('a[href=#loggedOnly]').data("filter", {typ: "Projekt", action: "toggle", ele: "loggedOnly"});

        $("#zeiterfassung").on("click", "a.filter", function (e) {
            e.preventDefault();
            
            var $this = $(this);
            var newFilter = $this.data("filter") || false;
            var filter = $('#filter').data("filter") || {};

            if (newFilter) {
                if (newFilter.action === "toggle" && newFilter.ele !== undefined) {
                    newFilter[newFilter.ele] = !newFilter[newFilter.ele];

                    if (newFilter[newFilter.ele]) {
                        $this.addClass("active");
                    } else {
                        $this.removeClass("active");
                    }
                }

                $('#filter').data("filter", $.extend(filter, newFilter));
                
                if (newFilter.typ === filter.typ && newFilter.id === filter.id && !newFilter.action) {
                    $this.addClass("active").siblings().removeClass("active");
                }

                if (filter.id) {
                    $('#jtable_ZE').jtable('load', {
                        filter: filter.typ,
                        filterId: filter.id,
                        loggedOnly: !!filter.loggedOnly
                    });
                } else {
                    $('#jtable_ZE').jtable('load', {loggedOnly: !!filter.loggedOnly});
                }
            } else {
                $.extend($('#filter a[href=#loggedOnly]').data("filter"), {loggedOnly: false});
                $this.siblings().removeClass("active").children().removeClass("active");
                $('#filter').removeData('filter');
                $('#jtable_ZE').jtable('load');
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
    me.autoUpdate = function () {
        if ($.active > 0) {
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
    me.updateRow = function (Record) {
        this.jtable.jtable('updateRecord', {record: Record, clientOnly: true});
    };
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

    return me;
})(jQuery);