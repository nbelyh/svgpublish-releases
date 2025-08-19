
//-----------------------------------------------------------------------
// Copyright (c) 2017-2022 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

(function (diagram) {

    var settings = diagram.settings || {};

    if (!diagram.shapes || !settings.enableSelection)
        return;

    diagram.highlightedShapeIds= {};

    //TODO: consolidate when migrating from jQuery
    function findTargetShape(shapeId) {
        const shape = document.getElementById(shapeId);

        const info = diagram.shapes[shapeId];
        if (!info || !info.IsContainer)
            return shape;

        if (!info.ContainerText)
            return null;

        for (let i = 0; i < shape.children.length; ++i) {
            const child = shape.children[i];
            if (child.textContent.indexOf(info.ContainerText) >= 0)
                return child;
        }
    }

    diagram.setSelection = function (shapeId) {

        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            const selectedShape = findTargetShape(diagram.selectedShapeId);
            if (selectedShape) {
                diagram.removeShapeHighlight(selectedShape);
                delete diagram.highlightedShapeIds[diagram.selectedShapeId];
                const info = diagram.shapes[diagram.selectedShapeId];

                if ((settings.enableNextShapeColor || settings.enableNextConnColor) && info.ConnectedTo) {
                    for (let item of info.ConnectedTo) {
                        if (settings.enableNextShapeColor) {
                            const sid = findTargetShape(item.sid);
                            diagram.removeShapeHighlight(sid);
                            delete diagram.highlightedShapeIds[item.sid];
                        }

                        if (settings.enableNextConnColor) {
                            const cid = findTargetShape(item.cid);
                            diagram.removeConnHighlight(cid);
                            delete diagram.highlightedShapeIds[item.cid];
                        }

                        
                    }
                }

                if ((settings.enablePrevShapeColor || settings.enablePrevConnColor) && info.ConnectedFrom) {
                    for (let item of info.ConnectedFrom) {
                        if (settings.enablePrevShapeColor) {
                            const sid = findTargetShape(item.sid);
                            diagram.removeShapeHighlight(sid);
                            delete diagram.highlightedShapeIds[item.sid];
                        }

                        if (settings.enablePrevConnColor) {
                            const cid = findTargetShape(item.cid);
                            diagram.removeConnHighlight(cid);
                            delete diagram.highlightedShapeIds[item.cid];
                        }
                    }
                }
            }

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.highlightedShapeIds = {};
            diagram.selectionChanged.fire(shapeId);

            const shapeToSelect = findTargetShape(shapeId);
            if (shapeToSelect) {
                const info = diagram.shapes[shapeId];

                if ((settings.enableNextShapeColor || settings.enableNextConnColor) && info.ConnectedTo) {
                    for (const item of info.ConnectedTo) {
                        if (settings.enableNextShapeColor) {
                            const nextColor = settings.nextShapeColor || "rgba(255, 255, 0, 0.4)";
                            const sid = findTargetShape(item.sid);
                            diagram.setShapeHighlight(sid, 'url(#next)', nextColor);
                            diagram.highlightedShapeIds[item.sid] = true;
                        }

                        if (settings.enableNextConnColor) {
                            const connColor = settings.nextConnColor || "rgba(255, 0, 0, 1)";
                            const cid = findTargetShape(item.cid);
                            diagram.setConnHighlight(cid, connColor);
                            diagram.highlightedShapeIds[item.cid] = true;
                        }
                    }
                }

                if ((settings.enablePrevShapeColor || settings.enablePrevConnColor) && info.ConnectedFrom) {
                    for (const item of info.ConnectedFrom) {

                        if (settings.enablePrevShapeColor) {
                            const prevColor = settings.prevShapeColor || "rgba(255, 255, 0, 0.4)";
                            const sid = findTargetShape(item.sid);
                            diagram.setShapeHighlight(sid, 'url(#prev)', prevColor);
                            diagram.highlightedShapeIds[item.sid] = true;
                        }

                        if (settings.enablePrevConnColor) {
                            const connColor = settings.prevConnColor || "rgba(255, 0, 0, 1)";
                            const cid = findTargetShape(item.cid);
                            diagram.setConnHighlight(cid, connColor);
                            diagram.highlightedShapeIds[item.cid] = true;
                        }
                    }
                }

                const selectionColor = settings.selectionColor || "rgba(255, 255, 0, 0.4)";
                diagram.setShapeHighlight(shapeToSelect, 'url(#select)', selectionColor);
                diagram.highlightedShapeIds[shapeId] = true;
            }
        }
    };

    document.querySelector("div.svg").addEventListener('click', function () {
        diagram.setSelection();
    });

    for (const shapeId in diagram.shapes) {

        const info = diagram.shapes[shapeId];

        if (info.DefaultLink
            || info.Props && Object.keys(info.Props).length
            || info.Links && info.Links.length
            || info.Comment || info.PopoverMarkdown || info.SidebarMarkdown || info.TooltipMarkdown
            || settings.enableNextShapeColor && info.ConnectedTo
            || settings.enablePrevShapeColor && info.ConnectedFrom
        ) {
            const shape = findTargetShape(shapeId);
            if (shape) {
                shape.style.cursor = 'pointer';
                shape.addEventListener('click', function (evt) {
                    evt.stopPropagation();
                    diagram.setSelection(shapeId);
                });
            }
        }
    }

    function getUrlParameter(name) {
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    diagram.highlightShape = function (shapeId) {
        $("#" + shapeId).fadeTo(300, 0.3).fadeTo(300, 1).fadeTo(300, 0.3).fadeTo(300, 1);
        diagram.setSelection(shapeId);
    };

    function processHash() {
        const shape = getUrlParameter('shape');
        if (shape) {
            diagram.highlightShape(shape);
        }
    }

    processHash();
    $(window).on('hashchange', processHash);
})(window.svgpublish);
