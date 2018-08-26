
//-----------------------------------------------------------------------
// Copyright (c) 2017-2018 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/* globals: jQuery, $ */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableTooltips) {
        return;
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $("#" + shapeId);

        var tip = diagram.enableTooltipHtml ? Mustache.render($('#tooltip-template').html(), shape) : shape.Comment;
        var placement = diagram.tooltipPlacement || "auto top";

        if (!tip)
            return;

        var options = {
            container: "body",
            html: true,
            title: tip,
            placement: placement
        };

        if (diagram.tooltipTrigger) {
            options.trigger = diagram.tooltipTrigger;
        }

        if (diagram.tooltipTimeout) {
            options.delay = {
                show: diagram.tooltipTimeoutShow || undefined,
                hide: diagram.tooltipTimeoutHide || undefined
            }
        }

        $shape.tooltip(options);
    });

    if (diagram.tooltipOutsideClick) {
        $('div.svg').mouseup(function(e) {
            $.each(diagram.shapes,
                function(shapeId) {
                    var $shape = $("#" + shapeId);
                    if (!$shape.is(e.target) &&
                        $shape.has(e.target).length === 0 &&
                        $('.tooltip').has(e.target).length === 0) {
                        (($shape.tooltip('hide').data('bs.tooltip') || {}).inState || {}).click = false; // fix for BS 3.3.7
                    }
                });
        });
    }

});
