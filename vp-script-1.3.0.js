
//-----------------------------------------------------------------------
// Copyright (c) 2017-2020 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    const NS = "http://www.w3.org/2000/svg";

    var diagram = window.svgpublish || {};

    if (!diagram.shapes || !diagram.enableContainerTip)
        return;

    var tip = document.getElementById("container-tip");
    var labelSwimlane = tip.dataset.labelswimlane || 'Swimlane';
    var labelPhase = tip.dataset.labelphase || 'Phase';
    var labelContainer = tip.dataset.labelcontainer || 'Swimlane';

    function localize(category) {
        if (category === 'Swimlane')
            return labelSwimlane;
        if (category === 'Phase')
            return labelPhase;
        if (category === 'Container')
            return labelContainer;
        return category;
    }

    var containers = [];
    for (var shapeId in diagram.shapes) {
        const shape = document.getElementById(shapeId);
        const info = diagram.shapes[shapeId];
        if (info.IsContainer)
            containers.push({ shape: shape, info: info });
    }

    function updateContainerTips(evt) {
        let html = "";
        for (i = 0; i < containers.length; ++i) {
            const container = containers[i];
            const info = container.info;
            if (info.ContainerCategories && info.ContainerText) {
                const shape = container.shape;
                const bbox = shape.getBoundingClientRect();
                const x = evt.clientX;
                const y = evt.clientY;
                if (bbox.left <= x && x <= bbox.right && bbox.top <= y && y <= bbox.bottom) {
                    html += "<div>" + localize(info.ContainerCategories) + ": <strong>" + info.ContainerText + "</strong></div>";
                }
            }
        }
        tip.innerHTML = html;
    }

    let maxWidth = 0;
    let maxHeight = 0;
    for (i = 0; i < containers.length; ++i) {
        const container = containers[i];
        const bbox = container.shape.getBBox();
        if (maxWidth < bbox.width)
            maxWidth = bbox.width;
        if (maxHeight < bbox.height)
            maxHeight = bbox.height;
    }

    for (i = 0; i < containers.length; ++i) {
        const container = containers[i];
        const info = container.info;
        const shape = container.shape;

        const categories = info.ContainerCategories;
        if (categories) {
            if (categories === "Swimlane" || categories === "Phase") {
                const bbox = shape.getBBox();
                var rect = document.createElementNS(NS, "rect");
                rect.setAttribute("x", bbox.x);
                rect.setAttribute("y", bbox.y);

                if (info.ContainerCategories === "Swimlane") {
                    rect.setAttribute("height", maxWidth);
                } else {
                    rect.setAttribute("width", bbox.width);
                }

                if (info.ContainerCategories === "Phase") {
                    rect.setAttribute("height", maxHeight);
                } else {
                    rect.setAttribute("height", bbox.height);
                }
                // rect.setAttribute('fill', '#ffffff00');
                // rect.setAttribute('stroke', 'red');
                shape.appendChild(rect);
            }

            shape.addEventListener('mousemove', updateContainerTips);
            shape.addEventListener('mouseout', updateContainerTips);
        }
    }
});


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


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes)
        return;
    
    $("#shape-links").show();

    function findTargetShape(shapeId) {
        let shape = document.getElementById(shapeId);

        let info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (var i = 0; i < shape.children.length; ++i) {
            let child = shape.children[i];
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

        var $shape = $(findTargetShape(shapeId));

        $shape.css("cursor", 'pointer');

        $shape.on('click', function (evt) {
            evt.stopPropagation();

            if (evt && evt.ctrlKey)
                return;

            var thisId = $(this).attr('id');
            var shape = diagram.shapes[thisId];

            if (shape.DefaultLink) {

                var defaultlink = shape.Links[shape.DefaultLink - 1];
                var defaultHref = buildLinkTargetLocation(defaultlink);

                if (defaultHref) {

                    if (defaultlink.Address && diagram.openHyperlinksInNewWindow || evt.shiftKey)
                        window.open(defaultHref, "_blank");
                    else
                        document.location = defaultHref;
                }
                    
            }
        });

        // hover support
        if (haveSvgfilters) {
            $shape.on('mouseover', function () {
                var thisId = $(this).attr('id');
                if (diagram.shapes[thisId].DefaultLink)
                    $(this).attr('filter', 'url(#hyperlink)');
            });
            $shape.on('mouseout', function () {
                var thisId = $(this).attr('id');
                if (diagram.shapes[thisId].DefaultLink)
                    $(this).removeAttr('filter');
            });
        }
    });

});


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.pages || !diagram.enablePages)
        return;

    $("#shape-pages").show();

    function filter(term) {
        var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

        $.each(diagram.pages, function (index, page) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            if (term && !re.test(page.Name))
                return;

            var curpath = location.pathname;
            var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), page.FileName);
            var href = document.location.protocol + "//" + document.location.host + newpath;

            var text = term ? page.Name.replace(re, "<span class='search-hilight'>$1</span>") : page.Name;

            var $a = $("<a />")
                .attr("href", href)
                .html(text);

            var $li = $('<li />');

            if (page.Id === diagram.currentPage.Id)
                $li.addClass('active');

            $li.append($a).appendTo($ul);
        });

        $("#panel-pages").html($ul);
    }

    filter('');

    $("#search-page").on("keyup", function () {

        filter($("#search-page").val());
        return false;
    });
});


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enablePopovers) {
        return;
    }

    if (diagram.popoverKeepOnHover) {

        var originalLeave = $.fn.popover.Constructor.prototype.leave;
        $.fn.popover.Constructor.prototype.leave = function(obj){
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
            var container, timeout;

            originalLeave.call(this, obj);

            if(obj.currentTarget) {
                container = $(obj.currentTarget).data("bs.popover").tip();
                timeout = self.timeout;
                container.one('mouseenter', function(){
                    //We entered the actual popover � call off the dogs
                    clearTimeout(timeout);
                    //Let's monitor popover content instead
                    container.one('mouseleave', function(){
                        $.fn.popover.Constructor.prototype.leave.call(self, self);
                    });
                })
            }
        };
    };

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $("#" + shapeId);

        var title = diagram.enablePopoverHtml ? Mustache.render($('#popover-title-template').html(), shape) : shape.Text;
        var content = diagram.enablePopoverHtml ? Mustache.render($('#popover-content-template').html(), shape) : shape.Comment;
        var placement = diagram.popoverPlacement || "auto top";

        if (!content)
            return;

        var options = {
            title: title,
            content: content,
            placement: placement,
            container: "body",
            html: true
        };

        if (diagram.popoverTrigger) {
            options.trigger = diagram.popoverTrigger;
        };

        if (diagram.popoverTimeout || diagram.popoverKeepOnHover) {
            options.delay = {
                show: diagram.popoverTimeoutShow || undefined,
                hide: diagram.popoverTimeoutHide || diagram.popoverKeepOnHover ? 200 : undefined
            }
        }

        $shape.popover(options);
    });

    if (diagram.popoverOutsideClick) {
        $('div.svg').mouseup(function(e) {
            $.each(diagram.shapes,
                function(shapeId) {
                    var $shape = $("#" + shapeId);
                    if (!$shape.is(e.target) &&
                        $shape.has(e.target).length === 0 &&
                        $('.popover').has(e.target).length === 0) {
                        (($shape.popover('hide').data('bs.popover') || {}).inState || {}).click = false; // fix for BS 3.3.7
                    }
                });
        });
    }

});


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


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.shapes || !diagram.enableSearch)
        return;

    $("#shape-search").show();

    function processPage(term, pageId, $ul, external) {
        $.each(diagram.searchIndex[pageId], function (shapeId, searchInfos) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            let foundProperties = [];
            let foundText = '';

            for (var propName in searchInfos) {

                let searchText = searchInfos[propName];
                if (re.test(searchText)) {
                    foundProperties.push(propName);
                    foundText += searchText;
                }
            }

            if (!foundProperties.length)
                return;

            let notes = foundProperties.join(', ');

            var $li = $('<li />');

            var a = '<a>';

            if (external) {
                var page = diagram.pages.filter(function (p) { return p.Id === pageId; })[0];
                if (notes)
                    notes += ' / ';
                notes += page.Name;
            }

            a += '<div>' + foundText.replace(re, "<span class='search-hilight'>$1</span>") + '</div>';

            if (notes)
                a += '<div class="text-muted small">' + notes + '</div>';

            a += '</a>';

            var $a = $(a);

            var pageUrl = document.location.protocol + "//" + document.location.host + document.location.pathname;

            if (external) {
                var targetPage = diagram.pages.filter(function (p) { return p.Id === pageId; })[0];
                var curpath = location.pathname;
                var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), targetPage.FileName);
                pageUrl = document.location.protocol + "//" + document.location.host + newpath;
            }

            var targetUrl = pageUrl + "#?shape=" + shapeId + "&term=" + encodeURIComponent(term);
            $a.attr('href', targetUrl);

            $li.append($a);

            $li.appendTo($ul);
        });
    }

    function search(term) {
        var $html = $("<div />");

        if (term.length) {

            if (term.length < 2) {
                var $hint = $('<p class="text-muted">Please enter more than one character to search</p>');
                $html.append("<hr/>");
                $html.append($hint);
            } else {
                var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

                $html.append("<hr/>");
                $html.append("<p>Results for <strong>" + term + "</strong>:</p>");
                $html.append($ul);

                var currentPageId = +diagram.currentPage.Id;

                processPage(term, currentPageId, $ul);

                $.each(diagram.searchIndex, function (pageId) {
                    if (+pageId !== currentPageId)
                        processPage(term, +pageId, $ul, true);
                });
            }
        }

        $("#panel-search-results")
            .html($html);
    }

    $("#search-term").on("keyup", function () {

        search($("#search-term").val());
        return false;
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    var term = getUrlParameter('term');
    if (term) {
        $('#search-term').val(term);
        search(term);
    }
});


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {
    diagram.selectionChanged = $.Callbacks();
})(window.svgpublish);

$(document).ready(function () {

    var diagram = window.svgpublish;

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes || !diagram.enableSelection)
        return;

    function findTargetShape(shapeId) {
        let shape = document.getElementById(shapeId);

        let info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (var i = 0; i < shape.children.length; ++i) {
            let child = shape.children[i];
            if (child.textContent.indexOf(info.ContainerText) >= 0)
                return child;
        }
    }

    diagram.setSelection = function (shapeId) {

        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            let shape = findTargetShape(diagram.selectedShapeId);
            if (shape) {
                if (haveSvgfilters)
                    shape.removeAttribute('filter');
                else
                    shape.style.opacity = 1;
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            let shape = findTargetShape(shapeId);
            if (shape) {
                if (haveSvgfilters)
                    shape.setAttribute('filter', 'url(#select)');
                else
                    shape.style.opacity = 0.5;
            }
        }
    };

    $("div.svg").on('click', function () {
        diagram.setSelection();
    });

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        let shape = findTargetShape(shapeId);
        if (!shape)
            return;

        shape.style.cursor = 'pointer';

        shape.addEventListener('click', function (evt) {
            evt.stopPropagation();
            diagram.setSelection(shapeId);
        });

        // hover support
        if (haveSvgfilters && !info.DefaultLink) {
            shape.addEventListener('mouseover', function () {
                if (diagram.selectedShapeId !== shapeId)
                    shape.setAttribute('filter', 'url(#hover)');
            });
            shape.addEventListener('mouseout', function () {
                if (diagram.selectedShapeId !== shapeId)
                    shape.removeAttribute('filter');
            });
        }
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    diagram.highlightShape = function (shapeId) {
        $("#" + shapeId).fadeTo(300, 0.3).fadeTo(300, 1).fadeTo(300, 0.3).fadeTo(300, 1);
        diagram.setSelection(shapeId);
    };

    function processHash() {
        var shape = getUrlParameter('shape');
        if (shape) {
            diagram.highlightShape(shape);
        }
    }

    processHash();
    $(window).on('hashchange', processHash);
});


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.enableSidebar)
        return;

    var right = diagram.rightSidebar;
    var alwaysHide = diagram.alwaysHideSidebar;
    
    $("body").addClass(right ? "vp-sidebar-right" : "vp-sidebar-left");

    var sidebarWidth = 400;

    $("#sidebar-toggle").on("dragstart", function () {
        return false;
    });

    var storage;
    try { storage = window.localStorage; } catch (e) { }

    var defaultWidth = storage ? parseInt(storage.getItem("DiagramSidebarWidth")) : 0;
    if (defaultWidth > 0)
        sidebarWidth = defaultWidth;

    var maxWidth = $(window).width() - $("#sidebar-toggle").width() - 40;
    if (sidebarWidth >= maxWidth)
        sidebarWidth = maxWidth;

    var showSidebarSetting = storage ? storage.getItem("DiagramSidebarVisible") === '1' : 0;

    $("#sidebar-toggle").show();

    if (isSidebarEnabled() && !alwaysHide) {
        showSidebar(showSidebarSetting, 0);
    }

    var dragWidth;
    var dragClientX;

    var fnMouseMove = function (mouseMoveEvt) {
        if (dragClientX) {
            var width = dragWidth + (right ? -1 : 1) * (mouseMoveEvt.clientX - dragClientX);

            if (width < 0)
                width = 0;

            $("#diagram-sidebar").width(width + 'px').show();
            $("#sidebar-toggle").css(right ? "right" : "left", width + 'px');
        }
    };

    var fnMouseUp = function (mouseUpEvt) {

        $("iframe").css("pointer-events", "auto");

        $(document).off('mousemove', fnMouseMove);
        $(document).off('mouseup', fnMouseUp);

        var width = (right ? -1 : 1) * (mouseUpEvt.clientX - dragClientX) + dragWidth;

        if (width < 0)
            width = 0;

        if (Math.abs(mouseUpEvt.clientX - dragClientX) < 20) {
            showSidebar(width < 20, 400);
        } else {
            sidebarWidth = width;
            showSidebar(true, 0);
        }

        dragClientX = null;
    };

    $("#sidebar-toggle").on("mousedown", function (moseDownEvt) {

        if (moseDownEvt.button !== 0)
            return;

        $("iframe").css("pointer-events", "none");

        dragClientX = moseDownEvt.clientX;
        dragWidth = $("#diagram-sidebar").width();

        $(document)
            .on('mousemove', fnMouseMove)
            .on('mouseup', fnMouseUp);
    });

    function isSidebarEnabled() {
        return maxWidth > 600;
    }

    function showSidebar(show, animationTime) {

        if (show) {
            $("#diagram-sidebar")
			.show()
			.animate({
			    width: (sidebarWidth) + 'px'
			}, animationTime, function() {
                if (window.editor && window.editor.layout)
                    window.editor.layout();

                if (window.terminal && window.terminal.layout)
                    window.terminal.layout();

                if (diagram.enableSidebarHtml)
                    showSidebarHtml();
            });

            $("#sidebar-toggle")
			.addClass("rotated")
			.animate(
            right ? { right: (sidebarWidth - 2) + 'px' } : { left: (sidebarWidth - 2) + 'px' },
            animationTime);
        } else {
            $("#diagram-sidebar").animate({
                width: "0"
            }, animationTime, function () {
                $("#diagram-sidebar").hide();
            });

            $("#sidebar-toggle")
			.removeClass("rotated")
			.animate(
            right ? { right: "0" } : { left: "0" },
            animationTime);
        }

        if (isSidebarEnabled() && storage) {
            storage.setItem("DiagramSidebarVisible", show ? '1' : '0');
            storage.setItem("DiagramSidebarWidth", sidebarWidth);
        }
    }

    diagram.showSidebar = showSidebar;

    function showSidebarHtml(thisShapeId) {

        var shape = thisShapeId ? diagram.shapes[thisShapeId] : {};
        var $html = Mustache.render($('#sidebar-template').html(), shape);
        $("#sidebar-html").html($html);
    }

    if (diagram.enableSidebarHtml)
        diagram.selectionChanged.add(showSidebarHtml);
});


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

(function ($) {

    $.fn.extend({
        panzoom: function (svg) {
            return this.each(function () { PanZoom(this, svg); });
        }
    });

    var PanZoom = function (elem, options) {

        var enableZoom = 1; // 1 or 0: enable or disable zooming (default enabled)
        var zoomScale = 0.5; // Zoom sensitivity
        var panDelta = 3; // start pan on move

        var state = null;
        var stateOriginSvg = null;
        var stateOriginClient = null;
        var stateTf = null;
        var stateDiff = null;

        var onViewChanged = null;

        var svg = options.svg;
        var viewBox = options.viewBox;

        initCTM();

        if (!$.contains(document, svg))
            svg = $(elem).html(svg).find("svg").get(0);

        // bug workaround for IE getBoundingClientRect, see
        // https://connect.microsoft.com/IE/feedback/details/938382/svg-getboundingboxrect-returns-invalid-rectangle-top-and-height-are-invalid
        // 
        if (navigator.userAgent.match(/trident|edge/i)) {

            SVGElement.prototype.getBoundingClientRect = function () {

                var svgPoint1 = svg.createSVGPoint();

                var bbox = this.getBBox();
                var m = this.getScreenCTM();

                svgPoint1.x = bbox.x;
                svgPoint1.y = bbox.y;

                var pt1 = svgPoint1.matrixTransform(m);

                var svgPoint2 = svg.createSVGPoint();

                svgPoint2.x = bbox.x + bbox.width;
                svgPoint2.y = bbox.y + bbox.height;

                var pt2 = svgPoint2.matrixTransform(m);

                return {
                    left: pt1.x,
                    top: pt1.y,
                    right: pt2.x,
                    bottom: pt2.y,
                    width: pt2.x - pt1.x,
                    height: pt2.y - pt1.y
                };
            }
        }

        $(elem)
            .on("mousedown", handleMouseDown)
            .on("mousemove", handleMouseMove)
            .on("touchstart", handleTouchStart)
            .on("touchmove", handleMouseMove);

        $(elem).get(0).addEventListener('click', handleClick, true);

        if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0)
            $(elem).on('DOMMouseScroll', handleMouseWheel); // Firefox
        else
            $(elem).on('mousewheel', handleMouseWheel); // Chrome/Safari/Opera/IE

        return {
            zoom: zoom,
            reset: initCTM,
            focus: setStartShape,
            onViewChanged: function (handler) {
                onViewChanged = handler;
            }
        };

        function getUrlParameter(name) {
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.hash);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        function fitInBox(width, height, maxWidth, maxHeight) {

            var aspect = width / height;

            if (width > maxWidth || height < maxHeight) {
                width = maxWidth;
                height = Math.floor(width / aspect);
            }

            if (height > maxHeight || width < maxWidth) {
                height = maxHeight;
                width = Math.floor(height * aspect);
            }

            return {
                width: width,
                height: height
            };
        }

        function getViewPort() {
            return $(elem).find("#viewport").get(0);
        }

        function initCTM() {

            if (!viewBox)
                return;

            var bbox = viewBox.split(' ');

            var width = parseFloat(bbox[2]);
            var height = parseFloat(bbox[3]);

            var maxWidth = $(elem).width();
            var maxHeight = $(elem).height();

            if (typeof (svg.createSVGMatrix) !== 'function')
                return;

            var m = svg.createSVGMatrix();

            var sz = fitInBox(width, height, maxWidth, maxHeight);

            if (sz.width < maxWidth)
                m = m.translate((maxWidth - sz.width) / 2, 0);

            if (sz.height < maxHeight)
                m = m.translate(0, (maxHeight - sz.height) / 2, 0);

            m = m.scale(sz.width / width);

            var viewPort = $(svg).find("#viewport").get(0);
            setCTM(viewPort, m);

            $(window).on('hashchange', processHash);
            processHash();
        }

        function processHash() {
            var startShape = getUrlParameter('shape');
            if (startShape) {
                setStartShape(startShape);
            }

            var startZoom = getUrlParameter('zoom');
            if (startZoom) {
                zoom(startZoom);
            }
        }

        function setStartShape(shapeId) {
            var p2 = getDefaultPoint();
            var p1 = getShapePoint(shapeId);

            var viewPort = getViewPort();
            var m = viewPort.getCTM();
            if (p1 && p2) {
                var cp = p1.matrixTransform(m.inverse());
                var sp = p2.matrixTransform(m.inverse());
                setCTM(viewPort, m.translate(sp.x - cp.x, sp.y - cp.y));
            }
        }

        function getShapePoint(shapeId) {
            var shapeElem = svg.getElementById(shapeId);
            if (!shapeElem)
                return undefined;
            
            var rect = shapeElem.getBoundingClientRect();
            var pt = svg.createSVGPoint();
            pt.x = (rect.left + rect.right) / 2;
            pt.y = (rect.top + rect.bottom) / 2;
            return pt;
        }

        function getEventClientPoint(evt) {

            var touches = evt.originalEvent.touches;

            if (touches && touches.length === 2) {

                var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                return makeClientPoint((pt1.pageX + pt2.pageX) / 2, (pt1.pageY + pt2.pageY) / 2);

            } else {
                var realEvt = evt.originalEvent
                    ? evt.originalEvent.touches
                        ? evt.originalEvent.touches[0]
                        : evt.originalEvent
                    : evt;

                return makeClientPoint(realEvt.pageX, realEvt.pageY);
            }
        }

        /*
            Instance an SVGPoint object with given coordinates.
        */
        function getSvgClientPoint(clientPoint) {

            var p = svg.createSVGPoint();

            p.x = clientPoint.pageX - $(elem).offset().left;
            p.y = clientPoint.pageY - $(elem).offset().top;

            return p;
        }

        /*
            get center zoom point
        */

        function getDefaultPoint() {

            var p = svg.createSVGPoint();

            p.x = $(elem).width() / 2;
            p.y = $(elem).height() / 2;

            return p;
        }

        /*
            Sets the current transform matrix of an element.
        */

        function setCTM(element, matrix) {

            var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

            element.setAttribute("transform", s);

            // BUG with SVG arrow rendering in complex files in IE10, IE11
            if (navigator.userAgent.match(/trident|edge/i)) {

                if (typeof (svg.style.strokeMiterlimit) !== 'undefined') {

                    if (svg.style.strokeMiterlimit !== "3")
                        svg.style.strokeMiterlimit = "3";
                    else
                        svg.style.strokeMiterlimit = "2";
                }
            }

            if (onViewChanged)
                onViewChanged(elem);
        }

        /*
            zoom in or out on mouse wheel
        */

        function handleMouseWheel(evt) {

            if (!enableZoom)
                return;

            var diagram = window.svgpublish;

            if (diagram && diagram.enableZoomCtrl && !evt.ctrlKey)
                return;
            if (diagram && diagram.enableZoomShift && !evt.shiftKey)
                return;

            if (evt.preventDefault)
                evt.preventDefault();

            evt.returnValue = false;

            var delta;

            if (evt.originalEvent.wheelDelta)
                delta = evt.originalEvent.wheelDelta / 360; // Chrome/Safari
            else
                delta = evt.originalEvent.detail / -9; // Mozilla

            var z = Math.pow(1 + zoomScale, delta);

            zoom(z, evt);
        }

        /*
            zoom with given aspect at given (client) point
        */

        function zoom(z, evt) {

            var evtPt = evt
                ? getSvgClientPoint(getEventClientPoint(evt))
                : getDefaultPoint();

            var viewPort = getViewPort();

            var p = evtPt.matrixTransform(viewPort.getCTM().inverse());

            // Compute new scale matrix in current mouse position
            var k = svg.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

            setCTM(viewPort, viewPort.getCTM().multiply(k));

            if (!stateTf)
                stateTf = viewPort.getCTM().inverse();

            stateTf = stateTf.multiply(k.inverse());
        }

        /*
        
        */

        function makeClientPoint(pageX, pageY) {
            return { pageX: pageX, pageY: pageY };
        }

        /*
            compute geometric distance between points
        */

        function diff(pt1, pt2) {
            var dx = (pt1.pageX - pt2.pageX);
            var dy = (pt1.pageY - pt2.pageY);
            return Math.sqrt(dx * dx + dy * dy);
        }

        /*
             continue pan (one touch or mouse) or pinch (with two touches)
        */

        function handleMouseMove(evt) {

            if (!state)
                return;

            if (evt.preventDefault)
                evt.preventDefault();

            evt.returnValue = false;

            var clientPt = getEventClientPoint(evt);

            if (state === 'pinch') {

                var touches = evt.originalEvent.touches;
                if (touches && touches.length === 2) {

                    var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                    var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                    var currentDiff = diff(pt1, pt2);

                    zoom(currentDiff / stateDiff, evt);

                    stateDiff = currentDiff;

                    var pp = getSvgClientPoint(clientPt).matrixTransform(stateTf);
                    setCTM(getViewPort(), stateTf.inverse().translate(pp.x - stateOriginSvg.x, pp.y - stateOriginSvg.y));
                }
            }

            if (state === 'down') {

                if (diff(clientPt, stateOriginClient) > panDelta)
                    state = 'pan';
            }

            if (state === 'pan') {
                var sp = getSvgClientPoint(clientPt).matrixTransform(stateTf);
                setCTM(getViewPort(), stateTf.inverse().translate(sp.x - stateOriginSvg.x, sp.y - stateOriginSvg.y));
            }
        }

        /*
            start pan (one touch or mouse) or pinch (with two touches)
        */

        function handleMouseDown(evt) {

            if (evt.which !== 1)
                return false;

            // prevent selection on double-click
            if (evt.preventDefault)
                evt.preventDefault();

            return handleTouchStart(evt);
        }

        function handleTouchStart(evt) {

            var touches = evt.originalEvent.touches;

            if (touches && touches.length === 2) {

                var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                stateDiff = diff(pt1, pt2);

                state = 'pinch';

            } else {

                var diagram = window.svgpublish;
                if (diagram && diagram.twoFingersTouch && touches) {
                    state = null;
                    return;
                }

                state = 'down';
            }

            stateTf = getViewPort().getCTM().inverse();
            stateOriginClient =  getEventClientPoint(evt);
            stateOriginSvg = getSvgClientPoint(stateOriginClient).matrixTransform(stateTf);
        }

        /*
            reset state on mouse up
        */

        function handleClick(evt) {

            // prevent firing 'click' event in case we pan or zoom
            if (state === 'pan' || state === 'pinch') {

                if (evt.stopPropagation)
                    evt.stopPropagation();
            }

            state = null;
        }
    };

})(jQuery);


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/* globals: jQuery, $ */

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableTooltips) {
        return;
    }

    if (diagram.tooltipKeepOnHover) {
        var originalLeave = $.fn.tooltip.Constructor.prototype.leave;
        $.fn.tooltip.Constructor.prototype.leave = function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
            var container, timeout;

            originalLeave.call(this, obj);

            if (obj.currentTarget) {
                container = $(obj.currentTarget).data("bs.tooltip").tip();
                timeout = self.timeout;
                container.one('mouseenter', function() {
                    //We entered the actual popover � call off the dogs
                    clearTimeout(timeout);
                    //Let's monitor popover content instead
                    container.one('mouseleave', function() {
                        $.fn.tooltip.Constructor.prototype.leave.call(self, self);
                    });
                })
            }
        };
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $("#" + shapeId);

        var tip = diagram.enableTooltipHtml ? Mustache.render($('#tooltip-template').html(), shape) : shape.Comment;
        var placement = diagram.tooltipPlacement || "auto top";

        if (!tip)
            return;

        var options = {
            container: "body",
            html: true,
            title: tip,
            placement: placement
        };

        if (diagram.tooltipTrigger) {
            options.trigger = diagram.tooltipTrigger;
        }

        if (diagram.tooltipTimeout || diagram.tooltipKeepOnHover) {
            options.delay = {
                show: diagram.tooltipTimeoutShow || undefined,
                hide: diagram.tooltipTimeoutHide || diagram.tooltipKeepOnHover ? 200 : undefined
            }
        }

        $shape.tooltip(options);
    });

    if (diagram.tooltipOutsideClick) {
        $('div.svg').mouseup(function(e) {
            $.each(diagram.shapes,
                function(shapeId) {
                    var $shape = $("#" + shapeId);
                    if (!$shape.is(e.target) &&
                        $shape.has(e.target).length === 0 &&
                        $('.tooltip').has(e.target).length === 0) {
                        (($shape.tooltip('hide').data('bs.tooltip') || {}).inState || {}).click = false; // fix for BS 3.3.7
                    }
                });
        });
    }

});

if (window.svgpublish)
    window.svgpublish.diagramData = window.svgpublish.shapes;
