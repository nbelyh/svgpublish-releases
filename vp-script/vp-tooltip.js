
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache, marked */

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
                    //We entered the actual popover – call off the dogs
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

        var tooltipMarkdown = shape.TooltipMarkdown || (diagram.enableTooltipMarkdown && diagram.tooltipMarkdown) || shape.Comment || '';
        var tip = tooltipMarkdown && marked.parse(Mustache.render(tooltipMarkdown, shape)).trim();
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

        if (diagram.processNested) {
            // avoid double-tooltips
            $shape.on('show.bs.tooltip', function () {
                $shape.parents().tooltip('hide');
            });
        }

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
