
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.layers || !diagram.enableLayers)
        return;

    $("#shape-layers").show();

    function setLayerVisible(layerName, set) {

        var layer = diagram.layers.filter(function (item) { return item.Name === layerName; })[0];
        if (!layer)
            return;

        var layerIndex = parseInt(layer.Index);
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

    diagram.setLayerVisible = function (layerName, set) {
        if (diagram.isLayerVisible(layerName) === set)
            return;

        $("#panel-layers")
            .find("input[data-layer='" + layerName + "']")
            .bootstrapSwitch('state', set);
    }

    var $table = $("<table class='table borderless' />");

    $.each(diagram.layers, function (i, layer) {

        var $check = $("<input type='checkbox' data-layer='" + layer.Name + "' checked><span style='margin-left:1em'>" + layer.Name + "</span></input>");

        $check.on("change.bootstrapSwitch", function (e) {
            var name = $(e.target).data("layer");
            setLayerVisible(name, !diagram.isLayerVisible(name));
        });

        $table
            .append($("<tr>")
            .append($("<td>")
            .append($check)));
    });

    $("#panel-layers").html($table);

    $("#panel-layers").find("input")
        .bootstrapSwitch({ size: "small", labelWidth: 0 });

    diagram.isLayerVisible = function (layerName) {
        return !!$("#panel-layers")
            .find("input[data-layer='" + layerName + "']")
            .bootstrapSwitch('state');
    }

});
