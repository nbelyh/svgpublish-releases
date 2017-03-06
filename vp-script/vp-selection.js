
(function (diagram) {
    diagram.selectionChanged = $.Callbacks();
})(window.svgpublish);

$(document).ready(function () {

    var diagram = window.svgpublish;

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes || !diagram.enableSelection)
        return;

    diagram.setSelection = function(shapeId) {
        
        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            if (haveSvgfilters)
                $("#" + diagram.selectedShapeId).removeAttr('filter');
            else
                $("#" + diagram.selectedShapeId).css('opacity', 1);

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            if (haveSvgfilters)
                $("#" + shapeId).attr('filter', 'url(#select)');
            else
                $("#" + shapeId).css('opacity', '0.5');
        }
    }

    $("div.svg").on('click', function () {
     	diagram.setSelection();
   	});

    $.each(diagram.shapes, function (shapeId) {

        var $shape = $("#" + shapeId);

        $shape.css("cursor", 'pointer');

        $shape.on('click', function (evt) {
            evt.stopPropagation();
            var thisId = $(this).attr('id');
            diagram.setSelection(thisId);
        });

        // hover support
        if (haveSvgfilters) {
            $shape.on('mouseover', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId && !diagram.shapes[thisId].DefaultLink)
                    $(this).attr('filter', 'url(#hover)');
            });
            $shape.on('mouseout', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId && !diagram.shapes[thisId].DefaultLink)
                    $(this).removeAttr('filter');
            });
        }
    });
});
