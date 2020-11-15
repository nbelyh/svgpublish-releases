
//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableProps)
        return;
    
    $("#shape-props").show();

    function showShapeProperties(thisShapeId) {

        var shape = diagram.shapes[thisShapeId];

        var labelnodata = $("#panel-props").data('labelnodata') || 'No Shape Data';
        var $html = $('<span>' + labelnodata + '</span>');

        if (shape) {

            $html = $("<table class='table table-bordered table-striped' />");

            var $thead = $html.append($('<thead />'));
            var $tbody = $html.append($('<tbody />'));

            var labelproperty = $("#panel-props").data('labelproperty') || 'Property';
            var labelvalue = $("#panel-props").data('labelvalue') || 'Value';

            $thead.append($('<tr />')
                .append($('<th />').text(labelproperty))
                .append($('<th />').text(labelvalue))
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

    diagram.selectionChanged.add(showShapeProperties);
});
