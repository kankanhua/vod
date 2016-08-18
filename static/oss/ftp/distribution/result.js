$(document).ready(function () {
	$(".query_input").hide();
	$("#query_input_1").show();
	$("#startTime").datepicker({format: "yyyymmdd",endDate:Date()});
	$("#endTime").datepicker({format: "yyyymmdd",endDate:Date()});
	$("#query_result_table").dataTable({
		bSort : false
	});
	$("#query_result_div").hide();
});


$("#query_selector").change(function() {
	$(".query_input").hide();
	$("#query_input_" + $(this).val()).show();
	$("#query_result_div").hide();
});

function resultSort () {
	$("#query_result_table").fnSort([]);
}

function getTimeConsume (start, end) {
	return (new Date(end) - new Date(start)) / 1000;
}

function showFileMsg (id) {
	$("#" + id).dialog({
		modal : true,
		width : "500px",
	});
}

function showTimeConsume (id) {
	$("#" + id).dialog({
		modal : true,
		width : "500px",
	});
}

function showFailure (id) {
	$("#" + id + "_table").dataTable();
	$("#" + id).dialog({
		modal : true,
		width : "500px",
	});
}

function queryByName () {
	var name = $("#query_value_1").val();
	if (name.length == 0) {
		alert("请填写文件名");
		return;
	}
	var start_time = $("#startTime").val();
	if (start_time.length == 0) {
		alert("请选择查询起始时间");
		return;
	}
	var end_time = $("#endTime").val();
	if (end_time.length == 0) {
		alert("请选择查询结束时间");
		return;
	}
	if (end_time < start_time) {
		alert("结束时间不能小于起始时间.请检查查询时间");
		return;
	}
	else {
		$("#query_result_table").dataTable().fnClearTable();
		addRow(name, start_time, end_time, true);
		$("#query_result_table").dataTable().fnDraw();
		$("#query_result_div").show();
	}
}

function queryByVid () {
	var vid = $("#query_value_2").val();
	if (vid.length == 0) {
		alert("请填写vid");
		return;
	}
	var start_time = $("#startTime").val();
	if (start_time.length == 0) {
		alert("请选择查询起始时间");
		return;
	}
	var end_time = $("#endTime").val();
	if (end_time.length == 0) {
		alert("请选择查询结束时间");
		return;
	}
	if (end_time < start_time) {
		alert("结束时间不能小于起始时间.请检查查询时间");
		return;
	}
	else {
		$.ajax ({
			url : "ftp_distribution_result_getFileId?vid=" + vid,
			type : 'GET',
			dataType : 'json',
			success : function (data) {
				var fileList = data.data[0].Results[0].Fields.viddata[0].fileids;
				$("#query_result_table").dataTable().fnClearTable();
				$("#query_result_div").show();
				for (var i = 0; i < fileList.length; ++ i) {	
					addRow(fileList[i], start_time, end_time, false);
					$("#query_result_table").dataTable().fnDraw();
				}
			},
			error : function (data) {
				alert("获取数据失败！请检查网络或者稍后重试！");
			}
		});
	}
}


function queryByFile () {
	var file = document.getElementById("query_value_3").files[0];
	if (file.length == 0) {
		alert("不允许空文件");
		return;
	}
	var start_time = $("#startTime").val();
	if (start_time.length == 0) {
		alert("请选择查询起始时间");
		return;
	}
	var end_time = $("#endTime").val();
	if (end_time.length == 0) {
		alert("请选择查询结束时间");
		return;
	}
	if (end_time < start_time) {
		alert("结束时间不能小于起始时间.请检查查询时间");
		return;
	}
	else {
		var fr = new FileReader();
		$("#query_result_table").dataTable().fnClearTable();
		$("#query_result_div").show();
		fr.onload = function () {
			var result = this.result.split("\r\n");
			for (var i = 0; i < result.length; ++ i) {
				if(result[i].length != 0) {
					addRow(result[i], start_time, end_time, true);
					$("#query_result_table").dataTable().fnDraw();
				}
			}
		};
		fr.readAsText (file);
	}
}

function addRow (name, start_time, end_time, showFalse) {
	$.ajax ({
		url : "ftp_distribution_result_get?file_name=" + name + "&start_time=" + start_time + "&end_time=" + end_time,
		type : 'GET',
		dataType : 'json',
		success : function (data) {
			if (data.data != null) {
				var max1stIdx = 0, max2ndIdx = 0, minFailedIdx = 0, iJson = data.data[0];
				for (var i = 1; i < data.data.length; ++ i) {
					if (data.data[i].success_rate_1st > data.data[max1stIdx].success_rate_1st) {
						max1stIdx = i;
					}
					if (data.data[i].success_rate_2nd > data.data[max2ndIdx].success_rate_2nd) {
						max2ndIdx = i;
					}
					if (data.data[i].v_failed_oc_list.length < data.data[minFailedIdx].v_failed_oc_list.length) {
						minFailedIdx = i;
					}
				}
					
				var errorMsg = "", errorMsgMin = "";
				$.each(iJson.v_failed_oc_list, function (i, val) {
					errorMsg += "<tr><td>" + val.oc_id + "</td><td>" + val.oc_ip + "</td><td>";
					if (val.errcode == 0 && val.oc_ip == "0.0.0.0") {
						errorMsg += "任务超时";
					}
					else {
						if (val.errcode == 0) {
							errorMsg += "未分类错误";
						}
					}_
					if (val.errcode > -111000 && val.errcode <= -110500) {
						errorMsg += "TaskMaster模块出错";
					}
					if (val.errcode > -112000 && val.errcode <= -111500) {
						errorMsg += "TaskGenerator模块出错";
					}
					if (val.errcode > -113000 && val.errcode <= -112500) {
						errorMsg += "TaskCache模块出错";
					}
					if (val.errcode > -114000 && val.errcode <= -113500) {
						errorMsg += "DataAgent模块出错";
					}
					errorMsg += "(错误码:" + val.errcode + ")</td><td>" + val.area + "</td></tr>"
				});
				if(minFailedIdx != 0) {
					$.each(data.data[minFailedIdx].v_failed_oc_list, function (i, val) {
						errorMsgMin += "<tr><td>" + val.oc_id + "</td><td>" + val.oc_ip + "</td><td>";
						if (val.errcode == 0 && val.oc_ip == "0.0.0.0") {
							errorMsgMin += "任务超时";
						}
						else {
							if (val.errcode == 0) {
								errorMsgMin += "未分类错误";
							}
						}_
						if (val.errcode > -111000 && val.errcode <= -110500) {
							errorMsgMin += "TaskMaster模块出错";
						}
						if (val.errcode > -112000 && val.errcode <= -111500) {
							errorMsgMin += "TaskGenerator模块出错";
						}
						if (val.errcode > -113000 && val.errcode <= -112500) {
							errorMsgMin += "TaskCache模块出错";
						}
						if (val.errcode > -114000 && val.errcode <= -113500) {
							errorMsgMin += "DataAgent模块出错";
						}
						errorMsgMin += "(错误码:" + val.errcode + ")</td><td>" + val.area + "</td></tr>"
					});
				}
				$("#query_result_table").dataTable().fnAddData([
						"<a href='javascript:void(0)' onclick='showFileMsg(\"" + "fileDialog_" + iJson.task_id + "\")'>"+ iJson.file_name + "</a><div title='" + iJson.file_name + "的文件信息' style='display:none' id=\"" + "fileDialog_" + iJson.task_id + "\"><p>文件大小: " + iJson.file_size + "</p><p>文件哈希值: " + iJson.hash_value + "</p><p>任务id: " + iJson.task_id + "</p></div>",
						iJson.domain,
						"<p>成功率: <font color=" + (data.data[max1stIdx].success_rate_1st < 90 ? "'red'" : "'green'") + ">" + iJson.success_rate_1st + "%" + (max1stIdx != 0 ? ("(最高为" + data.data[max1stIdx].success_rate_1st + "%)") : "") + "</font></p><a href='javascript:void(0)' onclick='showTimeConsume(\"" + "timeDialog_1_" + iJson.task_id + "\")' style='text-decoration:underline'>耗时: " + getTimeConsume(iJson.create_time, iJson.success_time_1st) + "s</a><div id=\"" + "timeDialog_1_" + iJson.task_id + "\" title='" + iJson.file_name + "一类机房分发时间记录' style='display:none'><p>创建时间: " + iJson.create_time + "</p><p>起始时间: " +  iJson.start_time + "</p><p>结束时间: " + iJson.success_time_1st + (max1stIdx != 0 ? ("</p><p>分发成功率最高时分发耗时为: " + getTimeConsume(data.data[max1stIdx].create_time, data.data[max1stIdx].success_time_1st) + "s") : "") + "</p></div>",
						"<p>成功率: <font color=" + (data.data[max2ndIdx].success_rate_2nd < 90 ? "'red'" : "'green'") + ">" + iJson.success_rate_2nd+ "%" +  (max2ndIdx != 0 ? ("(最高为" + data.data[max2ndIdx].success_rate_2nd + "%)") : "") + "</font></p><a href='javascript:void(0)' onclick='showTimeConsume(\"" + "timeDialog_2_" + iJson.task_id + "\")' style='text-decoration:underline'>耗时: " + getTimeConsume(iJson.create_time, iJson.success_time_2nd) + "s</a><div id=\"" + "timeDialog_2_" + iJson.task_id + "\" title='" + iJson.file_name + "二类机房分发时间记录' style='display:none'><p>创建时间: " + iJson.create_time + "</p><p>起始时间: " +  iJson.start_time + "</p><p>结束时间: " + iJson.success_time_2nd + (max2ndIdx != 0 ? ("</p><p>分发成功率最高时分发耗时为: " + getTimeConsume(data.data[max2ndIdx].create_time, data.data[max2ndIdx].success_time_2nd) + "s") : "") + "</p></div>",
						iJson.v_failed_oc_list.length + (minFailedIdx != 0 ? ("(最少分发失败OC数为: " + data.data[minFailedIdx].v_failed_oc_list.length + ")") : ""), 
						"<a href='javascript:void(0)' onclick='showFailure(\"" + "failDialog_" + iJson.task_id + "_1\")' style='text-decoration:underline'>详情</a><div id=\"" + "failDialog_" + iJson.task_id + "_1\" style='display:none;' title='" + iJson.file_name + "(任务id: " + iJson.task_id + ")分发失败的机房信息'><table id=\"" + "failDialog_"+ iJson.task_id + "_1_table\" class='table table-bordered no-footer'><thead><tr id='table-head' role='row'><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>OC id</font></th><th style='background-color:rgb(176,196,222);'class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>ip</font></th><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>出错原因</font></th><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>OC名称</font></th></tr></thead><tbody>" + errorMsg + "</tbody></table></div>" + (minFailedIdx != 0 ? "(<a href='javascript:void(0)' onclick='showFailure(\"" + "failDialog_" + data.data[minFailedIdx].task_id + "_2\")' style='text-decoration:underline'>最少分发失败数量的详情</a><div id=\"" + "failDialog_" + data.data[minFailedIdx].task_id + "_2\" style='display:none;' title='" + data.data[minFailedIdx].file_name + "(任务id: " +  data.data[minFailedIdx].task_id + ")分发失败的机房信息'><table id=\"" + "failDialog_"+ data.data[minFailedIdx].task_id + "_2_table\" class='table table-bordered no-footer'><thead><tr id='table-head' role='row'><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>OC id</font></th><th style='background-color:rgb(176,196,222);'class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>ip</font></th><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>出错原因</font></th><th style='background-color:rgb(176,196,222);' class='sorting_disabled' rowspan='1' colspan='1'><font color='black'>OC名称</font></th></tr></thead><tbody>" + errorMsgMin + "</tbody></table></div>)" : ""),
						"-",
				]);
			}	
			else {
				if (data.errno == 0 && showFalse)
				{
					$("#query_result_table").dataTable().fnAddData([
						"-",
						"-",
						"-",
						"-",
						"-",
						"-",
						"检索失败！分发数据库在[" + start_time + "~" + end_time + "]这个时间段内没有文件:" + name + "的分发记录"
					]);
				}
			}		
		},
		error : function (data) {
			alert("网络错误");
		}
	});
}
