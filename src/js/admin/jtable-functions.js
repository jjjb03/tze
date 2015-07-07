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
}