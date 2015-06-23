/* 
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
 * @function actionFunc
 * @param {URL} urlString Adresse, von welcher Records geladen werden
 * @param {String} dataString Daten, welche per POST übertragen werden
 * @param {jTable-Data} jTableData Daten, welche von jTable für Sortierung usw. übertragen werden soll
 * */
function actionFunc(urlString, dataString, jTableData, jTablePostData, processData) {

    $.each([jTableData, jTablePostData], function (i, el) {
        if (el !== undefined) {
            var addData = $.param(el);
            if (addData.length > 0) {
                dataString += "&" + addData;
            }
        }
    });

    function saveData(recData, savData) {
        if (savData !== undefined) {
            $.each(savData, function (propertyName, valueOfProperty) {
//            key: "last", obj: last
                $.each(recData, function (name, value) {
                    if (name === valueOfProperty.key) {
                        $(valueOfProperty.elem).data(name, value);
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
}