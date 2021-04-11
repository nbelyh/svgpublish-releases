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
        filter.setAttribute('data-container', 'body');
        filter.setAttribute('data-live-search', true);
        filter.setAttribute('data-width', "100%");
        filter.setAttribute('title', 'Filter by property');

        for (var propName of propNames) {
            let option = document.createElement("option");
            option.innerText = propName;
            filter.appendChild(option);
        }

        return filter;
    }

    let propertyFilter = null;
    if (diagram.enablePropertySearchFilter) {

        let usedPropSet = {};
        for (var pageId in diagram.searchIndex) {
            const pageSearchIndex = diagram.searchIndex[pageId];
            for (var shapeId in pageSearchIndex) {
                for (var propName in pageSearchIndex[shapeId]) {
                    usedPropSet[propName] = 1;
                }
            }
        }

        propertyFilter = buildPropFilter(Object.keys(usedPropSet));
        document.querySelector("#search-property-filter").appendChild(propertyFilter);
        $(propertyFilter).selectpicker();
        $(propertyFilter).on('changed.bs.select', function () {
            search($("#search-term").val());
        })
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

    function search(term) {

        const usedPropNames = propertyFilter ? $(propertyFilter).val() : [];

        var elem = document.getElementById('panel-search-results');
        elem.innerHTML = '';

        if (term || usedPropNames.length) {
            
            var hr = document.createElement("hr");
            elem.appendChild(hr);

            var p = document.createElement("p");

            var label = document.createElement("span");
            label.innerText = elem.getAttribute('data-searchresults');
            p.appendChild(label);

            var strong = document.createElement("strong");
            strong.innerText = " " + term + " ";
            p.appendChild(strong);

            var span = document.createElement("span");
            span.innerText = usedPropNames.length ? " (" + usedPropNames.join(", ") + "):" : ":";
            p.appendChild(span);

            elem.appendChild(p);

            var ul = document.createElement("ul");
            ul.className = "nav nav-stacked nav-pills";
            elem.appendChild(ul);

            var currentPageId = +diagram.currentPage.Id;
            processPage(term, +currentPageId, ul, false, usedPropNames);
            for (var pageId in diagram.searchIndex) {
                if (+pageId !== +currentPageId)
                    processPage(term, +pageId, ul, true, usedPropNames);
            };
        }
    };

    $("#search-term").on("keyup", function () {
        search($("#search-term").val());
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
