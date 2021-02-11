
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
                shape.addEventListener('mouseover', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.setAttribute('filter', info.DefaultLink ? 'url(#hyperlink)' : 'url(#hover)');
                });
                shape.addEventListener('mouseout', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.removeAttribute('filter');
                });

            } else {

                shape.addEventListener('mouseover', function () {
                    if (diagram.selectedShapeId !== shapeId) {
                        var rect = shape.getBBox();

                        rect.x -= 5;
                        rect.width += 10;
                        rect.y -= 5;
                        rect.height += 10;

                        let box = document.createElementNS(SVGNS, "rect");
                        box.id = "vp-hover-box";
                        box.setAttribute("x", rect.x);
                        box.setAttribute("y", rect.y);
                        box.setAttribute("width", rect.width);
                        box.setAttribute("height", rect.height);
                        box.style.fill = "none";
                        box.style.stroke = info.DefaultLink ? "rgba(255, 0, 255, 0.4)" : "rgba(255, 255, 0, 0.4)";
                        box.style.strokeWidth = 5;
                        shape.appendChild(box);
                    }
                });
                shape.addEventListener('mouseout', function () {
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
