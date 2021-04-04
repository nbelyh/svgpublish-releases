
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

    if (!diagram.shapes || !diagram.enableSelection)
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

    diagram.setSelection = function (shapeId) {

        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            let shape = findTargetShape(diagram.selectedShapeId);
            if (shape) {
                if (haveSvgfilters)
                    shape.removeAttribute('filter');
                else {
                    let selectionBox = document.getElementById("vp-selection-box");
                    if (selectionBox) {
                        selectionBox.remove();
                    }
                    let hoverBox = document.getElementById("vp-hover-box");
                    if (hoverBox) {
                        hoverBox.remove();
                    }
                }
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            let shape = findTargetShape(shapeId);
            if (shape) {
                if (haveSvgfilters) {
                    shape.setAttribute('filter', 'url(#select)');
                } else {

                    let hoverBox = document.getElementById("vp-hover-box");
                    if (hoverBox) {
                        hoverBox.remove();
                    }
                    let selectionBox = document.getElementById("vp-selection-box");
                    if (selectionBox) {
                        selectionBox.remove();
                    }

                    var rect = shape.getBBox();

                    if (diagram.filter && diagram.filter.enableDilate) {

                        var dilate = +diagram.filter.dilate || 4;

                        rect.x -= dilate / 2;
                        rect.width += dilate;
                        rect.y -= dilate / 2;
                        rect.height += dilate;
                    }

                    var selectColor = diagram.filter && diagram.filter.selectColor || "rgba(255, 255, 0, 0.4)";

                    let box = document.createElementNS(SVGNS, "rect");
                    box.id = "vp-selection-box";
                    box.setAttribute("x", rect.x);
                    box.setAttribute("y", rect.y);
                    box.setAttribute("width", rect.width);
                    box.setAttribute("height", rect.height);
                    box.style.fill = (diagram.filter && diagram.filter.mode === 'normal') ? 'none' : selectColor;
                    box.style.stroke = selectColor;
                    box.style.strokeWidth = dilate || 0;
                    shape.appendChild(box);
                }
            }
        }
    };

    $("div.svg").on('click', function () {
        diagram.setSelection();
    });

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

            shape.style.cursor = 'pointer';

            shape.addEventListener('click', function (evt) {
                evt.stopPropagation();
                diagram.setSelection(shapeId);
            });
        }
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    diagram.highlightShape = function (shapeId) {
        $("#" + shapeId).fadeTo(300, 0.3).fadeTo(300, 1).fadeTo(300, 0.3).fadeTo(300, 1);
        diagram.setSelection(shapeId);
    };

    function processHash() {
        var shape = getUrlParameter('shape');
        if (shape) {
            diagram.highlightShape(shape);
        }
    }

    processHash();
    $(window).on('hashchange', processHash);
});
