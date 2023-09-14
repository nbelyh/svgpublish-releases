
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {

    if (!diagram.shapes || !diagram.enableSelection)
        return;

    diagram.highlightedShapeIds= {};

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

    diagram.setSelection = function (shapeId) {

        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            var selectedShape = findTargetShape(diagram.selectedShapeId);
            if (selectedShape) {
                diagram.removeShapeHighlight(selectedShape);
                delete diagram.highlightedShapeIds[shapeId];
                var info = diagram.shapes[diagram.selectedShapeId];

                if (diagram.selectionView && diagram.selectionView.enableNextShapeColor && info.ConnectedTo) {
                    info.ConnectedTo.forEach(function (item) {
                        var itemToSelect = findTargetShape(item);
                        diagram.removeShapeHighlight(itemToSelect);
                        delete diagram.highlightedShapeIds[shapeId];
                    });
                }

                if (diagram.selectionView && diagram.selectionView.enablePrevShapeColor && info.ConnectedFrom) {
                    info.ConnectedFrom.forEach(function (item) {
                        var itemToSelect = findTargetShape(item);
                        diagram.removeShapeHighlight(itemToSelect);
                        delete diagram.highlightedShapeIds[shapeId];
                    });
                }
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.highlightedShapeIds = {};
            diagram.selectionChanged.fire(shapeId);

            var shapeToSelect = findTargetShape(shapeId);
            if (shapeToSelect) {
                var info = diagram.shapes[shapeId];

                if (diagram.selectionView && diagram.selectionView.enableNextShapeColor && info.ConnectedTo) {
                    info.ConnectedTo.forEach(function (itemId) {
                        var itemToSelect = findTargetShape(itemId);
                        var nextColor = diagram.selectionView && diagram.selectionView.nextShapeColor || "rgba(255, 255, 0, 0.4)";
                        diagram.setShapeHighlight(itemToSelect, 'url(#next)', nextColor);
                        diagram.highlightedShapeIds[itemId] = true;
                    });
                }

                if (diagram.selectionView && diagram.selectionView.enablePrevShapeColor && info.ConnectedFrom) {
                    info.ConnectedFrom.forEach(function (itemId) {
                        var itemToSelect = findTargetShape(itemId);
                        var prevColor = diagram.selectionView && diagram.selectionView.prevShapeColor || "rgba(255, 255, 0, 0.4)";
                        diagram.setShapeHighlight(itemToSelect, 'url(#prev)', prevColor);
                        diagram.highlightedShapeIds[itemId] = true;
                    });
                }

                var selectColor = diagram.selectionView && diagram.selectionView.selectColor || "rgba(255, 255, 0, 0.4)";
                diagram.setShapeHighlight(shapeToSelect, 'url(#select)', selectColor);
                diagram.highlightedShapeIds[shapeId] = true;
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
            || diagram.selectionView && diagram.selectionView.enableNextShapeColor && info.ConnectedTo
            || diagram.selectionView && diagram.selectionView.enablePrevShapeColor && info.ConnectedFrom
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
})(window.svgpublish);
