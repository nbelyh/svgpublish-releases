
//-----------------------------------------------------------------------
// Copyright (c) 2017-2020 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    const NS = "http://www.w3.org/2000/svg";

    var diagram = window.svgpublish || {};

    if (!diagram.shapes || !diagram.enableContainerTip)
        return;

    var tip = document.getElementById("container-tip");
    var labelSwimlane = tip.dataset.labelswimlane || 'Swimlane';
    var labelPhase = tip.dataset.labelphase || 'Phase';
    var labelContainer = tip.dataset.labelcontainer || 'Swimlane';

    function localize(category) {
        if (category === 'Swimlane')
            return labelSwimlane;
        if (category === 'Phase')
            return labelPhase;
        if (category === 'Container')
            return labelContainer;
        return category;
    }

    var containers = [];
    for (var shapeId in diagram.shapes) {
        const shape = document.getElementById(shapeId);
        const info = diagram.shapes[shapeId];
        if (info.IsContainer)
            containers.push({ shape: shape, info: info });
    }

    function updateContainerTips(evt) {
        let html = "";
        for (i = 0; i < containers.length; ++i) {
            const container = containers[i];
            const info = container.info;
            if (info.ContainerCategories && info.ContainerText) {
                const shape = container.shape;
                const bbox = shape.getBoundingClientRect();
                const x = evt.clientX;
                const y = evt.clientY;
                if (bbox.left <= x && x <= bbox.right && bbox.top <= y && y <= bbox.bottom) {
                    html += "<div>" + localize(info.ContainerCategories) + ": <strong>" + info.ContainerText + "</strong></div>";
                }
            }
        }
        tip.innerHTML = html;
    }

    let maxWidth = 0;
    let maxHeight = 0;
    for (i = 0; i < containers.length; ++i) {
        const container = containers[i];
        const bbox = container.shape.getBBox();
        if (maxWidth < bbox.width)
            maxWidth = bbox.width;
        if (maxHeight < bbox.height)
            maxHeight = bbox.height;
    }

    for (i = 0; i < containers.length; ++i) {
        const container = containers[i];
        const info = container.info;
        const shape = container.shape;

        const categories = info.ContainerCategories;
        if (categories) {
            if (categories === "Swimlane" || categories === "Phase") {
                const bbox = shape.getBBox();
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
    }
});
