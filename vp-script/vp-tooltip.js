
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableTooltips) {
        return;
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $("#" + shapeId);

        var tip = diagram.enableTooltipHtml ? Mustache.render($('#tooltip-template').html(), shape) : shape.Comment;

        if (!tip)
            return;

        $shape.tooltip({
            container: "body",
            html: true,
            title: tip
        });
    });
});
