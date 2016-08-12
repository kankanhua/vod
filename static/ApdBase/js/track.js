/* by oceanwang & funnylin
2013122601
*/

function _track(url)
{
var interval_time = 10;//间隔时间
var apd_tf = "apdbase";
var apd_pu = "";
var apd_pf = "apdbase";
var apd_su = window.location;
var apd_sf = document.referrer; 
var apd_of = "";
var apd_op = "";
var apd_ops = 1;//访问页面数
var apd_ot = 1;
var apd_d = new Date();
var apd_color = "";
var apd_loginname = "";
var apd_browser = "";
var apd_path="";
if (navigator.appName == "Netscape") {
	apd_color = screen.pixelDepth;
} else {
	apd_color = screen.colorDepth;
}
try {
	apd_tf = top.document.referrer;
} catch (e) {}
try {
	apd_pu = window.parent.location;
} catch (e) {}
try {
	apd_pf = window.parent.document.referrer;
} catch (e) {}
try {
	var index=window.location.href.split("#")[0].lastIndexOf("/");
	var hostLen=window.location.host.length;
	apd_path=window.location.href.substr(7+hostLen,index-hostLen-7);
	apd_ops = document.cookie.match(new RegExp("(^| )AJSTAT_ok_pages=([^;]*)(;|$)"));
	apd_ops = (apd_ops == null) ? 1 : (parseInt(unescape((apd_ops)[2])) + 1);
	var apd_oe = new Date();
	apd_oe.setTime(apd_oe.getTime() + 60 * 60 * 1000);
	document.cookie = "AJSTAT_ok_pages=" + apd_ops + ";path="+apd_path+";expires=" + apd_oe.toGMTString();
	apd_ot = document.cookie.match(new RegExp("(^| )AJSTAT_ok_times=([^;]*)(;|$)"));
	if (apd_ot == null) {
		apd_ot = 1;
	} else {
		apd_ot = parseInt(unescape((apd_ot)[2]));
		apd_ot = (apd_ops == 1) ? (apd_ot + 1) : (apd_ot);
	}
	apd_oe.setTime(apd_oe.getTime() + 365 * 24 * 60 * 60 * 1000);
	document.cookie = "AJSTAT_ok_times=" + apd_ot + ";path="+apd_path+";expires=" + apd_oe.toGMTString();

} catch (e) {}
try {
	if (document.cookie == "") {
		apd_ops = -1;
		apd_ot = -1;
	}
} catch (e) {}
apd_of = apd_sf;
if (apd_pf !== "apdbase") {
	apd_of = apd_pf;
}
if (apd_tf !== "apdbase") {
	apd_of = apd_tf;
}
apd_op = apd_pu;
try {
	lainframe
} catch (e) {
	apd_op = apd_su;
}

apd_op = url || apd_op;

try {
	var Sys = {};
	var ua = navigator.userAgent.toLowerCase();
	if (window.ActiveXObject)
	Sys.ie = ua.match(/msie ([\d.]+)/)[1]
	else if (document.getBoxObjectFor)
	Sys.firefox = ua.match(/firefox\/([\d.]+)/)[1]
	else if (window.MessageEvent && !document.getBoxObjectFor)
	Sys.chrome = ua.match(/chrome\/([\d.]+)/)[1]
	else if (window.opera)
	Sys.opera = ua.match(/opera.([\d.]+)/)[1]
	else if (window.openDatabase)
	Sys.safari = ua.match(/version\/([\d.]+)/)[1];

	if(Sys.ie) apd_browser = 'IE:'+Sys.ie;
	if(Sys.firefox) apd_browser = 'Firefox:'+Sys.firefox;
	if(Sys.chrome) apd_browser = 'Chrome:'+Sys.chrome;
	if(Sys.opera) apd_browser= 'Opera:'+Sys.opera;
	if(Sys.safari) apd_browser = 'Safari:'+Sys.safari;

} catch (e) {}



//全局变量
apd_st=0,apd_stayTime;
var apd_stayTime=0;

//获得本次的时间
apd_beginTime=(new Date()).getTime();
//获得上一次的开始时间
var lastTimeArr = document.cookie.match(new RegExp("(^| )AJSTAT_ok_beginTimes=([^;]*)(;|$)")); 
var apd_lastTime = lastTimeArr && parseInt(unescape(lastTimeArr[2])) || apd_beginTime;
var UserArr = document.cookie.match(new RegExp("(^| )LoginName=([^;]*)(;|$)")); 
var apd_user = UserArr && UserArr[2] || "none";
//将本次时间保存，作为下次使用
document.cookie = "AJSTAT_ok_beginTimes=" + apd_beginTime + ";path="+apd_path+";expires=" + apd_oe.toGMTString();

apd_stayTime=(apd_beginTime-apd_lastTime)/1000;

	apd_src = 'http://apdlog.oa.com/track/track.png?apd_stayTime='+ apd_stayTime +'&tpages=' + apd_ops + '&ttimes=' + apd_ot + '&tzone=' + (0 - apd_d.getTimezoneOffset() / 60) + '&sSize=' + screen.width + ',' + screen.height + '&referrer=' + escape(apd_of) + '&vpage=' + escape(apd_op) + '&vvtime=' + apd_d.getTime()+ '&apd_browser=' + escape(apd_browser) +'&apd_user=' + apd_user;
	setTimeout('apd_img = new Image;apd_img.src=apd_src;', 0);
	
	function addEventHandler(element, type, handler){
		if (element.addEventListener){
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent){
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
		}
	}
	
		//监听函数
	function removeEventHandler(element, type, handler){
		if (element.removeEventListener){
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent){
			element.detachEvent("on" + type, handler);
		} else {
			element["on" + type] = null;
		}
	}
	
	if( !has_start && (has_start = true)  ){
		addEventHandler(document,'mousemove',mouseMoveCountTime);
	}
	function mouseMoveCountTime(ev){
		var nowTime = (new Date()).getTime();
		var tmpTime = (nowTime - apd_beginTime);
		if( tmpTime < interval_time * 1000 ){
			apd_st += parseInt(tmpTime);
		}else {
			document.cookie = "AJSTAT_ok_beginTimes=" + nowTime + ";path="+apd_path+";expires=" + apd_oe.toGMTString();
		}
		apd_beginTime = nowTime;
		apd_stayTime = apd_st/1000;
		//每十秒发送一个包
		if ( apd_stayTime > interval_time ){
			apd_src = 'http://apdlog.oa.com/track/track2.png?apd_stayTime='+ apd_stayTime +'&tpages=' + apd_ops + '&ttimes=' + apd_ot + '&tzone=' + (0 - apd_d.getTimezoneOffset() / 60) + '&sSize=' + screen.width + ',' + screen.height + '&referrer=' + escape(apd_of) + '&vpage=' + escape(apd_op) + '&vvtime=' + apd_d.getTime()+ '&apd_browser=' + escape(apd_browser) +'&apd_user=' + apd_user;
			setTimeout('apd_img = new Image;apd_img.src=apd_src;', 0);
			document.cookie = "AJSTAT_ok_beginTimes=" + apd_beginTime + ";path="+apd_path+";expires=" + apd_oe.toGMTString();
			apd_st=0;
		}
		//apd_stayTime;
		return false;
	}
	
}
has_start = false;
_track();