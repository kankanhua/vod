/*
    RTX Plugin for jQuery
    TNM2 2009-02-19
    
    $('span.englishname').rtxPresence();
*/
var rtx_frameRandom = 0;

function rtx_getUILocation(objSrc)
{
	var obj = objSrc;
	var uiLocation = {};
	var uiX = 0;
	var uiY = 0;
	var objDX = 0;
	var fRtl = (document.dir == "rtl");
	var parentWindow = window;
	var doc = document;
	var scrollTop = 0;
	var scrollLeft = 0;

	if(rtx_frameRandom === 0)
	{
		var dt = new Date();

		rtx_frameRandom = dt.getSeconds() * 1000 + dt.getMilliseconds();
	}

	rtx_frameRandom++;

	while(obj && obj.rtxframeRandom != rtx_frameRandom)
	{
		obj.rtxframeRandom = rtx_frameRandom;

		scrollLeft = obj.scrollLeft;
		scrollTop = obj.scrollTop;

		if(obj.tagName == "BODY")
		{
			if(obj.scrollLeft === 0 && doc.documentElement.scrollLeft !== 0)
			{
				scrollLeft = doc.documentElement.scrollLeft;
			}

			if(obj.scrollTop === 0 && doc.documentElement.scrollTop !== 0)
			{
				scrollTop = doc.documentElement.scrollTop;
			}
		}

		if(fRtl)
		{
			if(obj.scrollWidth >= obj.clientWidth + scrollLeft)
			{
				objDX = obj.scrollWidth - obj.clientWidth - scrollLeft;
			}
			else
			{
				objDX = obj.clientWidth + scrollLeft - obj.scrollWidth;
			}

			uiX += obj.offsetLeft + objDX;
		}
		else
		{
			uiX += obj.offsetLeft - scrollLeft;
		}

		uiY += obj.offsetTop - scrollTop;
		obj = obj.offsetParent;

		if(!obj)
		{
			if(parentWindow.frameElement)
			{
				obj = parentWindow.frameElement;

				parentWindow = parentWindow.parent;
				doc = parentWindow.document;
			}
		}
	}

	if(parentWindow)
	{
		uiX += parentWindow.screenLeft;
		uiY += parentWindow.screenTop;
	}

	uiLocation.uiX = uiX;
	uiLocation.uiY = uiY;

	if(fRtl)
	{
		uiLocation.uiX += objSrc.offsetWidth;
	}

	return uiLocation;
}

(function($) {

	$.rtx = $.rtx || {};

	$.extend($.rtx, {
		nameCtrl: null,

		prefix: '_rtxname',

		id: 0,

		nextId: function() {
			var id_ = $.rtx.id;
			$.rtx.id = $.rtx.id + 1;
			return $.rtx.prefix + id_;
		},

		images: {},

		ensureNameCtrl: function() {
			if ($.rtx.nameCtrl)
            {
				return;
            }
			if (!$.browser.msie)
			{
                return;
            }
			/*
			if ($("#RTXNameCtrl").length > 0)
				return;
			var objhtml = "<object classid='clsid:8F8086BE-0925-481D-B3C1-06BCB4121A5E' codebase='cab/RTXName.dll#version=1,0,0,9' id='RTXNameCtrl' style='display:none;'></object>";
			$(objhtml).appendTo(document.body);
			*/

			try	{
				$.rtx.nameCtrl = new ActiveXObject("RTXName.NameCtrl");
				$.rtx.nameCtrl.OnStatusChange = $.rtx.onStatusChange;
				$(window).scroll(function() { $.rtx.nameCtrl.HideOOUI(); });
			} catch (e) {
				// not installed
				//alert(e.description);
			}
		},

		onStatusChange: function(nick, status, file, rtxnum) {
			alert(nick + " status change to " + status);
		},

		statusPattern: /(\d+)\-(\d+)\.bmp$/,

		getStatus: function(nick) {
			var file = $.rtx.nameCtrl.GetStatusImage(nick, "");
			var gender = "male";
			var status = "unknown";
			var m = file.match($.rtx.statusPattern);
			if (!m)
            {
				return [gender, status];
            }
			switch (parseInt(m[1],10))
			{
			case 127: gender = "male"; break;
			case 128: gender = "female"; break;
			}
			switch (parseInt(m[2],10))
			{
			case 1: status = "online"; break;
			case 2: status = "offline"; break;
			case 3: status = "away"; break;
			}
			return [gender, status];
		},

		updateStatus: function(nick, ids) {
			if (!ids)
            {
				return;
            }
			var status = $.rtx.getStatus(nick);
			$.each(ids, function(i, id) {
				$("#" + id).attr("src", "http://store.oa.com/public-2.0/img/rtx-" + status[0] + "-" + status[1] + ".gif");
			});
		},

		updateAllStatus: function() {
			if (!$.rtx.nameCtrl)
            {
				return;
            }
			$.each($.rtx.images, function(nick, ids) {
				$.rtx.updateStatus(nick, ids);
			});
		},

		addNick: function(obj) {
			var $obj = $(obj);
			var nick = $obj.text();
            if(nick === null || nick === '')
            {
                return;
            }
			var imgid = $.rtx.nextId();
			if(typeof($.rtx.images[nick]) == "undefined") {
				$.rtx.images[nick] = [];
			}
			var arr = $.rtx.images[nick];
			arr[arr.length] = imgid;

			var img = $("<img src='http://store.oa.com/public-2.0/img/rtx-blank.gif' style='width:16px;height:16px;margin:0 3px;vertical-align:middle;' id='" + imgid + "' class='rtx_icon' />");
			//img.attr("nick", nick);
			$obj.before(img);

			img.hover(
					function() {
						var loc = rtx_getUILocation(this);
						$.rtx.nameCtrl.ShowOOUI(nick, 0, loc.uiX+1, loc.uiY+1);
					},
					function() {
						$.rtx.nameCtrl.HideOOUI();
					}
				);

		}

	});

	$.fn.rtxPresence = function() {

//		return; // temporarily disable rtx presence
        if($.browser.msie)
        {
		    $.rtx.ensureNameCtrl();

		    this.each(function() {
			    if (!$.rtx.nameCtrl)
                {
				    return this;
                }
			    $.rtx.addNick(this);
		    });

		    $.rtx.updateAllStatus();
        }
		return this;

	};

})(jQuery);
