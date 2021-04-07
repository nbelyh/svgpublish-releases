
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
    var labelContainer = tip.dataset.labelcontainer || 'Container';

    function localize(category) {
        if (category === 'Swimlane')
            return labelSwimlane;
        if (category === 'Phase')
            return labelPhase;
        return labelContainer;
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

(function (diagram) {
    diagram.selectionChanged = $.Callbacks();
})(window.svgpublish);

$(document).ready(function () {

    var diagram = window.svgpublish;

    if (!diagram.shapes || !diagram.enableHover)
        return;

    var haveSvgfilters = !diagram.enableBoxSelection;
    var SVGNS = 'http://www.w3.org/2000/svg';

    //TODO: consolidate when migrating from jQuery
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

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        if (info.DefaultLink
            || info.Props && Object.keys(info.Props).length
            || info.Links && info.Links.length
            || info.Comment || info.PopoverMarkdown || info.SidebarMarkdown || info.TooltipMarkdown
        ) {
            let shape = findTargetShape(shapeId);
            if (!shape)
                return;

            // hover support
            if (haveSvgfilters) {

                var filter = (diagram.enableFollowHyperlinks && info.DefaultLink) ? 'url(#hyperlink)' : 'url(#hover)';

                shape.addEventListener('mouseover', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.setAttribute('filter', filter);
                });
                shape.addEventListener('mouseout', function () {
                    if (diagram.selectedShapeId !== shapeId)
                        shape.removeAttribute('filter');
                });

            } else {

                shape.addEventListener('mouseover', function (event) {
                    var e = event.toElement || event.relatedTarget;
                    if (e.parentNode === shape) {
                        return;
                    }
                    if (diagram.selectedShapeId !== shapeId) {
                        var rect = shape.getBBox();

                        if (diagram.filter && diagram.filter.enableDilate) {

                            var dilate = +diagram.filter.dilate || 4;

                            rect.x -= dilate / 2;
                            rect.width += dilate;
                            rect.y -= dilate / 2;
                            rect.height += dilate;
                        }

                        var hyperlinkColor = diagram.filter && diagram.filter.hyperlinkColor || "rgba(0, 0, 255, 0.2)";
                        var hoverColor = diagram.filter && diagram.filter.hoverColor || "rgba(255, 255, 0, 0.2)";

                        var color = (diagram.enableFollowHyperlinks && info.DefaultLink) ? hyperlinkColor : hoverColor;

                        let box = document.createElementNS(SVGNS, "rect");
                        box.id = "vp-hover-box";
                        box.setAttribute("x", rect.x);
                        box.setAttribute("y", rect.y);
                        box.setAttribute("width", rect.width);
                        box.setAttribute("height", rect.height);
                        box.style.fill = (diagram.filter && diagram.filter.mode === 'normal') ? 'none' : color;
                        box.style.stroke = color;
                        box.style.strokeWidth = dilate || 0;
                        shape.appendChild(box);
                    }
                });
                shape.addEventListener('mouseout', function (event) {
                    var e = event.toElement || event.relatedTarget;
                    if (e.parentNode === shape) {
                        return;
                    }
                    if (diagram.selectedShapeId !== shapeId) {
                        let box = document.getElementById("vp-hover-box");
                        if (box) {
                            box.remove();
                        }
                    }
                });
            }
        }
    });
});


// compatibility with version 0.x
if (window.svgpublish)
    window.svgpublish.diagramData = window.svgpublish.shapes;

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (diagram.enableAutoFrameHeight) {
        var iframe = window.top.document.getElementById(window.name);
        if (iframe) {
            var wp = iframe.parentElement;
            var rc = wp.getBoundingClientRect();
            wp.style.height = 'calc(100vh - ' + rc.top + 'px)';
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

    function numericSort(data) {
        const collator = Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return data
            .map(function (x) {
                return x;
            })
            .sort(function (a, b) {
            return collator.compare(a.Name, b.Name);
        });
    }

    function filter(term) {

        var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

        var $table = $("<table class='table borderless' />");

        var sortedLayers = diagram.enableLayerSort ? numericSort(diagram.layers) : diagram.layers;
        $.each(sortedLayers, function (i, layer) {

            if (term && !re.test(layer.Name))
                return;

            var text = term ? layer.Name.replace(re, "<span class='search-hilight'>$1</span>") : layer.Name;

            var $check = diagram.enableBootstrapSwitch
                ? $("<input type='checkbox' data-layer='" + layer.Index + "' " + (layer.Visible ? 'checked' : '') + "><span style='margin-left:1em'>" + text + "</span></input>")
                : $("<div class='checkbox' style='margin-bottom: 0'><label><input type='checkbox' data-layer='" + layer.Index + "' " + (layer.Visible ? 'checked' : '') + ">" + text + "</label></div>");

            var $input = diagram.enableBootstrapSwitch
                ? $check
                : $check.find("input");

            $input.on(diagram.enableBootstrapSwitch ? 'change.bootstrapSwitch' : 'click', function (e) {
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

        if (diagram.enableBootstrapSwitch) {
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
                if (diagram.enableBootstrapSwitch) {
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


//-----------------------------------------------------------------------
// Copyright (c) 2017-2019 Nikolay Belykh unmanagedvisio.com All rights reserved.
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

        let info = diagram.shapes[shapeId];

        var defaultlink = info.DefaultLink && info.Links[info.DefaultLink - 1];
        var defaultHref = defaultlink && buildLinkTargetLocation(defaultlink);

        if (defaultHref) {

            let shape = findTargetShape(shapeId);
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

    function numericSort(data) {
        const collator = Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return data
            .map(function (x) {
                return x;
            })
            .sort(function (a, b) {
                return collator.compare(a.Name, b.Name);
            });
    }

    function filter(term) {
        var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

        var sortedPages = diagram.enableLayerSort ? numericSort(diagram.pages) : diagram.pages;
        $.each(sortedPages, function (index, page) {

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

    //TODO: consolidate when migrating from jQuery
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

    $.each(diagram.shapes, function (shapeId, shape) {

        const $shape = $(findTargetShape(shapeId));

        const popoverMarkdown = shape.PopoverMarkdown || shape.Comment || (diagram.enablePopoverMarkdown && diagram.popoverMarkdown) || '';

        const m = /([\s\S]*)^\s*----*\s*$([\s\S]*)/m.exec(popoverMarkdown);

        const titleMarkdown = m && m[1] || '';
        const contentMarkdown = m && m[2] || popoverMarkdown;

        const title = marked(Mustache.render(titleMarkdown, shape));
        const content = marked(Mustache.render(contentMarkdown, shape));

        var placement = diagram.popoverPlacement || "auto top";

        if (!content)
            return;

        var options = {
            container: "body",
            html: true,
            title: title,
            content: content,
            placement: placement
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

        if (diagram.popoverUseMousePosition) {

            var mouseEvent = {};
            $.fn.popover.Constructor.prototype.update = function (e) {

                mouseEvent.pageX = e.pageX;
                mouseEvent.pageY = e.pageY;
                var $tip = this.tip();

                var pos = this.getPosition()
                var actualWidth = $tip[0].offsetWidth
                var actualHeight = $tip[0].offsetHeight

                var placement = typeof this.options.placement == 'function' ?
                    this.options.placement.call(this, $tip[0], this.$element[0]) :
                    this.options.placement

                var autoToken = /\s?auto?\s?/i
                var autoPlace = autoToken.test(placement)
                if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

                if (autoPlace) {
                    var orgPlacement = placement
                    var viewportDim = this.getPosition(this.$viewport)

                    placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' :
                    placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' :
                    placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' :
                    placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' :
                    placement

                    $tip
                        .removeClass(orgPlacement)
                        .addClass(placement)
                }

                var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

                this.applyPlacement(calculatedOffset, placement)
            }

            var originalGetPosition = $.fn.popover.Constructor.prototype.getPosition;
            $.fn.popover.Constructor.prototype.getPosition = function ($elem) {
                if ($elem || typeof (mouseEvent.pageX) !== 'number' || typeof(mouseEvent.pageY) !== 'number') {
                    return originalGetPosition.call(this, $elem);
                } else {
                    return {
                        left: mouseEvent.pageX,
                        top: mouseEvent.pageY,
                        width: 1,
                        height: 1
                    };
                }
            };

            $shape.on('mousemove', function (e) {
                $shape.data('bs.popover').update(e);
            })
        }
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

                if (!propValue)
                    propValue = "";

                if (propValue.indexOf("https://") >= 0 || propValue.indexOf("http://") >= 0) {
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
            });
        }

        $("#panel-props").html($html);
    }

    diagram.selectionChanged.add(showShapeProperties);
});

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.shapes || !diagram.enableSearch)
        return;

    function parseSearchTerm(term) {
        return term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    }

    $("#shape-search").show();

    function buildPropFilter(propNames) {
        let filter = document.createElement("select");
        filter.className = 'selectpicker';
        filter.setAttribute('multiple', 'multiple');
        filter.setAttribute('title', 'Filter by property');

        for (var propName of propNames) {
            let option = document.createElement("option");
            option.innerText = propName;
            filter.appendChild(option);
        }

        return filter;
    }

    function findUsedPropNamesForPage(term, pageId, usedPropSet) {

        let parsed = parseSearchTerm(term);
        let searchRegex = new RegExp(parsed, 'i');

        $.each(diagram.searchIndex[pageId], function (shapeId, searchInfos) {

            for (var propName in searchInfos) {
                let searchText = searchInfos[propName];
                if (searchRegex.test(searchText)) {
                    usedPropSet[propName] = 1;
                }
            }
        })
    }

    function findUsedPropNames(term, usedPropSet) {
        var currentPageId = +diagram.currentPage.Id;
        findUsedPropNamesForPage(term, currentPageId, usedPropSet);
        for (var pageId in diagram.searchIndex) {
            if (+pageId !== +currentPageId)
                findUsedPropNamesForPage(term, +pageId, usedPropSet);
        }
    }

    function processPage(term, pageId, ul, external, usedPropNames) {

        let parsed = parseSearchTerm(term);
        let searchRegex = new RegExp(parsed, 'i');

        const pageSearchIndex = diagram.searchIndex[pageId];
        for (var shapeId in pageSearchIndex) {

            var searchInfos = pageSearchIndex[shapeId];

            let foundProperties = [];
            let foundTexts = [];

            for (var propName in searchInfos) {
                if (!usedPropNames.length || usedPropNames.indexOf(propName) >= 0) {
                    let searchText = searchInfos[propName];
                    if (searchRegex.test(searchText)) {
                        foundTexts.push(searchText);
                        foundProperties.push(propName);
                    }
                }
            }

            if (!foundTexts.length)
                continue;

            let notes = foundProperties.join(', ');

            var li = document.createElement('li');

            var a = document.createElement('a');

            if (external) {
                var page = diagram.pages.filter(function (p) { return p.Id === pageId; })[0];
                if (notes)
                    notes += ' / ';
                notes += page.Name;
            }

            let replaceRegex = new RegExp("(" + parsed + ")", 'gi');
            var divHead = document.createElement('div');
            divHead.innerHTML = foundTexts.join(", ").replace(replaceRegex, "<span class='search-hilight'>$1</span>");
            a.appendChild(divHead);

            if (notes) {
                var divNotes = document.createElement('div');
                divNotes.className = 'text-muted small';
                divNotes.innerText = notes;
                a.appendChild(divNotes);
            }

            var pageUrl = document.location.protocol + "//" + document.location.host + document.location.pathname;

            if (external) {
                var targetPage = diagram.pages.filter(function (p) { return p.Id === pageId; })[0];
                var curpath = location.pathname;
                var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), targetPage.FileName);
                pageUrl = document.location.protocol + "//" + document.location.host + newpath;
            }

            var targetUrl = pageUrl + "#?shape=" + shapeId + "&term=" + encodeURIComponent(term);
            a.setAttribute('href', targetUrl);

            li.appendChild(a);
            ul.appendChild(li);
        }
    }

    function processPages(term, usedPropNames) {

        var currentPageId = +diagram.currentPage.Id;

        document.getElementById('panel-search-results').innerHTML = '';
        var div = document.createElement("div");

        var hr = document.createElement("hr");
        div.appendChild(hr);
        var p = document.createElement("p");
        p.innerHTML = "<p>Results for <strong>" + term + "</strong>:</p>";
        div.appendChild(p);
        var ul = document.createElement("ul");
        ul.className = "nav nav-stacked nav-pills";
        div.appendChild(ul);

        processPage(term, +currentPageId, ul, false, usedPropNames);
        for (var pageId in diagram.searchIndex) {
            if (+pageId !== +currentPageId)
                processPage(term, +pageId, ul, true, usedPropNames);
        };

        document.getElementById('panel-search-results').appendChild(div);
    };

    function search(term) {

        if (!term.length) {

            document.getElementById('panel-search-results').innerHTML = '';
            document.getElementById('search-property-filter').innerHTML = '';

        } else {

            if (diagram.enablePropertySearchFilter) {

                let usedPropSet = {};
                findUsedPropNames(term, usedPropSet);

                let filter = document.querySelector("#search-property-filter select");

                if (!filter) {
                    filter = buildPropFilter(Object.keys(usedPropSet));
                    document.querySelector("#search-property-filter").appendChild(filter);
                    $(filter).selectpicker();
                    $(filter).on('changed.bs.select', function () {
                        processPages(term, $(filter).val());
                    })
                }

                processPages(term, $(filter).val());

            } else {

                processPages(term, []);

            }
        }
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

    if (!diagram.shapes || !diagram.enableSelection)
        return;

    var haveSvgfilters = !diagram.enableBoxSelection;
    var SVGNS = 'http://www.w3.org/2000/svg';

    //TODO: consolidate when migrating from jQuery
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
                else {
                    let selectionBox = document.getElementById("vp-selection-box");
                    if (selectionBox) {
                        selectionBox.remove();
                    }
                    let hoverBox = document.getElementById("vp-hover-box");
                    if (hoverBox) {
                        hoverBox.remove();
                    }
                }
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            let shape = findTargetShape(shapeId);
            if (shape) {
                if (haveSvgfilters) {
                    shape.setAttribute('filter', 'url(#select)');
                } else {

                    let hoverBox = document.getElementById("vp-hover-box");
                    if (hoverBox) {
                        hoverBox.remove();
                    }
                    let selectionBox = document.getElementById("vp-selection-box");
                    if (selectionBox) {
                        selectionBox.remove();
                    }

                    var rect = shape.getBBox();

                    if (diagram.filter && diagram.filter.enableDilate) {

                        var dilate = +diagram.filter.dilate || 4;

                        rect.x -= dilate / 2;
                        rect.width += dilate;
                        rect.y -= dilate / 2;
                        rect.height += dilate;
                    }

                    var selectColor = diagram.filter && diagram.filter.selectColor || "rgba(255, 255, 0, 0.4)";

                    let box = document.createElementNS(SVGNS, "rect");
                    box.id = "vp-selection-box";
                    box.setAttribute("x", rect.x);
                    box.setAttribute("y", rect.y);
                    box.setAttribute("width", rect.width);
                    box.setAttribute("height", rect.height);
                    box.style.fill = (diagram.filter && diagram.filter.mode === 'normal') ? 'none' : selectColor;
                    box.style.stroke = selectColor;
                    box.style.strokeWidth = dilate || 0;
                    shape.appendChild(box);
                }
            }
        }
    };

    $("div.svg").on('click', function () {
        diagram.setSelection();
    });

    $.each(diagram.shapes, function (shapeId) {

        let info = diagram.shapes[shapeId];
        if (info.DefaultLink
            || info.Props && Object.keys(info.Props).length
            || info.Links && info.Links.length
            || info.Comment || info.PopoverMarkdown || info.SidebarMarkdown || info.TooltipMarkdown
        ) {
            let shape = findTargetShape(shapeId);
            if (!shape)
                return;

            shape.style.cursor = 'pointer';

            shape.addEventListener('click', function (evt) {
                evt.stopPropagation();
                diagram.setSelection(shapeId);
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

    $("body").addClass(right ? "vp-sidebar-right" : "vp-sidebar-left");

    var sidebarWidth = +diagram.sidebarDefaultWidth || 400;

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

    if (isSidebarEnabled() && !diagram.alwaysHideSidebar) {
        showSidebar(showSidebarSetting, 0);
        showSidebarMarkdown(null, false);
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
        $("body").css("user-select", null);

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
        $("body").css("user-select", "none");

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
                }, animationTime);

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

    function showSidebarMarkdown(thisShapeId, showAutomatically) {

        let shape = thisShapeId ? diagram.shapes[thisShapeId] : diagram.currentPageShape;
        let sidebarMarkdown = shape && shape.SidebarMarkdown || (diagram.enableSidebarMarkdown && diagram.sidebarMarkdown) || '';
        let html = shape && marked(Mustache.render(sidebarMarkdown, shape)) || '';
        $("#sidebar-html").html(html);

        if (showAutomatically) {
            showSidebar(!!shape, 400);
        }
    }

    function onSelectionChanged(thisShapeId) {
        showSidebarMarkdown(thisShapeId, diagram.showSidebarOnSelection);
    }

    diagram.selectionChanged.add(onSelectionChanged);
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

    //TODO: consolidate when migrating from jQuery
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

    $.each(diagram.shapes, function (shapeId, shape) {

        const $shape = $(findTargetShape(shapeId));

        const tooltipMarkdown = shape.TooltipMarkdown || shape.Comment || (diagram.enableTooltipMarkdown && diagram.tooltipMarkdown) || '';
        const tip = marked(Mustache.render(tooltipMarkdown, shape));
        const placement = diagram.tooltipPlacement || "auto top";

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

        if (diagram.tooltipUseMousePosition) {

            var mouseEvent = {};
            $.fn.tooltip.Constructor.prototype.update = function (e) {

                mouseEvent.pageX = e.pageX;
                mouseEvent.pageY = e.pageY;
                var $tip = this.tip();

                var pos = this.getPosition()
                var actualWidth = $tip[0].offsetWidth
                var actualHeight = $tip[0].offsetHeight

                var placement = typeof this.options.placement == 'function' ?
                    this.options.placement.call(this, $tip[0], this.$element[0]) :
                    this.options.placement

                var autoToken = /\s?auto?\s?/i
                var autoPlace = autoToken.test(placement)
                if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

                if (autoPlace) {
                    var orgPlacement = placement
                    var viewportDim = this.getPosition(this.$viewport)

                    placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' :
                    placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' :
                    placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' :
                    placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' :
                    placement

                    $tip
                        .removeClass(orgPlacement)
                        .addClass(placement)
                }

                var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

                this.applyPlacement(calculatedOffset, placement)
            }

            var originalGetPosition = $.fn.tooltip.Constructor.prototype.getPosition;
            $.fn.tooltip.Constructor.prototype.getPosition = function ($elem) {
                if ($elem || typeof (mouseEvent.pageX) !== 'number' || typeof(mouseEvent.pageY) !== 'number') {
                    return originalGetPosition.call(this, $elem);
                } else {
                    return {
                        left: mouseEvent.pageX,
                        top: mouseEvent.pageY,
                        width: 1,
                        height: 1
                    };
                }
            };

            $shape.on('mousemove', function (e) {
                $shape.data('bs.tooltip').update(e);
            })
        }
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
