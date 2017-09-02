function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function findFirstFile(files) {
    var js = $.grep(files, f => f.split('.').pop() == 'js');
    return js && js.length ? js[0] : files[0];
}

$(document).ready(function () {

    var term = getParameterByName('term');

    $.get("https://api.github.com/users/nbelyh/gists", function (json) {

        var data = json.map(function(x) {
            
            var firstFile = findFirstFile(Object.keys(x.files));

            return {
                name: x.description.substr(0, x.description.indexOf('.')),
                description: x.description.substr(x.description.indexOf('.')+1),
                hash: x.id,
                filename: x.files[firstFile].filename,
                url: x.files[firstFile].raw_url,
            };
        });
        
        var dataFiltered = $.grep(data, function(x) {
            return x.name && (!term || x.name.indexOf(term) >= 0)
        });

        var itemTemplate = $('#itemTemplate').html();
        var itemRendered = Mustache.render(itemTemplate, dataFiltered);
        $('#target').html(itemRendered);

        $('.list-group a').click(function (e) {
            e.preventDefault()

            $that = $(this);

            $.get($that.attr('url'), function(result) {

                var previewTemplate = $('#previewTemplate').html();
                var previewRendered = Mustache.render(previewTemplate, {
                    url: "https://gist.github.com/nbelyh/" + $that.attr('hash'),
                    filename: $that.attr('filename'),
                    html: result
                });
                        
                $("#preview").html(previewRendered);
            })

            $('#details').html($that.attr('url'))

            $that.parent().find('a').removeClass('active');
            $that.addClass('active');
        });

    });
})

function getSelectedHash() {
    return $("#target a.active").attr("id")
}
