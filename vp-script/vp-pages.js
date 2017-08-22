
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.pages || !diagram.enablePages)
        return;

    $("#shape-pages").show();

    function filter(term) {
        var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

        $.each(diagram.pages, function (index, page) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            if (term && !re.test(page.Name))
                return;

            var href = document.location.href.replace("__" + diagram.currentPage.Id, "__" + page.Id);
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
