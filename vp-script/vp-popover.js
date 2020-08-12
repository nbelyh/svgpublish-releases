
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
                    //We entered the actual popover – call off the dogs
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

        if (placement === 'mouse') {
            const $span = $('<span style="position:absolute"/>');
            $span.appendTo("body");

            $span.popover(options);

            let timeout;
            $shape.on('mousemove', function (e) {
                clearTimeout(timeout);
                $span.css({ top: e.pageY, left: e.pageX });
                timeout = setTimeout(function () {
                    $span.popover('show');
                }, 100);
            });

            $shape.on('mouseleave', function () {
                clearTimeout(timeout);
                $span.popover('hide');
            });
        } else {
            options.placement = placement;
            $shape.popover(options);
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
