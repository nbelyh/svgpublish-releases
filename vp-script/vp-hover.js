
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {

    var settings = diagram.settings || {};

    if (!diagram.shapes || !settings.enableHover)
        return;

    //TODO: consolidate when migrating from jQuery
    function findTargetShape(shapeId) {
        var shape = document.getElementById(shapeId);

        var info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (var i = 0; i < shape.children.length; ++i) {
            var child = shape.children[i];
            if (child.textContent.indexOf(info.ContainerText) >= 0)
                return child;
        }
    }

    $.each(diagram.shapes, function (shapeId) {

        var info = diagram.shapes[shapeId];
        if (info.DefaultLink
            || info.Props && Object.keys(info.Props).length
            || info.Links && info.Links.length
            || info.Comment || info.PopoverMarkdown || info.SidebarMarkdown || info.TooltipMarkdown
        ) {
            var shape = findTargetShape(shapeId);
            if (!shape)
                return;

            // hover support
            var filter = (settings.enableFollowHyperlinks && info.DefaultLink) ? 'url(#hyperlink)' : 'url(#hover)';

            shape.addEventListener('mouseover', function (event) {
                if (!diagram.highlightedShapeIds[shapeId]) {
                    var hyperlinkColor = settings.hyperlinkColor || "rgba(0, 0, 255, 0.2)";
                    var hoverColor = settings.hoverColor || "rgba(255, 255, 0, 0.2)";
                    var color = (settings.enableFollowHyperlinks && info.DefaultLink) ? hyperlinkColor : hoverColor;
                    diagram.setShapeHighlight(shape, filter, color);
                }
            });

            shape.addEventListener('mouseout', function () {
                if (!diagram.highlightedShapeIds[shapeId]) {
                    diagram.removeShapeHighlight(shape, false);
                }
            });
        }
    });
})(window.svgpublish);
