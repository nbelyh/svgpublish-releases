$.get("./list.json", function(data) {
	var template = $('#template').html();
	var rendered = Mustache.render(template, data);
	$('#target').html(rendered);
});