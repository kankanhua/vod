/*
*	loader.js for apdbase framework load js and css
*
*	@version 1.0.0
*	@author funnylin
*	@date 2013.11.08.2
*/



(function(){

/*
	var sourceCSS = [
		["bootstrap","css/bootstrap.min.css"],
		["bootstrap-responsive","css/bootstrap-responsive.min.css"],
		["font-awesome","css/font-awesome.min.css"],
		["ace","css/ace.min.css"],
		["ace-responsive","css/ace-responsive.min.css"],
		["ace-skins","css/ace-skins.min.css"],
		["jquery-ui","css/jquery-ui-1.10.3.full.min.css"],
		["base","css/base.css"]
	];
*/

	var sourceCSS = [
		["loader","../../static/oss/loader.css"],
		["font-awesome","../../static/shared/css/font-awesome.min.css"],
	];
	var sourceJS=[
		["jquery","../../static/ApdBase/js/jquery.min.js"],
		["jquery-ui","../../static/ApdBase/js/jquery-ui-1.10.3.full.min.js"],
		["bootstrap","../../static/ApdBase/js/bootstrap.min.js"],
		["ace-extra","../../static/ApdBase/js/ace-extra.min.js"],
		["ace-elements","../../static/ApdBase/js/ace-elements.min.js"],
		["ace","../../static/ApdBase/js/ace.min.js"],
		["hashchange","../../static/ApdBase/js/jquery.hashchange.min.js"],
		["dataTables","../../static/ApdBase/js/jquery.dataTables.min.1.10.js"],
		//["dataTables","js/jquery.dataTables.min.js"],
		["dataTables-bootstrap","../../static/ApdBase/js/jquery.dataTables.bootstrap.js"],
		["FixedColumns","../../static/ApdBase/js/FixedColumns.js"],
		["jquery-rtx","../../static/public2.0/plugin/jquery.rtx.js"],
		["jquery-json","../../static/ApdBase/js/jquery.json.js"],
		["jquery-cookie","../../static/ApdBase/js/jquery.cookie.js"],
		["bootstrap-datepicker","../../static/ApdBase/js/bootstrap-datepicker.min.js"],
		["bootstrap-datepicker-zh","../../static/ApdBase/js/bootstrap-datepicker.zh-CN.min.js"],
		["apd_base","../../static/ApdBase/js/apd_base.js"],
		["hrc","../../static/ApdBase/js/hrc.jquery.ext.js"],
		["block-ui","../../static/ApdBase/js/block-ui/js/jquery.blockUI.js"]
	];

	var sourceAssJS=[
		["track","../../static/ApdBase/js/track.js"],
		["autocomplete.js","../../static/ApdBase/js/autocomplete.x.js"],
		["touch-punch","../../static/ApdBase/js/jquery.ui.touch-punch.min.js"],
		["slimscroll","../../static/ApdBase/js/jquery.slimscroll.min.js"],
		["pie","../../static/ApdBase/js/jquery.easy-pie-chart.min.js"],
		["sparkline","../../static/ApdBase/js/jquery.sparkline.min.js"],
		["flot","../../static/ApdBase/js/jquery.flot.min.js"],
		["pie","../../static/ApdBase/js/jquery.flot.pie.min.js"],
		["resize","../../static/ApdBase/js/jquery.flot.resize.min.js"],
		["fuelux","../../static/ApdBase/js/fuelux.wizard.js"],
		["fuelux.tree","../../static/ApdBase/js/fuelux.tree.min.js"],
		["validate","../../static/ApdBase/js/jquery.validate.min.js"],
		["bootbox","../../static/ApdBase/js/bootbox.min.js"],
		["highcharts","../../static/ApdBase/js/highcharts.js"]
	];

	var head = document.getElementsByTagName("head")[0];

	var IS_CSS_RE = /\.css(?:\?|$)/i;
	var READY_STATE_RE = /^(?:loaded|complete|undefined)$/;
	var currentlyAddingScript;
	var interactiveScript;

	var Loader = {
		request:function(url,callback,arr){
			var isCSS = IS_CSS_RE.test(url);
			var node = document.createElement(isCSS ? "link" : "script");

			Loader.addOnload(node, callback, isCSS, arr);
			if (isCSS) {
				node.rel = "stylesheet"
				node.href = url
			}
			else {
				node.async = true
				node.src = url;
			}

			currentlyAddingScript = node;
			head.appendChild(node);
			currentlyAddingScript = null;
		},
		addOnload:function(node, callback, isCSS, arr){

			node.onload = node.onerror = node.onreadystatechange = function() {
			if (READY_STATE_RE.test(node.readyState)) {
			  // Ensure only run once and handle memory leak in IE
			  node.onload = node.onerror = node.onreadystatechange = null

			  // Remove the script to reduce memory leak
			  if (!isCSS) {
				//head.removeChild(node)
			  }

			  // Dereference the node
			  node = null

			  if( parseInt(callback) == callback){
				//console.log(callback,arr[callback][1]);
				callback += 1;
				if(callback < arr.length){
					Loader.request(arr[callback][1],callback,arr);
				}
				else {
				}
			  }
			  else {
				if(callback) callback();
			  }
			}
		  }
		},
		loadUserScript:function(){
			var scripts = document.getElementsByTagName("script");
			Loader.userUrl=[];
			for( var i=0; i < scripts.length; i++){
				if(scripts[i].getAttribute("data-src")){
					Loader.userUrl.push(["",scripts[i].getAttribute("data-src")]);
				}
			}
		}

	}
	Loader.loadUserScript();
	var js = sourceJS.concat(sourceAssJS).concat(Loader.userUrl);
	Loader.request(sourceCSS[0][1],0,sourceCSS);
	Loader.request(js[0][1],0,js);


})();
