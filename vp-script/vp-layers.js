
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

    function getLayerIndex(layerName) {
        var layer = diagram.layers.filter(function (item) { return item.Name === layerName; })[0];
        return layer ? layer.Index : -1;
    }

    function setLayerVisibleByIndex(layerIndex, set) {
        $.each(diagram.shapes, function (shapeId, shape) {

            if (!shape.Layers || shape.Layers.indexOf(layerIndex) < 0)
                return;

            var $shape = $("#" + shapeId);
            if (set)
                $shape.show();
            else
                $shape.hide();
        });
    }

    function isLayerVisibleByIndex(layerIndex) {
        return !!$("#panel-layers")
            .find("input[data-layer='" + layerIndex + "']")
            .bootstrapSwitch('state');
    }

    var $table = $("<table class='table borderless' />");

    $.each(diagram.layers, function (i, layer) {

        var $check = $("<input type='checkbox' data-layer='" + layer.Index + "' checked><span style='margin-left:1em'>" + layer.Name + "</span></input>");

        $check.on("change.bootstrapSwitch", function (e) {
            var layerIndex = $(e.target).data("layer");
            setLayerVisibleByIndex(layerIndex, !isLayerVisibleByIndex(layerIndex));
        });

        $table
            .append($("<tr>")
            .append($("<td>")
            .append($check)));
    });

    diagram.isLayerVisible = function(layerName) {
        var layerIndex = getLayerIndex(layerName);
        return (layerIndex >= 0) ? isLayerVisibleByIndex(layerIndex) : false;
    }

    diagram.setLayerVisible = function(layerName, set) {
        var layerIndex = getLayerIndex(layerName);
        if (layerIndex >= 0) {
            if (isLayerVisibleByIndex(layerIndex) === set)
                return;

            setLayerVisibleByIndex(layerIndex, set);
            $("#panel-layers")
                .find("input[data-layer='" + layerIndex + "']")
                .bootstrapSwitch('state', set);
        }
    }

    $("#panel-layers").html($table);

    $("#panel-layers").find("input")
        .bootstrapSwitch({ size: "small", labelWidth: 0 });
});
