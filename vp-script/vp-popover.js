
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enablePopovers) {
        return;
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $("#" + shapeId);

        var title = diagram.enablePopoverHtml ? Mustache.render($('#popover-title-template').html(), shape) : shape.Text;
        var content = diagram.enablePopoverHtml ? Mustache.render($('#popover-content-template').html(), shape) : shape.Comment;
        var placement = diagram.popoverPlacement || "auto top";

        if (!content)
            return;

        $shape.popover({
            title: title,
            content: content,
            placement: placement,
            container: "body",
            html: true
        });
    });
});
