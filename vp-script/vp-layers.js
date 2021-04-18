
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

    var enableLayerToggles = diagram.layerView && diagram.layerView.enableLayerToggles;
    var enableLayerShowAll = diagram.layerView && diagram.layerView.enableLayerShowAll;
    var enableLayerSort = diagram.layerView && diagram.layerView.enableLayerSort;

    if (enableLayerShowAll) {
        $("#layer-show-all").on("click", function () {
            diagram.layers && diagram.layers.forEach(function (layer) {
                diagram.setLayerVisible(layer.Name, true);
            });
        });
        $("#layer-hide-all").on("click", function () {
            diagram.layers && diagram.layers.forEach(function (layer) {
                diagram.setLayerVisible(layer.Name, false);
            });
        });
    }

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

    function numericSort(data) {
        var collator = Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return data
            .map(function (x) {
                return x;
            })
            .sort(function (a, b) {
            return collator.compare(a.Name, b.Name);
        });
    }

    function filter(term) {

        var re = new RegExp("(" + term.replace(/([\\.+*?[^\]$(){}=!<>|:])/g, "\\$1") + ")", 'gi');

        var $table = $("<table class='table borderless' />");

        var sortedLayers = enableLayerSort ? numericSort(diagram.layers) : diagram.layers;
        $.each(sortedLayers, function (i, layer) {

            if (term && !re.test(layer.Name))
                return;

            var text = term ? layer.Name.replace(re, "<span class='search-hilight'>$1</span>") : layer.Name;

            var $check = enableLayerToggles
                ? $("<input type='checkbox' data-layer='" + layer.Index + "' " + (layer.Visible ? 'checked' : '') + "><span style='margin-left:1em'>" + text + "</span></input>")
                : $("<div class='checkbox' style='margin-bottom: 0'><label><input type='checkbox' data-layer='" + layer.Index + "' " + (layer.Visible ? 'checked' : '') + ">" + text + "</label></div>");

            var $input = enableLayerToggles
                ? $check
                : $check.find("input");

            $input.on(enableLayerToggles ? 'change.bootstrapSwitch' : 'click', function (e) {
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

        $("#panel-layers").html($table);

        if (enableLayerToggles) {
            var ontext = $("#panel-layers").data('ontext') || 'ON';
            var offtext = $("#panel-layers").data('offtext') || 'OFF';

            $("#panel-layers").find("input")
                .bootstrapSwitch({ size: "small", onText: ontext, offText: offtext, labelWidth: 0 });
        }
    }

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
            var $switch = $("#panel-layers").find("input[data-layer='" + layer.Index + "']");
            if ($switch.length) {
                if (enableLayerToggles) {
                    var state = $switch.bootstrapSwitch('state');
                    if (!!state !== !!set)
                        $switch.bootstrapSwitch('toggleState');
                } else {
                    $switch.prop('checked', set);
                    layer.Visible = set;
                    updateShapes();
                }
            } else {
                layer.Visible = set;
                updateShapes();
            }
        }
    };

    filter('');

    $("#search-layer").on("keyup", function () {

        filter($("#search-layer").val());
        return false;
    });
});
