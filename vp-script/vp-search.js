$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableSearch)
        return;

    $("#shape-search").show();

    $("#search-term").on("keyup", function (evt) {

        var term = '' + $("#search-term").val();

        var $html = $("<div />");

        if (!term.length) {
            
        }
        else if (term.length < 2) {
            var $hint = $('<p class="text-muted">Please enter more than one character to search</p>');
            $html.append("<hr/>");
            $html.append($hint);
        } else {
            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

            $html.append("<hr/>");
            $html.append("<p>Results for <strong>" + term + "</strong>:</p>");
            $html.append($ul);

            $.each(diagram.shapes, function (shapeId, shape) {

                var text = '' + shape.SearchText;

                var found = re.test(text);

                if (!found && shape.Props) {
                    for (var key in shape.Props) {
                        text = shape.Props[key];
                        if (re.test(text))
                            found = true;
                        if (found)
                            break;
                    };
                }

                if (!found)
                    return;

                var $li = $('<li />');

                var $a = $('<a href="#">' + text.replace(re, "<span class='search-hilight'>$1</span>") + '</a>')
                    .on("click", function () {
                        diagram.setSelection(shapeId);
                        $("#" + shapeId).fadeTo(300, 0.3).fadeTo(300, 1).fadeTo(300, 0.3).fadeTo(300, 1);
                    });

                $li.append($a);

                $li.appendTo($ul);
            });
        }

        $("#panel-search-results")
            .html($html);

        return false;
    });

});
