
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache, marked */

(function (diagram) {

    var settings = diagram.settings || {};

    if (!diagram.shapes || !settings.enablePopovers) {
        return;
    }

    if (settings.popoverKeepOnHover) {

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
    }

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

    $.each(diagram.shapes, function (shapeId, shape) {

        var $shape = $(findTargetShape(shapeId));

        var popoverMarkdown = shape.PopoverMarkdown || (settings.enablePopoverMarkdown && settings.popoverMarkdown) || shape.Comment || '';

        var m = /([\s\S]*)^\s*----*\s*$([\s\S]*)/m.exec(popoverMarkdown);

        var titleMarkdown = m && m[1] || '';
        var contentMarkdown = m && m[2] || popoverMarkdown;

        var title = titleMarkdown && marked.parse(Mustache.render(titleMarkdown, shape)).trim() || '';
        var content = contentMarkdown && marked.parse(Mustache.render(contentMarkdown, shape)).trim() || '';

        var placement = settings.popoverPlacement || "auto top";

        if (!content)
            return;

        var options = {
            container: "body",
            html: true,
            title: title,
            content: content,
            placement: placement
        };

        if (settings.popoverTrigger) {
            options.trigger = settings.popoverTrigger;
        }

        if (settings.popoverTimeout || settings.popoverKeepOnHover) {
            options.delay = {
                show: settings.popoverTimeoutShow || undefined,
                hide: settings.popoverTimeoutHide || settings.popoverKeepOnHover ? 200 : undefined
            }
        }

        $shape.popover(options);

        if (settings.popoverUseMousePosition) {

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

    if (settings.popoverOutsideClick) {
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

})(window.svgpublish);
