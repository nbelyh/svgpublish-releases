$.get("./list.json", function(data) {
	var template = $('#template').html();
	var rendered = Mustache.render(template, data);
	$('#target').html(rendered);
});

$(document).ready(function() {
    $('.list-group a').click(function(e) {
            e.preventDefault()

        $that = $(this);

        $that.parent().find('a').removeClass('active');
        $that.addClass('active');
    });
})

function getSelectedHash() {
    return $("#target a.active").attr("id")
}