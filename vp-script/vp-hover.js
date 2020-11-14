
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

    if (!diagram.shapes || !diagram.enableHover)
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

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        if (info.DefaultLink
            || info.Props && info.Props.length
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
            }
        }
    });
});
