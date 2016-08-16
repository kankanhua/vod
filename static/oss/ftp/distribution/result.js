$(document).ready(function () {
	$(".query_input").hide();
	$("#query_input_1").show();
});

$("#query_selector").change(function() {
	$(".query_input").hide();
	$("#query_input_" + $(this).val()).show();
});
