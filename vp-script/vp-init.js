
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
            box.id = "vp-highlight";
            box.setAttribute("x", x);
            box.setAttribute("y", y);
            box.setAttribute("width", width);
            box.setAttribute("height", height);
            box.style.fill = (diagram.selectionView && diagram.selectionView.mode === 'normal') ? 'none' : selectColor;
            box.style.stroke = selectColor;
            box.style.strokeWidth = dilate || 0;
            shape.appendChild(box);
        } else {
            shape.setAttribute('filter', filter);
        }
    }

    diagram.removeShapeHighlight = function (shape) {
        if (enableBoxSelection) {

            for (var i = 0; i < shape.childNodes.length; ++i) {
                var box = shape.childNodes[i];
                if (box.id === "vp-highlight") {
                    shape.removeChild(box);
                }
            }

        } else {
            shape.removeAttribute('filter');
        }
    }
})(window.svgpublish);
