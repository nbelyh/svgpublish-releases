
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $ */
(function (diagram) {

    var NS = "http://www.w3.org/2000/svg";

    if (!diagram.shapes || !diagram.enableContainerTip)
        return;

    var tip = document.getElementById("container-tip");
    var labelSwimlane = tip.dataset.labelswimlane || 'Swimlane';
    var labelPhase = tip.dataset.labelphase || 'Phase';
    var labelContainer = tip.dataset.labelcontainer || 'Container';

    function localize(category) {
        if (category === 'Swimlane')
            return labelSwimlane;
        if (category === 'Phase')
            return labelPhase;
        return labelContainer;
    }

    var containers = [];
    for (var shapeId in diagram.shapes) {
        var shape = document.getElementById(shapeId);
        var info = diagram.shapes[shapeId];
        if (info.IsContainer)
            containers.push({ shape: shape, info: info });
    }

    function updateContainerTips(evt) {
        var html = "";
        for (var i = 0; i < containers.length; ++i) {
            var container = containers[i];
            var info = container.info;
            if (info.ContainerCategories && info.ContainerText) {
                var shape = container.shape;
                var bbox = shape.getBoundingClientRect();
                var x = evt.clientX;
                var y = evt.clientY;
                if (bbox.left <= x && x <= bbox.right && bbox.top <= y && y <= bbox.bottom) {
                    html += "<div>" + localize(info.ContainerCategories) + ": <strong>" + info.ContainerText + "</strong></div>";
                }
            }
        }
        tip.innerHTML = html;
    }

    var maxWidth = 0;
    var maxHeight = 0;
	containers.forEach(function(container) {
        var bbox = container.shape.getBBox();
        if (maxWidth < bbox.width)
            maxWidth = bbox.width;
        if (maxHeight < bbox.height)
            maxHeight = bbox.height;
    });

	containers.forEach(function(container) {
        var info = container.info;
        var shape = container.shape;

        var categories = info.ContainerCategories;
        if (categories) {
            if (categories === "Swimlane" || categories === "Phase") {
                var bbox = shape.getBBox();
                var rect = document.createElementNS(NS, "rect");
                rect.setAttribute("x", bbox.x);
                rect.setAttribute("y", bbox.y);

                if (info.ContainerCategories === "Swimlane") {
                    rect.setAttribute("height", maxWidth);
                } else {
                    rect.setAttribute("width", bbox.width);
                }

                if (info.ContainerCategories === "Phase") {
                    rect.setAttribute("height", maxHeight);
                } else {
                    rect.setAttribute("height", bbox.height);
                }
                // rect.setAttribute('fill', '#ffffff00');
                // rect.setAttribute('stroke', 'red');
                shape.appendChild(rect);
            }

            shape.addEventListener('mousemove', updateContainerTips);
            shape.addEventListener('mouseout', updateContainerTips);
        }
    });
})(window.svgpublish);