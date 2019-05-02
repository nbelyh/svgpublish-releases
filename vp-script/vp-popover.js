
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
