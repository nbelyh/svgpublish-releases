
//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.layers || !diagram.enableLayers)
        return;

    $("#shape-layers").show();

    function getLayerByIndex(layerIndex) {
        return diagram.layers.filter(function (item) { return item.Index === layerIndex; })[0];
    }

    function updateShapes() {

        if (!diagram.layers || !diagram.layers.length)
            return;

        $.each(diagram.shapes, function (shapeId, shape) {

            if (!shape.Layers || !shape.Layers.length)
                return;

            var set = diagram.layers.some(function (e) {
                return e.Visible && shape.Layers.indexOf(e.Index) >= 0;
            });

            var $shape = $("#" + shapeId);
            if (set)
                $shape.show();
            else
                $shape.hide();
        });
    }

    var $table = $("<table class='table borderless' />");

    $.each(diagram.layers, function (i, layer) {

        var $check = $("<input type='checkbox' data-layer='" + layer.Index + "' " + (layer.Visible ? 'checked' : '') + "><span style='margin-left:1em'>" + layer.Name + "</span></input>");

        $check.on("change.bootstrapSwitch", function (e) {
            var layerIndex = $(e.target).data("layer");
            var layer = getLayerByIndex(layerIndex);
            layer.Visible = !layer.Visible;
            updateShapes();
        });

        $table
            .append($("<tr>")
                .append($("<td>")
                    .append($check)));
    });

    function getLayerByName(layerName) {
        return diagram.layers.filter(function (item) { return item.Name === layerName; })[0];
    }

    diagram.isLayerVisible = function (layerName) {
        var layer = getLayerByName(layerName);
        return layer && layer.Visible;
    };

    diagram.setLayerVisible = function (layerName, set) {
        var layer = getLayerByName(layerName);
        if (layer) {
            layer.Visible = set;
            updateShapes();
            $("#panel-layers")
                .find("input[data-layer='" + layerIndex + "']")
                .bootstrapSwitch('state', set);
        }
    };

    $("#panel-layers").html($table);

    var ontext = $("#panel-layers").data('ontext') || 'ON';
    var offtext = $("#panel-layers").data('offtext') || 'OFF';

    $("#panel-layers").find("input")
        .bootstrapSwitch({ size: "small", onText: ontext, offText: offtext, labelWidth: 0 });
});
