$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableTooltips) {
        return;
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        if (!shape.Comment)
            return;

        var $shape = $("#" + shapeId);

        $shape.tooltip({
            container: "body",
            title: shape.Comment
        });
    });
});
