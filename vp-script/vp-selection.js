
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

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes || !diagram.enableSelection)
        return;

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
                else
                    shape.style.opacity = 1;
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            let shape = findTargetShape(shapeId);
            if (shape) {
                if (haveSvgfilters)
                    shape.setAttribute('filter', 'url(#select)');
                else
                    shape.style.opacity = 0.5;
            }
        }
    };

    $("div.svg").on('click', function () {
        diagram.setSelection();
    });

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        let shape = findTargetShape(shapeId);
        if (!shape)
            return;

        shape.style.cursor = 'pointer';

        shape.addEventListener('click', function (evt) {
            evt.stopPropagation();
            diagram.setSelection(shapeId);
        });

        // hover support
        if (haveSvgfilters && !info.DefaultLink) {
            shape.addEventListener('mouseover', function () {
                if (diagram.selectedShapeId !== shapeId)
                    shape.setAttribute('filter', 'url(#hover)');
            });
            shape.addEventListener('mouseout', function () {
                if (diagram.selectedShapeId !== shapeId)
                    shape.removeAttribute('filter');
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
