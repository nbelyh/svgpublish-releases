
/*global jQuery, $ */

// compatibility with version 0.x
if (window.svgpublish)
    window.svgpublish.diagramData = window.svgpublish.shapes;

(function (diagram) {

    if (diagram.enableAutoFrameHeight) {
        var iframe = window.top.document.getElementById(window.name);
        if (iframe) {
            var wp = iframe.parentElement;
            var rc = wp.getBoundingClientRect();
            wp.style.height = 'calc(100vh - ' + rc.top + 'px)';
        }
    }
})(window.svgpublish);
