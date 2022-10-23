
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {
    diagram.selectionChanged = $.Callbacks();
})(window.svgpublish);

$(document).ready(function () {

    var diagram = window.svgpublish;

    if (!diagram.shapes || !diagram.enableHover)
        return;

    var enableBoxSelection = diagram.selectionView && diagram.selectionView.enableBoxSelection;
    var SVGNS = 'http://www.w3.org/2000/svg';

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
            if (enableBoxSelection) {

                shape.addEventListener('mouseover', function (event) {
                    if (diagram.selectedShapeId !== shapeId) {

                        var rect = shape.getBBox();
                        var x = rect.x;
                        var y = rect.y;
                        var width = rect.width;
                        var height = rect.height;

                        if (diagram.selectionView && diagram.selectionView.enableDilate) {

                            var dilate = +diagram.selectionView.dilate || 4;

                            x -= dilate / 2;
                            width += dilate;
                            y -= dilate / 2;
                            height += dilate;
                        }

                        var hyperlinkColor = diagram.selectionView && diagram.selectionView.hyperlinkColor || "rgba(0, 0, 255, 0.2)";
                        var hoverColor = diagram.selectionView && diagram.selectionView.hoverColor || "rgba(255, 255, 0, 0.2)";

                        var color = (diagram.enableFollowHyperlinks && info.DefaultLink) ? hyperlinkColor : hoverColor;

                        var box = document.createElementNS(SVGNS, "rect");
                        box.id = "vp-hover-box";
                        box.setAttribute("x", x);
                        box.setAttribute("y", y);
                        box.setAttribute("width", width);
                        box.setAttribute("height", height);
                        box.setAttribute("pointer-events", "none");
                        box.style.fill = (diagram.selectionView && diagram.selectionView.mode === 'normal') ? 'none' : color;
                        box.style.stroke = color;
                        box.style.strokeWidth = dilate || 0;
                        shape.appendChild(box);
                    }
                });
                shape.addEventListener('mouseout', function (event) {
                    if (diagram.selectedShapeId !== shapeId) {
                        var box = document.getElementById("vp-hover-box");
                        if (box) {
                            box.parentNode.removeChild(box);
                        }
                    }
                });
            } else {

                var filter = (diagram.enableFollowHyperlinks && info.DefaultLink) ? 'url(#hyperlink)' : 'url(#hover)';

                shape.addEventListener('mouseover', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.setAttribute('filter', filter);
                });
                shape.addEventListener('mouseout', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.removeAttribute('filter');
                });

            }
        }
    });
});
