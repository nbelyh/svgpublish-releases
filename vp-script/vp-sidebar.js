$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.enableSidebar)
        return;

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

    var showSidebarSetting = storage ? storage.getItem("DiagramSidebarVisible") == '1' : 0;

    $("#sidebar-toggle").show();

    if (isSidebarEnabled()) {
        showSidebar(showSidebarSetting, 0);
    }

    var dragWidth;
    var dragClientX;

    var fnMouseMove = function (mouseMoveEvt) {
        if (dragClientX) {
            var width = (mouseMoveEvt.clientX - dragClientX + dragWidth);

            if (width < 0)
                width = 0;

            $("#diagram-sidebar").width(width + 'px').show();
            $("#sidebar-toggle").css("left", width + 'px');
        }
    };

    var fnMouseUp = function (mouseUpEvt) {

        $(document).off('mousemove', fnMouseMove);
        $(document).off('mouseup', fnMouseUp);

        var width = (mouseUpEvt.clientX - dragClientX + dragWidth);

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
			    width: (sidebarWidth) + 'px',
			}, animationTime);

            $("#sidebar-toggle")
			.addClass("rotated")
			.animate({
			    left: (sidebarWidth - 2) + 'px'
			}, animationTime);
        } else {
            $("#diagram-sidebar").animate({
                width: "0"
            }, animationTime, function () {
                $("#diagram-sidebar").hide();
            });

            $("#sidebar-toggle")
			.removeClass("rotated")
			.animate({
			    left: "0"
			}, animationTime);
        }

        if (isSidebarEnabled() && storage) {
            storage.setItem("DiagramSidebarVisible", show ? '1' : '0');
            storage.setItem("DiagramSidebarWidth", sidebarWidth);
        }
    }

    diagram.showSidebar = showSidebar;
});
