
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.shapes)
        return;
    
    $("#shape-links").show();

    //TODO: consolidate when migrating from jQuery
    function findTargetShape(shapeId) {
        var shape = document.getElementById(shapeId);

        var info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (var i = 0; i < shape.children.length; ++i) {
            var child = shape.children[i];
            if (child.textContent.indexOf(info.ContainerText) >= 0)
                return child;
        }
    }

    function buildLinkTargetLocation(link) {

        if (link.Address)
            return link.Address;

        var linkPageId = link.PageId;
        if (linkPageId >= 0 && diagram.pages) {
            var targetPage = diagram.pages.filter(function (p) { return p.Id === linkPageId })[0];
            var curpath = location.pathname;
            var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), targetPage.FileName);
            var href = document.location.protocol + "//" + document.location.host + newpath;

            if (link.ShapeId) {
                href += "#?shape=" + link.ShapeId;
            }

            if (link.Zoom) {
                href += (link.ShapeId ? "&" : "#?") + "zoom=" + link.Zoom;
            }

            return href;
        }

        return "#";
    }
    
    function buildLinkText(link) {

        if (link.Description)
            return link.Description;

        if (link.SubAddress) {
            return link.Address
                ? link.Address + '[' + link.SubAddress + ']'
                : link.SubAddress;
        }

        return link.Address;
    }

    function showShapeLinks(shapeId) {
        
        var shape = diagram.shapes[shapeId];

        var labelnolinks = $("#panel-links").data('labelnolinks') || 'No Shape Links';
        var $html = $('<span>' + labelnolinks + '</span>');
        
        if (shape) {

            $html = $("<table class='table borderless' />");

            var $tbody = $html.append($('<tbody />'));

            $.each(shape.Links, function (linkId, link) {

                var href = buildLinkTargetLocation(link);
                var text = buildLinkText(link);

                var $a = $("<a />")
                    .attr("href", href)
                    .text(text);

                if (link.Address && diagram.openHyperlinksInNewWindow)
                    $a.attr("target", "_blank");

                $tbody.append($('<tr />')
                    .append($("<td />")
                    .append($a)));
            });
        }

        $("#panel-links").html($html);
    }

    if (diagram.enableLinks)
        diagram.selectionChanged.add(showShapeLinks);

    if (!diagram.enableFollowHyperlinks)
        return;

    $.each(diagram.shapes, function (shapeId) {

        var info = diagram.shapes[shapeId];

        var defaultlink = info.DefaultLink && info.Links[info.DefaultLink - 1];
        var defaultHref = defaultlink && buildLinkTargetLocation(defaultlink);

        if (defaultHref) {

            var shape = findTargetShape(shapeId);
            if (!shape)
                return;

            shape.style.cursor = 'pointer';

            shape.addEventListener('click', function (evt) {
                evt.stopPropagation();

                if (evt && evt.ctrlKey)
                    return;

                if (defaultlink.Address && diagram.openHyperlinksInNewWindow || evt.shiftKey)
                    window.open(defaultHref, "_blank");
                else
                    document.location = defaultHref;
            });
        }
    });

});
