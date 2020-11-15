
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
