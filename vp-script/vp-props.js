
$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableProps)
        return;
    
    $("#shape-props").show();

    function showShapeProperties(thisShapeId) {

        var shape = diagram.shapes[thisShapeId];

        var $html = $('<span>No Shape Data</span>');

        if (shape) {

            $html = $("<table class='table table-bordered table-striped' />");

            var $thead = $html.append($('<thead />'));
            var $tbody = $html.append($('<tbody />'));

            $thead.append($('<tr />')
                .append($('<th />').text('Property'))
                .append($('<th />').text('Value'))
            );

            $.each(shape.Props, function(propName, propValue) {

                if (propValue == null)
                    propValue = "";

                $tbody.append($('<tr />')
                    .append($("<td />").text(propName))
                    .append($("<td />").text(propValue))
                );
            });
        }

        $("#panel-props").html($html);
    }

    $("div.svg").on('click', function () {
        showShapeProperties();
    });

    $.each(diagram.shapes, function (shapeId, shape) {

        if (!shape.Props)
            return;

        var $shape = $("#" + shapeId);
        $shape.on('click', function () {
            showShapeProperties($(this).attr('id'));
        });
    });
});
