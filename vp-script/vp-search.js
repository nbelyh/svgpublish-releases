
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableSearch)
        return;

    $("#shape-search").show();

    function processPage(term, pageId, $ul, external) {
        $.each(diagram.searchIndex[pageId], function (shapeId, searchText) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            if (!re.test(searchText))
                return;

            var $li = $('<li />');

            var a = '';
            a += '<a>';

            if (external) {
                var page = diagram.pages.filter(function (p) {
                    return p.Id == pageId;
                })[0];


                a += '<div class="text-muted small">';
                a += '(page ' + page.Name + ')';
                a += '</div>';
            }

            a += '<div>';
            a += searchText.replace(re, "<span class='search-hilight'>$1</span>");
            a += '</div>';

            a += '</a>';

            var $a = $(a);

            var pageUrl = document.location.origin + document.location.pathname;

            if (external) {
                var targetPage = diagram.pages.filter(function (p) { return p.Id == pageId })[0];
                var curpath = location.pathname;
                var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), targetPage.FileName);
                pageUrl = document.location.origin + newpath;
            }

            var targetUrl = pageUrl + "#?shape=" + shapeId + "&term=" + encodeURIComponent(term);
            $a.attr('href', targetUrl);

            $li.append($a);

            $li.appendTo($ul);
        });
    }

    function search(term) {
        var $html = $("<div />");

        if (!term.length) {
            
        }
        else if (term.length < 2) {
            var $hint = $('<p class="text-muted">Please enter more than one character to search</p>');
            $html.append("<hr/>");
            $html.append($hint);
        } else {
            var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

            $html.append("<hr/>");
            $html.append("<p>Results for <strong>" + term + "</strong>:</p>");
            $html.append($ul);

            var currentPageId = diagram.currentPage.Id;

            processPage(term, currentPageId, $ul);

            $.each(diagram.searchIndex, function(pageId) {
                if (pageId != currentPageId)
                    processPage(term, pageId, $ul, true);
            });
        }

        $("#panel-search-results")
            .html($html);
    }

    $("#search-term").on("keyup", function () {

        search($("#search-term").val());
        return false;
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    var term = getUrlParameter('term');
    if (term) {
        $('#search-term').val(term);
        search(term);
    }
});
