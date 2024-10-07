
/*global jQuery, $ */

(function (diagram) {

    var SVGNS = 'http://www.w3.org/2000/svg';

    // compatibility with version 0.x
    diagram.diagramData = diagram.shapes;

    diagram.selectionChanged = $.Callbacks();

    if (diagram.enableAutoFrameHeight) {
        var iframe = window.top.document.getElementById(window.name);
        if (iframe) {
            var wp = iframe.parentElement;
            var rc = wp.getBoundingClientRect();
            wp.style.height = 'calc(100vh - ' + rc.top + 'px)';
        }
    }

    var enableBoxSelection = diagram.selectionView && diagram.selectionView.enableBoxSelection;

    function getMarkerId(markerUrl) {
        const match = markerUrl.match(/url\("(.*)"\)/);
        return match && match[1];
    }

    function replaceMarker(oldId, newId, selectColor) {
        const markerNode = document.querySelector(oldId);
        if (markerNode) {
            const markerNodeClone = markerNode.cloneNode(true);
            markerNodeClone.id = newId;
            markerNodeClone.style.stroke = selectColor;
            markerNodeClone.style.fill = selectColor;
            markerNode.parentElement.appendChild(markerNodeClone);
        }
    }

    diagram.setConnHighlight = function (shape, selectColor) {

        diagram.removeShapeHighlight(shape);

        var path = shape.querySelector('path');
        if (path) {

            const style = getComputedStyle(path);

            var pathClone = path.cloneNode(true);
            pathClone.id = "vp-path-" + shape.id;
            pathClone.style.stroke = selectColor;

            if (diagram.selectionView.enableConnDilate) {
                const strokeWidth = parseFloat(style.strokeWidth) + (+diagram.selectionView.connDilate || 2);
                pathClone.style.strokeWidth = strokeWidth;
            }

            pathClone.style.pointerEvents = 'none';

            const markerEndId = getMarkerId(style.markerEnd);
            if (markerEndId) {
                replaceMarker(markerEndId, "vp-marker-end-" + shape.id, selectColor);
                pathClone.style.markerEnd = 'url("#vp-marker-end-' + shape.id + '")';
            }
            const markerStartId = getMarkerId(style.markerStart);
            if (markerStartId) {
                replaceMarker(markerStartId, "vp-marker-start-" + shape.id, selectColor);
                pathClone.style.markerStart = 'url("#vp-marker-start-' + shape.id + '")';
            }

            shape.appendChild(pathClone);
        }
    }

    function removeMarker(shape, markerId) {
        const markerClone = document.getElementById(markerId);
        if (markerClone) {
            markerClone.parentElement.removeChild(markerClone);
        }
    }

    diagram.removeConnHighlight = function (shape) {
        const pathClone = document.getElementById("vp-path-" + shape.id);
        if (pathClone) {
            pathClone.parentElement.removeChild(pathClone);
        }
        removeMarker(shape, "vp-marker-end-" + shape.id);
        removeMarker(shape, "vp-marker-start-" + shape.id);
    }

    diagram.setShapeHighlight = function (shape, filter, selectColor) {

        if (enableBoxSelection) {

            diagram.removeShapeHighlight(shape);

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

            var box = document.createElementNS(SVGNS, "rect");
            box.id = "vp-box-" + shape.id;
            box.setAttribute("x", x);
            box.setAttribute("y", y);
            box.setAttribute("width", width);
            box.setAttribute("height", height);
            box.style.fill = (diagram.selectionView && diagram.selectionView.mode === 'normal') ? 'none' : selectColor;
            box.style.stroke = selectColor;
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
