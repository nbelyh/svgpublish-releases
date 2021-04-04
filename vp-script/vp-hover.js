
//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
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

    var haveSvgfilters = !diagram.enableBoxSelection;
    var SVGNS = 'http://www.w3.org/2000/svg';

    //TODO: consolidate when migrating from jQuery
    function findTargetShape(shapeId) {
        let shape = document.getElementById(shapeId);

        let info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (var i = 0; i < shape.children.length; ++i) {
            let child = shape.children[i];
            if (child.textContent.indexOf(info.ContainerText) >= 0)
                return child;
        }
    }

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        if (info.DefaultLink
            || info.Props && Object.keys(info.Props).length
            || info.Links && info.Links.length
            || info.Comment || info.PopoverMarkdown || info.SidebarMarkdown || info.TooltipMarkdown
        ) {
            let shape = findTargetShape(shapeId);
            if (!shape)
                return;

            // hover support
            if (haveSvgfilters) {

                var filter = (diagram.enableFollowHyperlinks && info.DefaultLink) ? 'url(#hyperlink)' : 'url(#hover)';

                shape.addEventListener('mouseover', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.setAttribute('filter', filter);
                });
                shape.addEventListener('mouseout', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.removeAttribute('filter');
                });

            } else {

                shape.addEventListener('mouseover', function (event) {
                    var e = event.toElement || event.relatedTarget;
                    if (e.parentNode === shape) {
                        return;
                    }
                    if (diagram.selectedShapeId !== shapeId) {
                        var rect = shape.getBBox();

                        if (diagram.filter && diagram.filter.enableDilate) {

                            var dilate = +diagram.filter.dilate || 4;

                            rect.x -= dilate / 2;
                            rect.width += dilate;
                            rect.y -= dilate / 2;
                            rect.height += dilate;
                        }

                        var hyperlinkColor = diagram.filter && diagram.filter.hyperlinkColor || "rgba(0, 0, 255, 0.2)";
                        var hoverColor = diagram.filter && diagram.filter.hoverColor || "rgba(255, 255, 0, 0.2)";

                        var color = (diagram.enableFollowHyperlinks && info.DefaultLink) ? hyperlinkColor : hoverColor;

                        let box = document.createElementNS(SVGNS, "rect");
                        box.id = "vp-hover-box";
                        box.setAttribute("x", rect.x);
                        box.setAttribute("y", rect.y);
                        box.setAttribute("width", rect.width);
                        box.setAttribute("height", rect.height);
                        box.style.fill = (diagram.filter && diagram.filter.mode === 'normal') ? 'none' : color;
                        box.style.stroke = color;
                        box.style.strokeWidth = dilate || 0;
                        shape.appendChild(box);
                    }
                });
                shape.addEventListener('mouseout', function (event) {
                    var e = event.toElement || event.relatedTarget;
                    if (e.parentNode === shape) {
                        return;
                    }
                    if (diagram.selectedShapeId !== shapeId) {
                        let box = document.getElementById("vp-hover-box");
                        if (box) {
                            box.remove();
                        }
                    }
                });
            }
        }
    });
});
