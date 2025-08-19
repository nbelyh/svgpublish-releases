
/*global jQuery, $ */

(function (diagram) {

    var SVGNS = 'http://www.w3.org/2000/svg';

    var settings = diagram.settings || {};

    // compatibility with version 0.x
    diagram.diagramData = diagram.shapes;

    diagram.selectionChanged = $.Callbacks();

    if (settings.enableAutoFrameHeight) {
        var iframe = window.top.document.getElementById(window.name);
        if (iframe) {
            var wp = iframe.parentElement;
            var rc = wp.getBoundingClientRect();
            wp.style.height = 'calc(100vh - ' + rc.top + 'px)';
        }
    }

    var enableBoxSelection = settings.enableBoxSelection;

    function getMarkerId(markerUrl) {
        const match = markerUrl.match(/url\("(.*)"\)/);
        return match && match[1];
    }

    function replaceMarker(oldId, newId, selectionColor) {
        const markerNode = document.querySelector(oldId);
        if (markerNode) {
            const markerNodeClone = markerNode.cloneNode(true);
            markerNodeClone.id = newId;
            markerNodeClone.style.stroke = selectionColor;
            markerNodeClone.style.fill = selectionColor;
            markerNode.parentElement.appendChild(markerNodeClone);
        }
    }

    diagram.setConnHighlight = function (shape, selectionColor) {

        diagram.removeConnHighlight(shape);

        var path = shape.querySelector('path');
        if (path) {

            const style = getComputedStyle(path);

            var pathClone = path.cloneNode(true);
            pathClone.id = "vp-path-" + shape.id;
            pathClone.style.stroke = selectionColor;

            if (settings.enableConnDilate) {
                const strokeWidth = parseFloat(style.strokeWidth) + (+settings.connDilate || 2);
                pathClone.style.strokeWidth = strokeWidth;
            }

            pathClone.style.pointerEvents = 'none';

            const markerEndId = getMarkerId(style.markerEnd);
            if (markerEndId) {
                replaceMarker(markerEndId, "vp-marker-end-" + shape.id, selectionColor);
                pathClone.style.markerEnd = 'url("#vp-marker-end-' + shape.id + '")';
            }
            const markerStartId = getMarkerId(style.markerStart);
            if (markerStartId) {
                replaceMarker(markerStartId, "vp-marker-start-" + shape.id, selectionColor);
                pathClone.style.markerStart = 'url("#vp-marker-start-' + shape.id + '")';
            }

            shape.appendChild(pathClone);
        }
    }

    function removeElementById(markerId) {
        const elem = document.getElementById(markerId);
        if (elem) {
            elem.parentElement.removeChild(elem);
        }
    }

    diagram.removeConnHighlight = function (shape) {
        removeElementById("vp-path-" + shape.id);
        removeElementById("vp-marker-end-" + shape.id);
        removeElementById("vp-marker-start-" + shape.id);
    }

    diagram.setShapeHighlight = function (shape, filter, selectionColor) {

        if (enableBoxSelection) {

            diagram.removeShapeHighlight(shape);

            var rect = shape.getBBox();
            var x = rect.x;
            var y = rect.y;
            var width = rect.width;
            var height = rect.height;

            if (settings.enableDilate) {

                var dilate = +settings.dilate || 4;

                x -= dilate / 2;
                width += dilate;
                y -= dilate / 2;
                height += dilate;
            }

            var box = document.createElementNS(SVGNS, "rect");
            box.id = "vp-box-" + shape.id;
            box.setAttribute("x", x);
            box.setAttribute("y", y);
            box.setAttribute("width", width);
            box.setAttribute("height", height);
            box.style.fill = (settings.selectionMode === 'normal') ? 'none' : selectionColor;
            box.style.stroke = selectionColor;
            box.style.strokeWidth = dilate || 0;
            box.style.pointerEvents = 'none';
            shape.appendChild(box);
        } else {
            shape.setAttribute('filter', filter);
        }
    }

    diagram.removeShapeHighlight = function (shape) {
        if (enableBoxSelection) {

            const box = document.getElementById("vp-box-" + shape.id);
            if (box) {
                box.parentElement.removeChild(box);
            }

        } else {
            shape.removeAttribute('filter');
        }
    }
})(window.svgpublish);
