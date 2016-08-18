$(function() {
    $( "#sortable1, #sortable2" ).sortable({
        connectWith: ".connectedSortable",
        stop : function (event, ui) {
             //alert($( "#sortable1" ).sortable( "toArray" ));
             //alert($( "#sortable2" ).sortable( "toArray" ));
            var liid = ui.item.attr("id");
			var content1 =  $(this).siblings("select").val(), content2 = $(this).parent().siblings("div").children("select").val();

			var id1 = this.id, id2 = $(this).parent("div").siblings("div").children ("ul").attr("id");
            var list1 = $("#" + id1).sortable("toArray"), list2 = $("#" + id2).sortable("toArray");

			for (i = 0; i < group2OCList[content1].length; ++ i) {
				if (liid == group2OCList[content1][i]["id"]) {
					break;
				}
			}

			var curIndex = jQuery.inArray (liid, list1);
			if (curIndex == -1) {
				var ele = group2OCList[content1][i];
				group2OCList[content1].splice(i, 1);
				var newIndex = jQuery.inArray (liid, list2);
				ele["weight"] = (newIndex == 0 ? group2OCList[content2][0]["weight"] : group2OCList[content2][newIndex - 1]["weight"]);
				group2OCList[content2].splice(newIndex, 0, ele);

				updateUL ($("#" + id1).parent('div').attr("id"), content1);
				updateUL ($("#" + id2).parent('div').attr("id"), content2);
			}
			else if (curIndex != i) {
				var ele = group2OCList[content1][i];
				group2OCList[content1].splice(i, 1);
				ele["weight"] = (curIndex == 0 ? group2OCList[content1][0]["weight"] : group2OCList[content1][curIndex - 1]["weight"]);
				group2OCList[content1].splice(newIndex, 0, ele);
				updateUL ($("#" + id1).parent('div').attr("id"), content1);
				updateUL ($("#" + id2).parent('div').attr("id"), content2);
			}
        },
        out : function (event, ui) {

        }
     }).disableSelection();
	$("#confirm-dialog").hide();
	$("#newOC-form").hide();
	$("#OC-form").hide();
	$("#OC-form-table").DataTable({

	});
 });

function mutex (id1, id2) {
    var toDisabledOption = $("#"+id1).children("select").val();
    $("#"+id2).find("option").show();
    $("#"+id2).find("#"+toDisabledOption).hide();
    updateUL(id1, toDisabledOption);
}

function sortOC (oc1, oc2) {
    if (oc2["weight"] == oc1["weight"]) {
		return oc1["id"] - oc2["id"];
	}
    return oc2["weight"] - oc1["weight"];
}

function updateUL(id, content) {
	if (content == "none") {
		return false;
	}
    $("#" + id).children("ul").children("li").remove();
    group2OCList[content].sort(sortOC);
    group2OCList[content].forEach( function(e) {
        $("#" + id).children("ul").append (
            "<li id=" + e["id"] + " onclick='showOC(" + content + "," + e["id"] + ")'> <div style='text-shadow:0 -1px 0 rgba(0,0,0,0.25);" + (e["state"] == 1 ? "background-color:#49afcd;background-image:linear-gradient(to buttom,#5bc0de,#2f96b4);background-repeat:repeat-x;" : "background-color:#bd362f;") + "cursor:pointer;color:#fff;border:1px solid #ccc;'> OC id: " + e["id"] + "  " + e["name"] + " 权重: " + e["weight"] +"</div></li>"
        );
    });
}

function loadGroup2OCList () {
	$.ajax ({
		type: 'GET',
		url : 'ftp_distribution_ocinfo_getOCList',
		async : false,
		cache : false,
		processData : false,
		dataType: 'json',
		success : function (data) {
			group2OCList = data;
		},
		error : function (data) {
		}
	});
}

function updateOCs () {
	$("#confirm-dialog").dialog({
		modal : true,
		buttons: {
			"确认修改" : function () {
				$.ajax ({
					type: 'POST',
					url : 'ftp_distribution_ocinfo_updateOCInfo',
					data : JSON.stringify(group2OCList),
					cache : false,
					processData : false,    
					contentType : "application/json",
					dataType: 'json',
					success : function (data) {
					},
					error : function (data) {
						alert(data.error);
					}
				});
				loadGroup2OCList ();
				$("#confirm-dialog").dialog("close");
			},
			"取消" : function () {
				$("#confirm-dialog").dialog("close");
			}
		}
	});
}

function reset () {
	loadGroup2OCList ();
	mutex ("left-div", "right-div");
	mutex ("right-div", "left-div");
}

function showOC (groupName, ocid) {
	$.ajax ({
		type: 'GET',
		url : 'ftp_distribution_ocinfo_getOCInfo?ocid=' + ocid,
		cache : false,
		processData : false,    
		dataType: 'json',
		success : function (data) {
			$("#OC-form-info").html ("<h2>" + data.name + "(oc id:" + ocid + ")</h2>");
			$("#OC-form-table").dataTable().fnClearTable();
			for (var i in data.agent) {
				$("#OC-form-table").dataTable().fnAddData([
						data.agent[i].wan,
						data.agent[i].lan,
						data.agent[i].state == 1 ? "启用" : "禁用"
					]);
			}
			$("#OC-form-table").dataTable().fnDraw();
			$("#OC-form").dialog({
				modal : true,
				width : 500,
			});
		},
		error : function (data) {
			alert(data.error);
		}
	});
}

function newOC () {
	$("#newOC-form").dialog({
		modal : true
	});
}
