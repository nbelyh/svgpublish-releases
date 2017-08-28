function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function () {

    var term = getParameterByName('term');

    $.get("https://api.github.com/users/nbelyh/gists", function (json) {

        var data = json.map(function(x) {
            var firstFile = Object.keys(x.files)[0];
            return {
                name: x.description.substr(0, x.description.indexOf('.')),
                description: x.description.substr(x.description.indexOf('.')+1),
                hash: x.id,
                url: x.files[firstFile].raw_url
            };
        }).filter(function(x) {
            return x.name.indexOf(term) >= 0
        });

        var template = $('#template').html();
        var rendered = Mustache.render(template, data);
        $('#target').html(rendered);

        $('.list-group a').click(function (e) {
            e.preventDefault()

            $that = $(this);

            $.get($that.attr('url'), function(result) {
                $("#preview").html(result);
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