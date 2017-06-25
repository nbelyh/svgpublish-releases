
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.pages || !diagram.enablePages)
        return;

    $("#shape-pages").show();

    var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

    $.each(diagram.pages, function(index, page) {

        var href = document.location.href.replace("__" + diagram.currentPage.Id, "__" + page.Id);
        var text = page.Name;

        var $a = $("<a />")
            .attr("href", href)
            .text(text);

        var $li = $('<li />');

        if (page.Id === diagram.currentPage.Id)
            $li.addClass('active');

        $li.append($a).appendTo($ul);
    });

    $("#panel-pages").html($ul);

});
