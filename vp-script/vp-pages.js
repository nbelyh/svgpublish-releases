
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.pages || !diagram.enablePages)
        return;

    $("#shape-pages").show();

    function numericSort(data) {
        var collator = Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return data
            .map(function (x) {
                return x;
            })
            .sort(function (a, b) {
                return collator.compare(a.Name, b.Name);
            });
    }

    function filter(term) {
        var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

        var sortedPages = diagram.enableLayerSort ? numericSort(diagram.pages) : diagram.pages;
        $.each(sortedPages, function (index, page) {

            var re = new RegExp("(" + term.replace(/([\\.+*?[^]$(){}=!<>|:])/g, "\\$1") + ")", 'gi');

            if (term && !re.test(page.Name))
                return;

            var curpath = location.pathname;
            var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), page.FileName);
            var href = document.location.protocol + "//" + document.location.host + newpath;

            var text = term ? page.Name.replace(re, "<span class='search-hilight'>$1</span>") : page.Name;

            var $a = $("<a />")
                .attr("href", href)
                .html(text);

            var $li = $('<li />');

            if (page.Id === diagram.currentPage.Id)
                $li.addClass('active');

            $li.append($a).appendTo($ul);
        });

        $("#panel-pages").html($ul);
    }

    filter('');

    $("#search-page").on("keyup", function () {

        filter($("#search-page").val());
        return false;
    });
});
