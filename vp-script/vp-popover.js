
//-----------------------------------------------------------------------
// Copyright (c) 2017-2018 Nikolay Belykh unmanagedvisio.com All rights reserved.
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

        var options = {
            title: title,
            content: content,
            placement: placement,
            container: "body",
            html: true
        };

        if (diagram.popoverTrigger) {
            options.trigger = diagram.popoverTrigger;
        };

        if (diagram.popoverTimeout) {
            options.delay = {
                show: diagram.popoverTimeoutShow || undefined,
                hide: diagram.popoverTimeoutHide || undefined
            }
        }

        $shape.popover(options);
    });

    if (diagram.popoverOutsideClick) {
        $('div.svg').mouseup(function(e) {
            $.each(diagram.shapes,
                function(shapeId) {
                    var $shape = $("#" + shapeId);
                    if (!$shape.is(e.target) &&
                        $shape.has(e.target).length === 0 &&
                        $('.popover').has(e.target).length === 0) {
                        (($shape.popover('hide').data('bs.popover') || {}).inState || {}).click = false; // fix for BS 3.3.7
                    }
                });
        });
    }

});
