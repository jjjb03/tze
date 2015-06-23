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
}(jQuery);