﻿
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {

    if (!diagram.shapes || !diagram.enableProps)
        return;

    var selectedProps = diagram.selectedProps && diagram.selectedProps.split(',') || [];

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

            for (var propName in shape.Props) {

                if (selectedProps.length > 0 && selectedProps.indexOf(propName) < 0) {
                    continue;
                }

                var propValue = shape.Props[propName] || "";

                if (typeof (propValue) === "string" && (propValue.indexOf("https://") >= 0 || propValue.indexOf("http://") >= 0)) {
                    var a = document.createElement("a");
                    a.href = propValue;
                    if (diagram.openHyperlinksInNewWindow)
                        a.target = '_blank';
                    a.textContent = propValue;
                    propValue = a.outerHTML;
                }

                $tbody.append($('<tr />')
                    .append($("<td />").text(propName))
                    .append($("<td />").html(propValue))
                );
            }
        }

        $("#panel-props").html($html);
    }

    diagram.selectionChanged.add(showShapeProperties);
})(window.svgpublish);
