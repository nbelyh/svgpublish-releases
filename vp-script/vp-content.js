
/*global jQuery, $ */

// compatibility with version 0.x
if (window.svgpublish)
    window.svgpublish.diagramData = window.svgpublish.shapes;

(function (diagram) {

    var SVGNS = 'http://www.w3.org/2000/svg';

    var settings = diagram.settings || {};

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

    $.each(diagram.shapes, function (shapeId, shape) {

        var node = findTargetShape(shapeId);

        var contentMarkdown = shape.ContentMarkdown || (settings.enableContentMarkdown && settings.contentMarkdown) || '';
        var content = contentMarkdown && marked.parseInline(Mustache.render(contentMarkdown, shape)).trim();

        if (!content)
            return;

        var rect = node.getBBox();
        var x = rect.x;
        var y = rect.y;
        var width = rect.width;
        var height = rect.height;

        var box = document.createElementNS(SVGNS, "foreignObject");
        box.setAttribute("x", x);
        box.setAttribute("y", y);
        box.setAttribute("width", width);
        box.setAttribute("height", height);
        node.appendChild(box);

        box.innerHTML = content;
    });
})(window.svgpublish);
