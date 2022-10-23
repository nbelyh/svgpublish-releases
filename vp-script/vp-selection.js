
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

    if (!diagram.shapes || !diagram.enableSelection)
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

    function deselectBox() {
        var hoverBox = document.getElementById("vp-hover-box");
        if (hoverBox) {
            hoverBox.parentNode.removeChild(hoverBox);
        }
        var selectionBox = document.getElementById("vp-selection-box");
        if (selectionBox) {
            selectionBox.parentNode.removeChild(selectionBox);
        }
    }

    diagram.setSelection = function (shapeId) {

        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            var selectedShape = findTargetShape(diagram.selectedShapeId);
            if (selectedShape) {
                if (enableBoxSelection) {
					deselectBox();
                } else {
                    selectedShape.removeAttribute('filter');
                }
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            var shapeToSelect = findTargetShape(shapeId);
            if (shapeToSelect) {
                if (enableBoxSelection) {

                    deselectBox();

                    var rect = shapeToSelect.getBBox();
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

                    var selectColor = diagram.selectionView && diagram.selectionView.selectColor || "rgba(255, 255, 0, 0.4)";

                    var box = document.createElementNS(SVGNS, "rect");
                    box.id = "vp-selection-box";
                    box.setAttribute("x", x);
                    box.setAttribute("y", y);
                    box.setAttribute("width", width);
                    box.setAttribute("height", height);
                    box.style.fill = (diagram.selectionView && diagram.selectionView.mode === 'normal') ? 'none' : selectColor;
                    box.style.stroke = selectColor;
                    box.style.strokeWidth = dilate || 0;
                    shapeToSelect.appendChild(box);
                } else {
                    shapeToSelect.setAttribute('filter', 'url(#select)');
                }
            }
        }
    };

    $("div.svg").on('click', function () {
        diagram.setSelection();
    });

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
