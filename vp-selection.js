
$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableSelection)
        return;

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    diagram.clearSelection = function() {
        
        if (haveSvgfilters)
            $("#" + diagram.selectedShapeId).removeAttr('filter');
        else
            $("#" + diagram.selectedShapeId).css('opacity', 1);

		delete diagram.selectedShapeId;
    }
    
    diagram.setSelection = function(elem) {
        
        diagram.selectedShapeId = $(elem).attr('id');
        if (haveSvgfilters)
            $(elem).attr('filter', 'url(#select)');
        else
            $(elem).css('opacity', '0.5');
    }

    $("div.svg").on('click', function () {
     	diagram.clearSelection();
   	});

    $.each(diagram.shapes, function (shapeId) {

        var $shape = $("#" + shapeId);

        $shape.css("cursor", 'pointer');

        $shape.on('click', function (evt) {
                evt.stopPropagation();
                diagram.clearSelection();
                diagram.setSelection(this);
        });

        if (haveSvgfilters) {
            $shape.on('mouseover', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId) {
                    var thisDhapeData = diagram.shapes[thisId];
                    $(this).attr('filter', thisDhapeData.DefaultLink ? 'url(#hyperlink)' : 'url(#hover)');
                }
            });
            $shape.on('mouseout', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId) {
                    $(this).removeAttr('filter');
                }
            });
        }
    });
});
