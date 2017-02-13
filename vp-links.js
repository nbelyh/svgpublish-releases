
$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.shapes || !diagram.enableLinks)
        return;
    
    $("#shape-links").show();

    function buildLinkTargetLocation(link) {

        if (link.Address)
            return link.Address;
        
        if (link.PageId) {

            if (!diagram.pages)
                return "#";

            return document.location.href.replace("__" + diagram.currentPage.Id, "__" + link.PageId);
        }

        return null;
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

    function showShapeLinks(thisShapeId, showOnly) {
        
        var shape = diagram.shapes[thisShapeId];

        var $html = $('<span>No Links</span>');
        
        if (shape) {

            $html = $("<table class='table borderless' />");

            var $tbody = $html.append($('<tbody />'));

            $.each(shape.Links, function (linkId, link) {

                var href = buildLinkTargetLocation(link);
                var text = buildLinkText(link);

                var $a = $("<a />")
                    .attr("href", href)
                    .text(text);

                $tbody.append($('<tr />')
                    .append($("<td />")
                    .append($a)));
            });

            if (showOnly)
                return;

            if (shape.DefaultLink) {

                var defaultlink = shape.Links[shape.DefaultLink-1];
                var defaultHref = buildLinkTargetLocation(defaultlink);

                if (defaultHref)
                    document.location = defaultHref;
            }
        }

        $("#panel-links").html($html);
    }

    $("div.svg").on('click', function () {
        showShapeLinks();
    });

    $.each(diagram.shapes, function (shapeId, shape) {

        if (!shape.Links)
            return;

        var $shape = $("#" + shapeId);

        $shape.css('cursor', 'pointer');

        $shape.on('click', function(e) {
            showShapeLinks($(this).attr('id'), e.ctrlKey);
        });
    });
});
