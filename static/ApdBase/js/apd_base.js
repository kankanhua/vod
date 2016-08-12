/*
*  
*	架构平台部运营中心前台框架 ApdBase
*	
*   @file apd_base.js
*	@brief 基于Jquery和JqueryUI对中心所有网站提供常用功能支持和组件集成
*	@主要功能：
	@1、ajax前进后退
	@2、左树导航
	@3、自动iframe通信
	@4、自动加载Rtx插件
	@5、自动加载项目信息和维护人名单
	@6、支持三级树
	@7、支持合并Table _.dataTables();
	@8、支持用户行为监控。
	@9、增加Ajax行为监控，_.IsAjaxTrack = true
	@10、增加工作台消息提醒
	@11、修复CheckMod新框架兼容问题
*	@version 1.1.13
*	@author funnylin
*	@date 2014.06.12.1
*
*	Dialog调整默认弹出框位置
*	
修改记录：
	2014.04.04 yubai  面包屑filter->find
	2014-06-23： yubai 增加左树iframe支持。
*		
*/
function loading_mask($container){
      if(! $container) return;
      var gif = '<div class="gif" style="z-index: 101;color: rgb(234, 234, 234);width: 200px;height: 50px;text-align: center;border: 5px solid rgb(215, 215, 215);font-size: 15px;position: absolute;top: 400px;left: 405px;background-color: rgba(0, 0, 0, 0.51);"></div>';
      var img = '<div class="img" style="position: absolute;top: 400px;z-index: 102;padding-top: 20px;color: white;"><img style="margin-right:20px;width: 25px;" src="http://apdbase.oa.com/ApdBase/img/loading.gif"/>玩命加载......</div>';
      var mask = '<div class="loading-mask" style="position:fixed;top:0;">'+gif+img+'</div>';
     $container.append(mask);
         var $mask = $container.find(".loading-mask");
         var $gif = $mask.find(".gif");
         var $img = $mask.find(".img");
         $mask.width( $container.width() );
         $mask.height( $container.height() );
         $gif.css("left", ($container.width()-$gif.width()-100)/2-20 );
         $img.css("left", ($container.width()-$img.width()-100)/2-20 );
     }

(function(){
var apdBase = {
	version:'1.0',
    reqs:[],
    last:null,
    urlPrefix:'',
    modFlag:false,
    firstN:-1,
    defaultType:'json',
    firstReq:{},
    appName:'[架构平台部运维系统]',
    eventCB:{},//event call back
    $c:$(), // main container
    $nav:$(),
    navClass:'curTitle',
    //master req
    mreqs:[],
	fregs:[],
    dlgreqs:[],
    maxMreq:-1,
	scrollTop:0,
	IsAutoClean:true,
	windowHeight:0,
	firstSelected:true,
	globalSonFunc:null,
	postMessageData:{},
	IsAjaxTrack:true,
    // attribute member get & set
    C:function(d){
        if (d !== undefined)
            _.$c.html(d);
        return _.$c;
    },
	//获取全路径
    FullUrl:function(url){
		//如果路径存在，并且不是http://开头
         if (url && url.length > 0 && url.charAt(0) != '/' && url.search(/^http:\/\//i) == -1)
            return _.urlPrefix + url;
        return url;
    },
    // initialize @ window.onload
    RestoreTitle:function(){
        if (_.oldTitle) document.title = _.oldTitle;
    },
    Init:function(args){
        $.extend(this,args);
        _.defaultUrlPrefix = _.urlPrefix;
        _.oldTitle = document.title;
        _.$c.ajaxError(function(e,x){
                _.UnblockUi();
                _.EndLoading();
                _.TipsShow("<div>服务器出错,请联系模块负责人。</div>");
            });
        if ($.browser.msie) {
            window.setInterval("_.RestoreTitle()",50);
        }
        _.TipsShow.overflow = $('body').css('overflow');
        $(window).hashchange(function(){
			
				//fix autocomplete bug begin
				if(window.__ac)
						delete window.__ac
				//fix autocomplete bug end
				
                //first. unserialize req
                var xArgs = _.GetHashArgs();
                var cnt = _.reqs.length;
                var req = {};
                if (xArgs){
                    if (xArgs._v == _.v && cnt != 0){
                        if (_.IsIndexOK(xArgs._n)){
                            //may be ...
                            req = _.reqs[xArgs._n];
                        }
                        else{
                            //ignore
                            //req = _.UnmarkUrl(xArgs);
                        }
                    }
                    else{
                        if (cnt == 0){
                            if (xArgs._url)
                                req = _.UnmarkUrl(xArgs);
                        }
                        else{
                            if (xArgs._url){
                                //last session
                                req = _.UnmarkUrl(xArgs);
                                req.executed = true;
                            }
                        }

                    }
                }
				//如果回退到没有hash首页，不需要Record
				else{
					if(_.firstSelected && cnt != 0){
						req = _.GetNodeReq("#"+_.selected);
						if (req){
							_.Record(req);
							_.InitNew(req);
						}
						
					}
				}
                if (cnt != 0){
						_.ExecFromUrl(req); //execute now
                }
                else {
                    //alert("f5");
                    if (_.Trigger('f5',[req]) !== undefined)
                        return;
                    else if (_.IsReqGood(req)){
                        _.New(req);
                    }
                }
            }).bind('beforeunload',function(){
                    //监听页面离开事件
                    if (_.QueryToLeave())
                        return "【****当前页面已被修改，但尚未保存****】";
                });
			
        _.Trigger("init",[args]);
        $(window).trigger('hashchange');
    },
    // --------- begin public function --------
    //  New类型请求的初始化
    IsReqGood:function(req){
        return req && req.exec;
    },
    InitNew:function(req){
        if (!req.exec){
            req.exec = _.ProcessNew;
            req.url = _.FullUrl(req.url);
            if (!req.args) req.args = {};
            if (req.type === undefined) req.type = _.defaultType;
            //req.c whill not be here
            //req.cb not care
            //req.post is default: undefined means $.get
        }
    },
    //历史记录 + 执行
    New:function(req){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.InitNew(req);
        _.PushNew(req);
        _.MarkUrl(req); //will executed by hashchanged callback
        return false;
    },
    ReNew:function(args){
        //if (_.ModFlag()) return _.CheckMod(arguments);
        var req = _.Last();
        if (!req) return false; // ignore
        if (!args) return _.ExecNow(req); // no history recorded
        var req = $.extend(true,{},req);
        //更新参数
        $.extend(req.args,args);
        return _.New(req);
    },
    // 执行
    ExecNew:function(req,args){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.InitNew(req);
        //_.PushNew(req);
        _.UpdateArgs(req,args);
        _.ExecNow(req);
        return false;
    },
    Close:function(){
        var req = _.LastDialog();
        if (!req) return false;
        if (_.QueryToLeave()) return _.CheckMod(arguments);

        if (_.lastDialog){
            _.lastDialog.dialog('close');
            delete _.lastDialog;
        }
        return false;
    },
    /*
	*弹出对话框
	*@req 请求参数	
	*@dialogOptions 对话框选项
	*/
    Dialog:function(req,dialogOptions){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        var defaultDialogOptions = {
                autoOpen:true,
                width:800,
                modal:true,
                title:req.name,
                position:[350,100],
				
                beforeClose:function(){
                    if (_.QueryToLeave())
                        return _.CheckMod(arguments);
                    if (_ == this && _.lastDialog) {
                        _.lastDialog.dialog('close');
                        return false;
                    }
                    return true;
                },
				
                close:function(){
		    _.IsAutoClean = true;
                    $(this).dialog('destroy').remove();
                    _.ModFlag(false);
                    var r = _.LastDialog();
                    if (r){
                        if (r.close) r.close(r);
                        //go back
                        _.dlgreqs.pop();
                        var r = _.LastDialog();
                        if (r){
                            _.lastDialog = r.dlg;
                            _.lastDialogReq = r;
                        }
                        else {
                            delete _.lastDialog;
                            delete _.lastDialogReq;
                        }
                    }
                },
                open:function(){
		    _.IsAutoClean = false;
                    req.c = $(this);
					if(window.__ac)
						delete window.__ac
                    _.ExecNew(req);
                }
				
        };
		 if (dialogOptions) $.extend(defaultDialogOptions,dialogOptions);
		if (window.top != window) {
			var pos = _.GetIframeCenterPosition(defaultDialogOptions.width,defaultDialogOptions.height);
			defaultDialogOptions.position = pos;
		}	


        //_.lastDialogReq = req;
        //_.lastDialog = $('<div class="ac_del ac_fixed"><span class="_loading">Loading...</span></div>').dialog(defaultDialogOptions);
        _.lastDialogReq = req;
        //_.lastDialog = $('<div class="ac_del ac_fixed"></div>').dialog();
	//defaultDialogOptions.position = ["center",150];
	defaultDialogOptions.position = ["center",  _.scrollTop+100];
		_.lastDialog = $('<div class="ac_del ac_fixed"></div>').dialog(defaultDialogOptions);
        req.dlg = _.lastDialog;
        _.dlgreqs.push(req);
        return false;
    },
    LastDialogObj:function(){
        return _.LastDialog().dlg;
    },
    LastDialog:function(){
        return (_.dlgreqs.length) ? _.dlgreqs[_.dlgreqs.length - 1] : false;
    },
    ReDialog:function(args,name){
        //if (_.ModFlag()) return _.CheckMod(arguments);
        if (_.lastDialogReq){
            _.ModFlag(false);
            if (name){
                _.lastDialog.dialog('option','title',name);
            }
            _.UpdateArgs(_.lastDialogReq,args);
            return _.New(_.lastDialogReq);
        }
        return false;
    },
    /*
	* 执行请求，并记录
	*@req 请求参数
	*/
	Enter:function(req){
        if (_.QueryToLeave(req)) return _.CheckMod(arguments);
        _.Record(req);
        return _.New(req);
    },
    //加入主请求
    Record:function(req){
        if (_.mreqs.length > 0){
            if (_.mreqs[_.mreqs.length - 1].name == req.name)
                return false;
        }
        if (_.maxMreq > 0 && _.mreqs.length >= _.maxMreq) _.GoBack(1,false);
        req = $.extend(true,{},req);
        //_.InitNew(req);
        req.i = _.mreqs.length;
        _.mreqs.push(req);
		var a="apdbase-breadcrumb";
        if (_.$nav.length){
            //TODO
            var ehtml;
            if (req.name) {
				//是否有父节点id="'+req.name+"_"+req.i+'"
				ehtml = $('<li class="active" ><span class="divider"><i class="icon-angle-right"></i></span><a href="" onclick="return _.JumpTo(' + req.i + ',true);">'+req.name+'</a></li>');
				req.label = ehtml;
				_.$nav.append(req.label);
				hover_side_menu(req.menu);
				var fatherNode = $("#"+req.menu+"").parents(".branch").children(".apdbase-head-title");
				for(var i=0; i < fatherNode.length; i++){
					ehtml = $('<li><span class="divider"><i class="icon-angle-right"></i></span>'+$(fatherNode[i]).text()+'</li>');
					_.$nav.prepend($(ehtml));
				}
            }
            //_.UpdateNav();
        }
        return false;
    },
    LastName:function(){
        if (_.mreqs.length)
            return _.mreqs[_.mreqs.length - 1].name;
        return "";
    },
    LastEnter:function(){
        if (_.mreqs.length)
            return _.mreqs[_.mreqs.length - 1];
        return false;
    },
    Clear:function(){
        _.mreqs = [];
        //_.$nav.children().not('[_fixed]').remove();
		_.$nav.children().remove();
    },
    ResetEnter:function(args){
        if (_.mreqs.length){
            _.ModFlag(false);
            var lastm = _.mreqs[_.mreqs.length - 1];
            lastm.args = {};
            _.UpdateArgs(lastm,args);
            lastm = $.extend(true,{},lastm);
            return _.New(lastm);
        }
    },
    ReEnter:function(args,name){
        //if (_.ModFlag()) return _.CheckMod(arguments);
        if (_.mreqs.length){
            _.ModFlag(false);
            var lastm = _.mreqs[_.mreqs.length - 1];
            if (name && lastm.label.length>0)
                lastm.label.find("a:first").html(name);
            _.UpdateArgs(lastm,args);
            
            lastm = $.extend(true,{},lastm);
            if (name) lastm.name = name;
            return _.New(lastm);
        }
        return false;
    },
    JumpTo:function(i,reenter){
        if (_.QueryToLeave()) return _.CheckMod(arguments);
        return _.GoBack(_.mreqs.length - i - 1,reenter);
    },
	/*
	*回退函数
	*@count 回退层数，默认一层
	*/
    GoBack:function(count,reenter){
        if (_.QueryToLeave()) return _.CheckMod(arguments);
        if (count === undefined) count = 1;
        else if (count < 0) count = _.mreqs.length + count;
        if (reenter === undefined) reenter = true;
        var i = _.mreqs.length - 1;
        while (count > 0 && i >= 0){
            var cur = _.mreqs[i];
			$(cur.label).remove();
            if (cur.label && cur.label.length){
                cur.label.remove();
            }
            --count;
            --i;
            _.mreqs.pop();
        }
        _.UpdateNav();
        if (reenter)
            _.ReEnter();
        return false;
    },
    //显示Ajax页面Loading图案
    PreLoading:function(msg,req,c){
        if (_.$nav.length){
	    loading_mask(c);
			
            if (!msg) msg = 'LOADING...';
            $('#apdbase_nav_loading',_.$nav).remove();
            _.$nav.append("<li><span id='apdbase_nav_loading'>"+msg+"</span></li>");
        }
    },
    //隐藏Ajax页面Loading图案
    EndLoading:function(){
		$("body").css("cursor","default");
        if (_.$nav.length){
            $('#apdbase_nav_loading',_.$nav).parent().remove();
            _.TipsHide();
        }
    },
	//显示弹出层Loading图案
	//使用了blockUI框架
    BlockUi:function(){
        $.blockUI({message:'<span><img src="/public/plugin/block-ui/img/indicator.gif"/>Please be patient...</span>',baseZ:2000,overlayCSS: {opacity:0}});
    }, 
	//取消显示弹出层Loading图案
	//
    UnblockUi:function(){
        $.unblockUI();
    },   
    // OA登录验证过期重定向
    // 
    Redirect:function(url){
        if (url) {
            alert("您的OA登陆验证已过期，点击确定后重新登陆");
            //var x = url.indexOf("url=");
            //var url = url.substr(0,x)+"url="+encodeURIComponent(location.href);
            window.location.reload();
        }
    },
    NewResult:function(d,req,c){
        var data;
        if (req.type == 'json'){
            if (!d){
                _.InfoShow("加载出错");
                if (c && c.length) c.html("加载过程出现错误，请稍后再试");
                return true;
            }
            else if (d.errno){
                if (d._action == "redirect") _.Redirect(d._url);
                var res = _.ErrorShow(d);
                if (c && c.length) c.html(res);
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
    // ------------ end can be overrided function  -------------
    //  init(args)        : initialize apdBase , to bind the following event
    //  f5(req)           : initialize global info
    //  history(req)      : restore global info
    //  mark(xArgs,req)   : get some global info
    //  unmark(xArgs,req) : save some global info
    //  dataload(d,req,c) : global initialize after data is loaded
    Bind:function(name,cb,toHead){
        var opArr = (toHead) ? _.UnshiftArr : _.PushArr;
        _.eventCB[name] = opArr(cb,_.eventCB[name]);
    },
    Trigger:function(name,args){
        return _.CallBack(_.eventCB[name],args,_);
    },
    //------ begin ui helper -----------
    YesNoQuery:function(queryText,cb,cbArgs,pThis,extraOptions){
        queryText = "<div>" + queryText + "</div>";
        if (!extraOptions) {
			extraOptions = {};
			if (window.top != window) {
				var pos = _.GetIframeCenterPosition();
                extraOptions = {position:pos};
			}
		}
        var ea = {width:450,position: ["center",  _.scrollTop+100],title:_.appName};
        //extraOptions.position = ["center",150];
        $.extend(ea,extraOptions);
        $(queryText).dialog({
            title:ea.title,
            modal:true,
            width:ea.width,
            /*height:150,*/
           // position:'top',
	    position:ea.position,
            open:function(){
                if (ea.open) ea.open.call(this);
                $('body').css('overflow','hidden');
            },      
            close:function(){
                $('body').css('overflow',_.TipsShow.overflow);
                $(this).dialog('destroy').remove();
            },
			buttons:[
						{
							text:"确定",
							"class":"btn btn-xs btn-primary",
							click:function(){
								if (!pThis) { 
									pThis = this;
								}
								if (!_.AcResult(1,$(this)))
									return false;
								if (!$.isArray(cbArgs))
									cbArgs = [cbArgs];
								cb.apply(pThis,cbArgs);
								$(this).dialog('close');
							}
						},
						{
							text:"取消",
							"class":"btn btn-xs",
							click:function(){
								$(this).dialog('close');
							}
						}
			]
        });
        return false;
    },
    InfoShow:function(tips,options){
        var xOptions = {
                width:512,modal:true,title:_.appName,
                close:function(){
                    $(this).dialog('destroy').remove();
                },
                buttons: { '确定': function() { $(this).dialog('close'); } }
            };
        $.extend(xOptions,options);
        if (tips.charAt(0) != '<')
            tips += "<div>" + tips + "</div>";
	//xOptions.position = ["center",150];
	xOptions.position = ["center",  _.scrollTop+100];
        $(tips).dialog(xOptions);
    },
    HtmlEncode:function(str,ex){
       if  (!str) return "";
       str = str.replace(/&/g,"&gt;")
                 .replace(/</g,"&lt;")   
                 .replace(/>/g,"&gt;");
       str = ex?str.replace(/ /g,"&nbsp; "):str.replace(/ /g,"&nbsp;");
       str = str.replace(/\'/g,"&#39;")   
                 .replace(/\"/g,"&quot;")   
                 .replace(/\n/g,"<br>");   
       return str;
    },
    ErrorShow:function(d,c){
        var msg = "<div><p class='imp'>请求服务器失败</p><table class='tableform'>"+
            "<tr><td class='gray' style='width:80px;text-align:right'>出错码：</td><td class='ok'>ERR#"+d.errno+"</td></tr>"+
            "<tr><td class='gray' style='width:80px;text-align:right'>出错描述：</td><td class='error'>"+_.HtmlEncode(d.error,true)+"</td></tr></table></div>";
        _.InfoShow(msg);
        var tipsMsg = "<span class='error'>" + _.HtmlEncode(d.error) + "</span>(<span class='ok'>" + d.errno + "</span>)";
        //_.AcTips(tipsMsg,c);
        return msg;
    },
    /* 信息提示对话框 */
    TipsHide:function(){
        if (_.TipsShow.o) _.TipsShow.o.stop(true,true);
        if (_.TipsShow.dlg) _.TipsShow.dlg.dialog('close');
    },
    TipsShow:function(tips){
        function _beginClose(){
            if (_.TipsShow.s)
                _.TipsShow.o.delay(1200).fadeOut(50,function(){
                        _.TipsShow.dlg.dialog('close');
                    });
        }
        function _beginShow(){
            if (_.TipsShow.s){
                _.TipsShow.o.stop(true).fadeTo(0,1).stop(true,true);
                _.TipsShow.o.css('filter','auto');
            }
        }
		if(!_.TipsShow.dlg){
            _.TipsShow.dlg = $("<div></div>").dialog({
                title: _.appName + '提醒您',
                modal:true,
                minHeight:60,
                autoOpen:false,
                close:function(){
                    $('body').css('overflow',_.TipsShow.overflow);
                    _.TipsShow.s = false;
                    _.TipsShow.o.stop(true).hide();
                },
                open:function(){
                    $('body').css('overflow','hidden');
                    _.TipsShow.s = true;
                    _beginShow();
                    _beginClose();
                    $('.ui-widget-overlay').click(function(){
                            _.TipsShow.dlg.dialog('close');
                        });
                }
            });
            _.TipsShow.o = _.TipsShow.dlg.closest('.ui-dialog').hover(_beginShow,_beginClose);
        }
		
		if(window.top != window){
			var pos = _.GetIframeCenterPosition(300,null);
			_.TipsShow.dlg.html(tips).dialog("option","position",pos);
		}
        _.TipsShow.dlg.html(tips).dialog('open');
    },
    ReadOnly:function(o){
        o.find('input,textarea').filter('.readonly').css('border','none').css('background','transparent').attr('readonly','readonly');
    },
    TextAreaAJ:function(c){
        function _AJ(o)
        {
            var h = parseInt(this.style.height);
            if (isNaN(h) && this.scrollHeight == 0) return;
            if (isNaN(h) || h + 5 < this.scrollHeight || h > this.scrollHeight + 5)
                this.style.height = this.scrollHeight + "px";
            //this.style.posHeight = this.scrollHeight;
        }
        return c.find('textarea.auto_h').css('overflow','hidden').bind('propertychange input focus x',_AJ).trigger('input');
    },
    GetSelectedIds:function(c,id)
    {
        if (!id) id = 'value';
        if (!c) c = _.$c;
        var ids=[];
        c.find("tr td:first-child input[type=checkbox]").each(function(){
            if ($(this).is(':checked') && $(this).attr(id))
                ids.push($(this).attr(id));
        });
        return ids;
    },
	//无刷新提交表单，利用一个隐藏iframe，将表单target提交到此Iframe
    AjaxSubmit:function(formsel,req){
        _.BlockUi();
        if (_.PreLoading) _.PreLoading();
        req.type = 'json';
        var $form = $(formsel);
        var ifid=$form.attr('id')+"Result_"; //TODO : random id
        $form.append("<iframe id='"+ifid+"' name='"+ifid+"' style='display:none'></iframe>");
        $form.attr("target",ifid);
        var $ifid=$form.find('#'+ifid);
		//Submit处理函数
        $ifid.load(function(){
                _.UnblockUi();
                if (_.EndLoading) _.EndLoading();
                //var res = $(this).contents().text();
                var res = $(this).contents().find('#cb');
                var x;
                if (res.length > 0)
                    x = {errno:res.attr('errno'),error:res.attr('error')};
                else
                    x= $.evalJSON($(this).contents().text());
                $ifid.remove();
                if (x){
                    var data = _.ReqResult(x,req,$form);
                    if (data === true) return;
                    _.CommCB(x,req,data);
                    /*
                    if (x.errno == 0)
                        _.CommCB(x,req,x.error);
                    else
                        _.ErrorShow(x);
                        */
                }
            });
        $form.submit();
    },
    //级联加载
    CcLoad:function(is_init,param,url,cb)
    {
        var next = $(this);
        var pre;
        if (is_init === true)
            $(this).data("pre",null);
        while (1){
            pre = next;
            if (is_init === true)
                pre.data('cb',cb);
            next = $(next).attr("next");
            if (!next){
                break;
            }
            next = $('#' + next);
            if (!next.length)
                break;
            if (is_init === true)
            {
                pre.change(_.CcLoad);
                pre.data('param',param);
                pre.data('url',url);
                next.data('pre',pre);
            }
            next.html("<option value=''>待加载...</option>").trigger('change');
        }
        next = $(this).attr("next");
        if (!next)
            return;
        var $next = $('#' + next);
        if (!$next.length)
            return;
        var args = {};
        pre = $(this);
        if (!pre.val()&&is_init!==true)
            return;
        url = pre.data('url');
        if (url)
            url = _.FullUrl(url);
        else
            url = ajax_get_url_prefix() + 'get_' + next;
        param = pre.data('param');
        if (is_init !== true){
            if (param)
                args[param] = pre.attr(param);
            while (pre){
                args[pre.attr("id")] = pre.val();
                pre = pre.data('pre');
            }
        }
        else{
            if (param)
                args[param]="";
        }
        $.getJSON(url,args,
                function(data){
                    if (data.errno ==0)
                    {
                        var html = "";
                        var id = data.id;
                        if (!id)
                            id = 'id';
                        var value = data.value;
                        if (!value)
                            value = 'name';
                        var isE = false;
                        for(var i in data.error)
                        {
                            if (!data.error[i])
                                continue;
                            if (data.error[i][id])
                                html += "<option value='" + data.error[i][id] + "'>" + data.error[i][value] + "</option>";
                            else
                            {
                                html += "<option value='' selected='selected'>" + data.error[i][value] + "</option>";
                                isE = true;
                            }
                        }
                        if (!isE)
                                html += "<option value='' selected='selected'>请选择...</option>";
                        if (is_init !== true){
                            $next.html(html);
                            if ($next.data('cb'))
                                $next.data('cb')($next);
                            _.CcLoad.call($next);
                        }
                        else{
                            pre.html(html);
                            if (pre.data('cb'))
                                pre.data('cb')(pre);
                        }
                    }
                    else
                        _.ErrorShow(data);
                });
    },
    //级联加载
    /*args = {
        url:"get_cc_data.cgi",//获取级联数据
        start:"first-select-id" 
    */
    CcLoad2:function(xOption){
        var xo = {
            cb:_.ReEnter,levelName:"level",
            emptyShowOnEmpty:false,initSameNoCallback:true,lastLevelEmptyNoReq:true,
            load:function(d,curObj,selValue,emptyShowOnEmpty){
                var html = "";
                function makeOption(v,n){
                    var extra = "";
                    if (selValue && v == selValue) extra += " selected='selected'";
                    if (!v) extra += " class='gray'";
                    return "<option value='" + v + "'" + extra + ">" + _.HtmlEncode(n) + "</option>";
                }
                if (d.data_list)
                {
                    var dl = d.data_list;
                    for(var i = 0;i< dl.length;++i)
                    {
                        html += makeOption(dl[i]["value"],_.HtmlEncode(dl[i]["name"]));
                    }
                }
                if (!emptyShowOnEmpty || !d.data_list)
                {
                    var emptyOption = curObj.attr("_emptyOption");
                    if (emptyOption)
                        html = makeOption('',emptyOption) + html;
                }
                curObj.html(html);
            }
        };
        if (xOption) $.extend(xo,xOption);
        if (!xo.url || !xo.first || !xo.cb) return _.TipsShow("CcLoad2 args error");
        function GetArgsUntil(untilId){
            var args = {};
            var nextId = xo.first;
            var cur;
            var noReq = false;
            while (nextId && nextId != untilId && (cur = $('#' + nextId)).length)
            {
                var curLevel = cur.attr('_level');
                var curValue = cur.val();
                if (curValue) args[curLevel] = cur.val();
                else if (xo.lastLevelEmptyNoReq) noReq = true;
                nextId = cur.attr("_next");
            }
            return [args,noReq];
        }
        //load and trigger next
        function DoLoad(curObj,xo){
            var url = curObj.attr('_url') || xo.url;
            var xargs = GetArgsUntil(curObj.attr("id"));
            var args = xargs[0];
            if (xargs[1]){
                xo.load({},curObj,null,xo.emptyShowOnEmpty);
                curObj.trigger("change");
                return;
            }
            args[xo.levelName] = curObj.attr("_level");
            curObj.html("<option value=''>Loading...</option>");
            _.Get(url,args,function(d){
                    var lastValue = curObj.attr("_initValue");
                    xo.load(d,curObj,lastValue,xo.emptyShowOnEmpty);
                    curObj.trigger("change");
                },"json");
        }
        function DoLoadNext()
        {
            var curObj = $(this);
            var nextId = curObj.attr("_next");
            var cur = null;
            //trigger next
            if (nextId && (cur = $('#' + nextId)).length) DoLoad(cur,xo);
            //call back
            else if (xo.cb) {
                var curArgs = GetArgsUntil()[0];
                if (xo.initSameNoCallback === true){
                    xo.initSameNoCallback = false;
                    var diff = false;
                    for(var i in curArgs)
                    {
                        if (xo.args[i] != curArgs[i])
                        {
                            diff = true;
                            break;
                        }
                    }
                    if (!diff) return;
                }
                xo.cb(curArgs);
            }
        }
        //initialize
        var nextId = xo.first;
        var cur = null;
        var first = null;
        var initArgs = {};
        while (nextId && (cur = $('#' + nextId)).length)
        {
            if (!first) first = cur;
            cur.change(DoLoadNext);

            var curLevel = cur.attr('_level');
            initArgs[curLevel] = cur.attr("_initValue");

            nextId = cur.attr("_next");
        }
        if (first) {
            if (xo.initSameNoCallback === true) {
                xo.args = initArgs;
            }
            DoLoad(first,xo);
        }
    },
    FolderField:function(o,target)
    {
        if (!target){
            target = $(o).closest('div').nextAll();
        }
        if (target.css("display") != "none")
        {
            target.css("display","none");
            $(o).attr("class","ui-icon ui-icon-circle-triangle-e ib");
            $(o).attr("title",'展开此单元');
        }
        else
        {
            target.css("display","");
            $(o).attr("class","ui-icon ui-icon-circle-triangle-s ib");
            $(o).attr("title",'折叠此单元');
        }	
        return false;
    },
    Test:function(){
         alert("tert");
     },
    SelectAll:function(o,x){
        if (x === undefined) x = 1;
        var objs = $(o).closest("table").find("tbody");
        var checked = objs.find("td:nth-child("+x+") input:checked");
        var all = objs.find("td:nth-child("+x+") input");
        var v = (checked.length != all.length) ? true : false;
        all.attr("checked",v).trigger('change');
        return false;
    },
    //------ end ui helper -----------
    //------- begin utility function -------------------
    //添加元素o到数组x末尾, arr 可为 空 或单个元素
    UnshiftArr:function(o,arr){
        if (!arr) return [o];
        if ($.isArray(arr)){
            arr.unshift(o);
            return arr;
        }
        else return [o,arr];
    },
    //添加元素o到数组x开头, x 可为 空 或单个元素
    PushArr:function(o,x){
        if (!x) return [o];
        else if ($.isArray(x)){
            x.push(o);
            return x;
        }
        else return [x,o];
    },
    //回调函数
    CallBack:function(cb,args,caller,noCheckResult){
        if (!cb) return;
        if (!$.isArray(cb)) cb = [cb];
        //if (!$.isArray(args)) args = [args];
        for(var i=0;i<cb.length;++i){
           var res = cb[i].apply(caller,args);
           if (!noCheckResult && res !== undefined)
               return res;
        }
    },
    ReLoad:function(args,noold){
        if (!noold){
            var xargs = _.SplitArgs(window.location.search.substring(1));
            $.extend(xargs,args);
            args = xargs;
        }
        var info = [];
        for(var n in args)
          if (args[n] !== undefined)
             info.push(n+'='+encodeURIComponent(args[n]));
        info = info.join('&');
        if (info) info = "?" + info;
        var newUrl = window.location.pathname + info + window.location.hash;
        window.location = newUrl;
    },
    SetHash:function(hashStr){
        if (hashStr && hashStr.charAt(0) != '#')
            hashStr = '#' + hashStr;
        location.hash = hashStr;
    },
    SplitArgs:function(queryStr){
        var pairs = queryStr.split('&');
        var args = {};
        for(var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue; 
            var argname = pairs[i].substring(0,pos);
            var value = pairs[i].substring(pos+1); 
            try{
                value = decodeURIComponent(value);
            }
            catch(e){
            }
            args[argname] = value;
        }
        return args;
    },
    GetHashArgs:function(){
        var hash = location.hash;
        if (hash && hash.length > 0){
            var x = location.hash.substring(1);
            var ret = _.SplitArgs(x);
            if (!ret.url && x && x.length>=7)
                ret = _.SplitArgs(decodeURIComponent(x));
            return ret;
        }
        else return false;
    },
    TrimValue:function(args){
        if (!args) return;
        var xArgs = args;
        for(var name in xArgs) {
            var value = args[name];
            if (typeof value == "string") args[name] = $.trim(value);
        }
    },
    //------ end utility function--------
    //------ begin private function--------
    UpdateLast:function(args){
        if (_.mreqs.length){
            var lastm = _.mreqs[_.mreqs.length - 1];
            _.UpdateArgs(lastm,args);
        }
    },
	/*
	* 添加当前页面标题样式
	*/
    UpdateNav:function(){
          var x = $("a",_.$nav);
          if (x.length){
              x = x.removeClass(_.navClass).last();
              if (x.length)
                  x.addClass(_.navClass)[0].blur();
          }
    },
    UpdateArgs:function(req,args){
        if (req && args){
            if (req.trim) _.TrimValue(args);
            if (req.args)
                $.extend(req.args,args);
            else
                req.args = args;
        }
    },
    ExecNow:function(req){
		if(_.IsAutoClean){
			$(".frame-need-auto-clean,#ui-datepicker-div").remove();
			//autocomplete clean
			if(window.__ac)
				delete window.__ac
		}
        if (!_.IsReqGood(req)) return;
		if(_track) _track();
        req.exec.call(_,req);
    },
    ExecFromUrl:function(req){
        if (!_.IsReqGood(req)) return;
        if (req.exec === _.ProcessNew){
            if (req.c && typeof req.c == "string"){
                if ($(req.c).length <= 0){
                    //TODO:
                    //window.history.go(-1);
                    return;
                }
            }
        }
        if (req.executed && _.IsMarkable(req))
            _.Trigger('history',[req]);
        else
            req.executed = true;
        _.ExecNow(req);
        return false;
    },
    IsInLastDialog:function(req){
        return (req && _.lastDialogReq && req == _.lastDialogReq && _.lastDialog && _.lastDialog.length);
    },
    LoadData:function(req,c,data,d){
        if (!c || c.length == 0) return false;
        //TODO:dialog destroy

        if (c === _.$c){
            $("div.ac_del").dialog('destroy').remove();
            $("div.ac_close").each(function(){
                if ($(this).dialog('isOpen')) $(this).dialog('close');
            });
        }

        if (req && req.unload){
            req.unload(req);
        }
        c.html(data);
        var action = c.find("#_action");
        if (action && action.length){
            var url = action.attr("_url");
            var type = action.attr("_type");
            if (type == "redirect") _.Redirect(url);
        }
        _.Trigger("dataload",[d,req,c]);
    },
    ProcessNew:function(req){
        var c =req.c;
        if (!c) c = _.$c;
        else if (typeof c != "object") c = $(c);
        if (_.PreLoading) _.PreLoading(null,req,c);
        var reqm = ((!req.post)? $.get : $.post);
	if(req.type == "iframe")
	{
		var url = req.url;
		var iframe = $("<iframe class='frame-need-auto-clean' height=1000 src='"+url+"' name='index_iframe' id='index_iframe'  border='0' frameborder='0' scrolling='no' width='100%'></iframe>");
		$("#page-content").empty().append(iframe);
		_.EndLoading();	
		if (req.iframe_cb){
			eval(req.iframe_cb+'()');
		}
	}
	else
	{
	        reqm(req.url,req.args,function(d){
	                if (_.EndLoading) _.EndLoading();
	                //step 1. 出错处理
	                var data = _.NewResult(d,req,c);
	                if (data === true) return;
	                if (_.LoadData(req,c,data,d) !== undefined) return;
	                //step 4.回调用户
	                if (req.cb) _.CallBack(req.cb,[d,req,data],_);
	            },req.type);
	}
    },
    ModFlag:function(flag){
        if (flag !== undefined)
            _.modFlag = flag;
        return _.modFlag;
    },
    QueryToLeave:function(req){
        return  _.modFlag && (!req || _.IsMasterReq(req));
    },
    //检查是否修改标志，需要时提示用户
    //if (_.QueryToLeave()) return _.CheckMod(arguments);
    CheckMod:function(args,pThis){
        if (!pThis) pThis = this;
        if (_.modFlag)
            _.YesNoQuery("<div style='line-height:50px;height:50px;padding:0;'>当前页面已被修改，点确定后<span class='ui-state-error '>所作修改将被丢弃</span>，确定离开页面吗？</div>",function(){
                        _.modFlag = false;
                        args.callee.apply(pThis,args);
                    });
        else
            args.callee.apply(pThis,args);
        return false;
    },
    //将请求加入请求链
    PushNew:function(req){
        //special process
        if (_.reqs.length == _.firstN){
            _.reqs.n = _.firstN;
            _.reqs.push(_.firstReq);
            //_.firstReq = null;
        }
        req.n = _.reqs.length;
        delete req.executed; //!important
        _.reqs.push(req);
        _.Last(req);
    },
    Last:function(req){
        if (req) _.last = req;
        return _.last;
    },
    //判断是否可序列化
    IsMarkable:function(req){
        return req.url && !req.cb && (!req.c || req.c === _.$c) && (req.exec === _.ProcessNew);
    },
    IsMasterReq:function(req){
        return req.url && !req.cb && (!req.c || req.c === _.$c) && (!req.exec || req.exec === _.ProcessNew);
    },
    IsUnmarkable:function(xArgs){
        return xArgs && xArgs._url;
    },
    IsIndexOK:function(n){
        return n !== undefined && n >= 0 && n < _.reqs.length;
    },
    //将请求附加到浏览器url，以便页面刷新时能回到当前页面
    MarkUrl:function(req){
        var xArgs = { _n : req.n , _v:_.v};
        if (_.IsMarkable(req)){
            //mark url
            xArgs._url = req.url;
            xArgs._type = req.type;
            if (req.post) xArgs._post = 1;
            for(var i in req.args)
                if (req.args[i] !== undefined)
                {
                    xArgs[i] = req.args[i];
                }
            _.Trigger('mark',[xArgs,req]);
        }
		if( _.reqs.length == 1 && _.firstSelected ){
			_.ExecFromUrl(req);
		}
		else {
			_.SetHashArgs(xArgs,req);
		}
		
    },
    //反序列化请求
    UnmarkUrl:function(xArgs){
        var req = {};
        if (_.IsUnmarkable(xArgs)){
            req.url = xArgs._url;
            if (xArgs._type !==  undefined) req.type = xArgs._type;
            if (xArgs._post !== undefined) req.post = xArgs._post;
            _.InitNew(req);
            for(var x in xArgs){
                if (x && x.length && x.charAt(0) != '_'){
                    req.args[x] = xArgs[x];
                }
            }
            _.Trigger('unmark',[xArgs,req]);
        }
        return req;
    },
    //设置url参数
    SetHashArgs:function(args,req){
        var query=[];
        var totalLen = 0;
        function _Get(x){
            if (args[x] !== undefined) {
                var curV = x + '='+encodeURIComponent(args[x]);
                if (totalLen + curV.length + 1 <= 2000) //max 2083
                {
                    totalLen += curV.length + 1;
                    query.push(curV);
                }
                //else ignore it
                //delete args[x];
            }
        }
        //sys first
        for(var n in args)
            if (n.length > 0 && n.charAt(0) == "_") _Get(n);
        //then user
        for(var n in args)
            if (n.length > 0 && n.charAt(0) != "_") _Get(n);
        query = query.join('&');
        if (req) _.Trigger('markurl',[query,req]);
        location.hash = '#'+query;
    },
    //-------- end private ---------
    v:Math.random()
};
window._ = window.apdBase = apdBase;

})();


// ----  unrepeated ajax request wrapper -------
$.extend(_,{
    CustomResult:function(type,d,c){
        var data;
        if (type == 'json'){
            if (!d){
                _.InfoShow("加载出错,服务器返回格式不对");
                //if (req.fr) _.ReEnter();
                return true;
            }
            else if (d.errno != 0){
                _.ErrorShow(d,c);
                //if (req.fr || d.fr) _.ReEnter();
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
	Post:function(url, data, callback, type ) {
		//shift arguments if data argument was omited
		if ($.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}
        _.BlockUi();
        if (_.PreLoading) _.PreLoading();
		var req = {url: url,args:data};
		if(_track && _.IsAjaxTrack) _.ajaxTrack(req);
        $.post(_.FullUrl(url),data,function(d){
            _.UnblockUi();
            if (_.EndLoading) _.EndLoading();
            var data = _.CustomResult(type,d);
            if (data == true) return;
            if (callback) callback(d,data);
        },type);
    },
	Get:function(url, data, callback, type ) {
		//shift arguments if data argument was omited
		if ($.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}
        if (_.PreLoading) _.PreLoading();
		var req = {url: url,args:data};
		if(_track && _.IsAjaxTrack) _.ajaxTrack(req);
        $.get(_.FullUrl(url),data,function(d){
            if (_.EndLoading) _.EndLoading();
            var data = _.CustomResult(type,d);
            if (data == true) return;
            if (callback) callback(d,data);
        },type);
    },
	/*
	*Ajax请求
	*@req 请求参数
	*@queryMsg 请求提示语
	*@noQuery 是否启用请求提示语
	*@setArgsCb 用户自定义参数函数
	*/
    Req:function(req,queryMsg,noQuery,setArgsCb){
        if (queryMsg && !noQuery){
            return _.YesNoQuery(queryMsg,arguments.callee,[req,null,true,setArgsCb],null,req.queryOptions);
        }
        if (setArgsCb) setArgsCb.call(this,req); //??
		//获取请求全路径
        req.url = _.FullUrl(req.url);
        if (!req.args) req.args = {};
		//默认使用json格式请求服务器
        if (req.type === undefined) req.type = 'json';
		//默认使用post方式请求服务器
        if (req.post === undefined) req.post = true;
        _.ProcessReq(req);
		if(_track && _.IsAjaxTrack) _.ajaxTrack(req);
        return false;
    },
    Update:function(req,msg,setArgsCb){
        if (msg !== undefined){
            if (!msg){
                msg = "该操作不可恢复，确定"
                var action = req.action;
                if (!action)
                    action = "提交请求";
                msg += "<span class='ui-state-highlight'>[" + action+ "]</span>";
                msg += "吗？";
            }
        }
        if (req.nomod === undefined) req.nomod = 1;
        if (req.proc === undefined) req.proc = _.ReEnter;
        return _.Request(req,msg,false,setArgsCb);
    },
	//??
    Delete:function(req,msg,setArgsCb){
        if (msg !== undefined){
            if (!msg){
                msg = "该操作不可恢复，确定删除"
                if (req.name)
                    msg += "<span class='ui-state-highlight'>[" + req.name + "]</span>";
                msg += "吗？";
            }
        }
        //if (req.nomod === undefined) req.nomod = 1;
        if (req.bc === undefined) req.bc = 1;
        if (req.proc === undefined) req.proc = _.ReEnter;
        return _.Request(req,msg,false,setArgsCb);
    },
	/*
	*嵌套Iframe里面，通过获取父页面的高度和滚动条高度，确定位置
    *
	*/
	GetIframeCenterPosition:function(width,height){
		width = width || 450;
		height = height || 150;
		if(window.top != window){
			var w = $(window).width();
			var h = _.windowHeight; 
			var left =(w - width)/2;
			var top = (h - height)/2-125 + _.scrollTop;
			return [left,top];
		}
		else {
			var w = $(window).width();
			var h = $(window).height();
			var left =(w - width)/2;
			var top = (h - height)/2-125;
			return [left,top];
		}
    },
	/*
    * 无刷新表单提交
	* @formsel 表单ID，
	* @req 请求对象，
	* @queryMsg 请求提示语，
	* @noQuery 是否出现提示语，默认是
	* @return false 
	*/
	FormSubmit:function(formsel,req,queryMsg,noQuery){
        if (!noQuery){
            if (!queryMsg)
                queryMsg = "提交后将不能修改，确认提交吗？";
			//如果是在Iframe里面，需要动态获取偏移量
            if (window.top != window) {
                var pos = _.GetIframeCenterPosition();
                return _.YesNoQuery(queryMsg,arguments.callee,[formsel,req,null,true],null,{position:pos});
            }
            else {
                return _.YesNoQuery(queryMsg,arguments.callee,[formsel,req,null,true]);
            }
        }
		//设置修复标记
        _.ModFlag(false);
        req.type = 'json';
        _.AjaxSubmit(formsel,req);
        return false;
    },
	/*
	* 请求结果处理函数（1）
	* 主要验证请求结果的格式
	* @d 请求结果数据
	* @req 请求参数
	* @c 请求触发元素
	* @return ture表示结果出错，否则返回json内容或者HTML内容
	*/
    ReqResult:function(d,req,c){
		//fantasy for autocomplete
		//fix autocomplete bug begin
				if(window.__ac)
					delete window.__ac
		//fix autocomplete bug end
        var data;
        if (req.type == 'json'){
            if (!d){
                _.InfoShow("加载出错,服务器返回格式不对");
                if (req.fr) _.ReEnter();
                return true;
            }
            else if (d.errno != 0){
                if (d._action == "redirect") {
                    _.InfoShow("您的Token卡已过期，需刷新页面后重试");
                    return true;
                }  
                _.ErrorShow(d,c);
                if (req.fr || d.fr) _.ReEnter();
                return true;
            }
            //无错误
            data = d.error;
        }
        else
            data = d; //无错误
        return data;
    },
    /*
	* ajax请求过程
	* @req 请求参数
	*/
    ProcessReq:function(req){
        _.BlockUi();
        if (_.PreLoading) _.PreLoading();
        var reqm = ((!req.post)? $.get : $.post);
        reqm(req.url,req.args,function(d){
                _.UnblockUi();
                if (_.EndLoading) _.EndLoading();
                // step 1. 出错处理
                var data = _.ReqResult(d,req);
                if (data === true) return;
                _.CommCB(d,req,data);
            },req.type);
    },
	/*
	* 请求结果处理函数（2）
	* 主要验证请求结果的数据
	*/
    CommCB:function(d,req,data){
        // step 2. 提示用户结果
        if (req.tips !== undefined) alert(req.tips);
        // step 3. 是否需要加载数据 //一般不需要用到
        var c =req.c;
		//？？
        if (c) _.LoadData(req,c,data,d);
        // step 4. 页面已完成修改// 表单提交
        if (req.nomod) _.ModFlag(false);
        // step 5. go back
        if (req.bc){
            _.ModFlag(false);
            _.GoBack(req.bc,false);
        }
        //step 6. next req: may be  _.Enter\_.ReEnter\_.ExecNew .. ??
        var proc = req.proc;
        if (req.next && !proc)
            proc = _.Enter;
        if (proc){
            if (req.next){
                //  设置参数
                // A.only one arg (etc. id)
                if (req.idarg) {
                    if (!req.next.args)
                        req.next.args = {};
                    req.next.args[req.idarg] = data;
                }
                // B.复杂参数在回调函数中设置
                else if (req.argcb) req.argcb(d,req.next,data);
            }
            // go next
            proc(req.next);
        }
        //step 7. 回调用户 //一般不需要用到 ??
        if (req.cb) _.CallBack(req.cb,[d,req,data],_);
    }
});
_.Request = _.Req;

//iframe高度自适应，内容页面url传递
$.extend(_,{
    PublishIframeChange:function(){
       var h = 250;
       if ($('div.store-ui-base-wrapper').length){
           var myH = parseInt($('div.store-ui-base-wrapper').outerHeight());
           h = Math.max(myH,h);
       }
       //if (document.documentElement) h = Math.max(document.documentElement.scrollHeight,h);
       if (document.body.offsetHeight) h = Math.max(document.body.offsetHeight,h);
	   _.SendMessageToFather({autoHeight:h});
	   _.SendMessageToFather({hash:"url="+encodeURIComponent(window.location.href)});
   },
   SendMessageToFather:function(data,targetOrigin){
		$.extend(_.postMessageData,data);
		if(window.parent.postMessage){
			targetOrigin = targetOrigin || '*';
			window.parent.postMessage($.toJSON(_.postMessageData),targetOrigin);
			if(_.postMessageData.scrollChange) delete _.postMessageData.scrollChange;
			return true;
		}
		return false;
   },
   SendMessageToSon:function(data,targetOrigin){
		if($('#content_iframe')[0].contentWindow.postMessage){
			targetOrigin = targetOrigin || '*';
			$('#content_iframe')[0].contentWindow.postMessage(data,targetOrigin);
			return true;
		}
		return false;
   },
   GetMessageFromFather:function(e){
		var data = $.parseJSON(e.originalEvent.data);
		_.scrollTop = data.scrollTop;
		_.windowHeight = data.windowHeight;
   },
   GetMessageFromSon:function(e){
		var data = $.parseJSON(e.originalEvent.data);
		if(data.scrollChange){
			_.scrollChange = data.scrollChange;
			$(document).scrollTop(_.scrollChange);
		}
		
		if(data.autoHeight){
			var minh = 250;
			if (document.documentElement)
				minh = document.documentElement.clientHeight - 170;
			var h = minh;
			h = data.autoHeight;
			h = parseInt(h);
			if (isNaN(h) || h < minh) h = minh;
			$('#content_iframe').height(h);
		}
		if(data.hash){
			var hash = data.hash;
			if (hash && hash.length > 0){
                if (hash != _.lastIframeHash)
                {
                    _.lastIframeHash = hash;
                    var args = _.SplitArgs(hash);
                    if (_.IframeChangeCb) _.IframeChangeCb(args);
                    _.SetHashArgs(args);
                }
                else return;
            }
		}
   },
   /*点击锚点，跳转到对应的元素。改变父窗口，滚动条滚动距离
   *@elem 跳转到的元素
   *@num 跳转的距离 （可选）
   */
   ChangeFatherScroll:function(elem,num){
		var offsetTop = $("#"+elem).offset().top;
		if(num){
			offsetTop = num;
		}
		if(offsetTop){
			_.SendMessageToFather({scrollChange:offsetTop+30});
		}
   },
   InitIframe:function(checkTime){
       if (window.top != window) {
            //get the scrollTop and windowHeight by PostMessage
		   $(window).bind('message',_.GetMessageFromFather);
           $('div.store-ui-base-header').remove();
           $('div.store-ui-sub-base-menu-holder').remove();
           $('div.store-ui-base-footer').remove();
		   $('div.frame-iframe-need-remove').remove();
           $('#bottombar').remove();
           var xwrapper = $('div.store-ui-base-wrapper');
           if (xwrapper.length) xwrapper.css("width","auto");
		   window.setInterval("_.PublishIframeChange()",checkTime?checkTime:300);
           return true;
       }
       return false;
   },
   CheckIframeChange:function(){
		//由于使用scroll事件触发事件，会让刚开始页面获取不到参数，现在使用定时器触发。
		var scrollTop = $(document).scrollTop();
        var windowHeight = $(window).height();
        var data = {windowHeight:windowHeight,scrollTop:scrollTop};
		_.SendMessageToSon($.toJSON(data));
    },
	checkOA:function(){
		$.getJSON("checkOA.cgi",function(data){
			if(data.errno == 0){
				var time = 1000*60*30;
				st = setTimeout(_.checkOA,time);
			}
			else {
				_.YesNoQuery("<div>OA验证已经过期，请确认是否跳转到passport.oa.com验证页面。</div><div>若点击<strong style='font-weight:bolder'>确定</strong>，直接跳转到验证页面。</div><div>若点击<strong style='font-weight:bolder'>取消</strong>或<strong style='font-weight:bolder'>叉叉</strong>，停留在该页面，以便在跳转到登陆界面前，保存页面中您所需的内容。</div>",function(){
					var href=window.location.href;
					window.location.href="http://passport.oa.com/modules/passport/signin.ashx?url="+encodeURIComponent(href);
				},null,null,{position:[]});
			}
		});
	},
    //iframe父页面调用
    InitParentFrame:function(checkTime,cb){
		$(window).bind('message',_.GetMessageFromSon);
        window.setInterval("_.CheckIframeChange()",checkTime?checkTime:300);  
		var time = 1000*60*30;
        var st = setTimeout(_.checkOA,time);
		_.IframeChangeCb = cb;
		_.apdbaseNavHover();
		//_.loginName();
        var initArgs = _.GetHashArgs();
		$(window).hashchange(function(){
			var xArgs = _.GetHashArgs();
			var flag = false;
			for(var i=0;i<_.fregs.length;i++){
				var val = _.fregs[i];
				if(val.url == xArgs.url ){
					flag = true;
					break;
				}
			}
			//是否父页面重复页面，如果是，则back
			if (flag){
				window.history.back();
			}
			else {
				_.fregs.push(xArgs);
			}
		});
        return initArgs;
    }
});
//其他文件的东西都合并在这里。
$.extend(_,{
	//设置主菜单选中样式以及菜单hover菜单设置
	my_name_is:function(name,subname){},
	//获取url中的参数
	getQueryStringByName:function(name){
		var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
		if(result == null || result.length < 1){
			return "";
		}
		return result[1];
	}
});

$.extend(_,{
    menu:'',
    menusel:'menusel',
    selected:'_m_index',
    selectNoClear:false,
    getTreeItemUrl:null,
	indexUrl:'',
    scrollTopTime:100, // if < 0 then no jump
    //手风琴导航
	InitAccordion:function(args){
		if (window.top != window) {
			_.InitLayout();
		}
		_.Bind('init',_.OnInitAccordion,true);
        _.Init(args);
		//_.InitSystemInfo();
		//如果嵌入窗口
		if (window.top != window) {
			_.InitIframe();
		}
	},
	InitLayout:function(){
		$(".navbar").remove();
		$("#main-container").css("margin-top",0);
	},
	InitSystemInfo:function(info,admin){
		$("#apdbase-info-sysIntro").text(info);
		$("#apdbase-info-sysAdmin").html(admin);
		$.fn.rtxPresence && $('span.rtx_name').rtxPresence();
	},
	OnInitAccordion:function(){
        _.Bind('mark',_.OnAccordionMark);
        _.Bind('unmark',_.OnAccordionUnmark);

        _.Bind('f5',_.OnAccordionInit);
        _.Bind('history',_.OnAccordionHistory,true);

        _.Bind('dataload',_.OnDataLoad);
    },
	OnAccordionHistory:function(req){
        _.Clear();
        if (req.menu) {
            var freq = _.GetNodeReq("#"+req.menu);
            if (freq && freq.url != req.url)
                _.Record(freq);
        }
        _.Record(req);
        if (req.menu && _.menu != req.menu){
            _.menu = req.menu;
            var i = _.accordion.find('li.active').removeClass('active').end().find('#'+_.menu);
            if (i.length)
            {
                _.accordion.selected = i;
                i.addClass('active');
            }
        }
        return true;
    },
	OnAccordionMark:function(xArgs,req){
        if (req.name) xArgs._name = req.name;
        if (_.menu) {
            xArgs._menu = _.menu;
            if (!req.menu) req.menu = _.menu;
        }
    },
    OnAccordionUnmark:function(xArgs,req){
        req.name = xArgs._name;
        req.menu = xArgs._menu;
    },
	OnAccordionInit:function(req){
		//获得手风琴ID
		//获取默认选中项
		var selected;
		_.Clear();
		if (_.IsReqGood(req)){
            selected = [];
            if (req.menu) {
                _.menu = req.menu;
                var firstReq = _.GetNodeReq('#'+req.menu);
                if (firstReq && firstReq.url != req.url){
                    _.Record(firstReq);
                }
            }
            _.Record(req);
        }
		else{
            selected = _.selected;
        }
		_.accordion = $(_.menusel);
		_.InitIndexBreadCrumbs();
		_.accordion.find('li.leaf').click(function(){
			if (_.ModFlag()) return _.CheckMod(arguments);
			//var node = $(this).siblings().removeClass("active").end().addClass("active");
			var id = $(this).attr('id');
			var req = _.GetNodeReq($(this));
			    if(req.type && req.type=="_blank")
			    {
				window.open(req.url);
				return false;
			    }
			if (req){
				_.menu = id;
				//面包导航清空
				if (!_.selectNoClear) _.Clear();
					_.Enter(req);			
			}
			
		});
		
		_.accordion.find('li.leaf > a').click(function(e){ e.preventDefault();});
		//处理selected
		if(selected){
			var req = _.GetNodeReq('#'+selected);
			if (req){
				_.menu = selected;
				//面包导航清空
				if (!_.selectNoClear) _.Clear();
					_.Enter(req);			
			}
		}
	},
	//设置首页面包屑
	InitIndexBreadCrumbs:function(){
		$("#apdbase-breadcrumb-index").empty();
		if(_.indexUrl == ""){
			var li = $('<li ><i class="icon-home"></i>首页</li>');
		}
		else{
			var li = $('<li ><i class="icon-home"></i><a href="'+_.indexUrl+'">首页</a></li>');
		}
		$("#apdbase-breadcrumb-index").append(li);
	},
    InitTree:function(args){
        _.Bind('init',_.OnInitTree,true);
        _.Init(args);
    },
    OnInitTree:function(){
        //_.InitUi(args,true);
        _.Bind('mark',_.OnTreeMark);
        _.Bind('unmark',_.TreeUnmark);

        _.Bind('f5',_.OnTreeInit);
        _.Bind('history',_.OnTreeHistory,true);

        _.Bind('dataload',_.OnDataLoad);
        //_.Start();
    },
    OnTreeHistory:function(req){
        _.Clear();
        if (req.menu) {
            var freq = _.GetNodeReq("#"+req.menu);
            if (freq && freq.url != req.url)
                _.Record(freq);
        }
        _.Record(req);
        if (req.menu && _.menu != req.menu){
            _.menu = req.menu;
            var i = _.tree.find('a.clicked').removeClass('clicked').end().find('#'+_.menu);
            if (i.length)
            {
                _.tree.selected = i;
                i.children('a').addClass('clicked');
            }
        }
        return true;
    },
    OnDataLoad:function(d,req,c){
        _.AutoWatch(c);
        _.AutoInit(c);
        c.find("input.inputlabel").bind('focus ac',function(){
                    if (this.value == $(this).attr('title')) {
                        this.value = '';
                        $(this).removeClass('gray');
                    }
                }).blur(function(){
                    if (this.value == '') {
                        this.value = $(this).attr('title');
                        $(this).addClass('gray');
                    }
                }).blur();
    },
    OnTreeMark:function(xArgs,req){
        if (req.name) xArgs._name = req.name;
        if (_.menu) {
            xArgs._menu = _.menu;
            if (!req.menu) req.menu = _.menu;
        }
    },
    TreeUnmark:function(xArgs,req){
        req.name = xArgs._name;
        req.menu = xArgs._menu;
    },
    //on page reload
    OnTreeInit:function(req){
        var selected;
        if (_.IsReqGood(req)){
            selected = [];
            if (req.menu) {
                _.menu = req.menu;
                var firstReq = _.GetNodeReq('#'+req.menu);
                if (firstReq && firstReq.url != req.url){
                    _.Record(firstReq);
                }
            }
            _.Record(req);
        }
        else{
            selected = _.selected;
        }
        _.tree = $(_.menusel);
        if (_.treeTheme){
            _.tree.children("ul").children("li").css("cssText","padding-left:15px !important");
            theme_name = _.treeTheme;
        }
        else{
            theme_name = false; 
        }
        _.tree.tree({
            selected:selected,
            ui : {theme_name : theme_name},
            types :  { "default" : {
                renameable : false,
                deletable : false,
                creatable : false,
                draggable : false
            }},
            callback:{
                onload:function(t){
                    if (_.getTreeItemUrl){
                        t.settings.data.async = true;
                        t.settings.data.opts.url = _.FullUrl(_.getTreeItemUrl);
                        t.settings.data.type = 'html';
                    }
                },
                beforeclose:function(node,tree){if (!_.treeTheme) return false;},
                beforechange:function(node,tree){
                    if (!_.bugfix){
                        _.tree.find('a.clicked').removeClass('clicked');
                        _.bugfix = true;
                    }
                    var href=$(node).children('a').attr("href");
                    if (!$(node).attr("id"))       
                        return false;
                    return true;
                },
                onselect:function(node,treeobj){
                    if (_.ModFlag()) return _.CheckMod(arguments);
                    var id = $(node).attr('id');
                    if (_.OnTreeSelect){
                        if (_.OnTreeSelect(id) !== undefined)
                            return;
                    }
                    var t = $(node).attr("_t");
                    if (t == "open"){
                        window.open($(node).attr("url"));
                        return;
                    }
                    var req = _.GetNodeReq(node);
                    if (req){
                        _.menu = id;
                        if (!_.selectNoClear) _.Clear();
							_.Enter(req);
						
                        if (_.scrollTopTime >= 0)
                            $("html, body").animate({ scrollTop: 0},_.scrollTopTime);
                    }
                }
            }
        });
        _.tree.find("li > a").each(function(){
            if (!$(this).parent().attr("url")){       
                $(this).attr('class','ui-state-disabled');
                $(this).attr('title','功能开发中...');
            }
        }); 
        if (!_.getTreeItemUrl && !_.noExpandAll || _.noExpandAll === false){
            _.tree.find("li.closed").removeClass("closed");
            _.tree.find("ul").css("display","block");
        }
        if (_.menu)
            _.tree.find('a.clicked').removeClass('clicked').end().find('#'+_.menu).children('a').addClass('clicked');
    },
    //-----------private function--------------
    GetNodeReq:function(sel){
        var $n = $(sel);
        var url = $n.attr('url');
        var req = false;
        if (url){
            var prefix = $n.attr('_prefix');
            if (!prefix) {
                _.urlPrefix = _.defaultUrlPrefix;
            }
            else {
                _.urlPrefix = prefix;
            }
            var $a = $n.find('a:first');
            req = {url:_.FullUrl(url),name:$a.text(),menu:$(sel).attr("id")};
            var type = $n.attr('_type');
            if (type) req.type = type;
            var post = $n.attr('_post');
            if (post) req.post = true;
		if ( type == "iframe" ) {
			req.iframe_cb=$n.attr('callback');
		}
			
            //_.InitNew(req);
        }

        return req;
    },
    //----------- tab------------
    InitTab:function(args){
        _.Bind("init",_.OnInitTab);
        _.selected = 1;
        _.Init(args);
    },
    OnInitTab:function(args,Tabsel,selected){
        //_.InitUi(args,true);
        _.Bind('mark',_.OnTreeMark);
        _.Bind('unmark',_.TreeUnmark);

        _.Bind('f5',_.OnTabInit,true);
        _.Bind('history',_.OnTabHistory,true);

        _.Bind('dataload',_.OnDataLoad);
        //_.Start();
    },
    ChangeTab:function(to){
		var o = _.tab.find('#'+to);
        if (o.length){
			_.tab.find('.ui-state-active,.ui-tabs-selected').removeClass('ui-tabs-selected ').removeClass('ui-state-active');
			o.addClass('ui-tabs-selected ').addClass('ui-state-active');
		}
    },
    OnTabHistory:function(req){
        _.Clear();
        if (req.menu) {
            var freq = _.GetNodeReq("#"+req.menu);
            if (freq && freq.url != req.url)
                _.Record(freq);
        }
        _.Record(req);
        if (req.menu !== "" && _.menu != req.menu){
            _.menu = req.menu;
            _.ChangeTab(_.menu);
			//_.tab.tabs('option','selected',_.menu);
        }
        return true;
    },
    OnTabInit:function(req){
        _.tab = $(_.menusel);
		_.tab.children('ul').prepend('<li style="display:none"><a href="xx">test</a></li>');
		_.tab.find('a').attr('href','#'+_.$c.attr("id"));
		_.tab.tabs();
	
        if (_.IsReqGood(req)){
            if (req.menu !== ""){
                _.menu = req.menu;
                var firstReq = _.GetNodeReq('#'+req.menu);
                if (firstReq && firstReq.url != req.url){
                    _.Record(firstReq);
                }
            }
            _.Record(req);
        }
		/*
        _.tab.tabs({
               // active:0,
				activate:function(event,ui){
					if (_.ModFlag()) return _.CheckMod(arguments);
					var menu = ui.newTab.attr('id');
                    if (!menu) return;
					var req = _.GetNodeReq('#' + menu);
					if (req){
                        _.menu = menu;
						_.Clear();
						_.Enter(req);
					}
				}
        });
		*/
		_.tab.bind('tabsactivate', function(ev, ui){
			if (_.ModFlag()) return _.CheckMod(arguments);
			var menu = ui.newTab.attr('id');
			if (!menu) return;
			var req = _.GetNodeReq('#' + menu);
			if (req){
				_.menu = menu;
				_.Clear();
				_.Enter(req);
			}
		});
		if (_.IsReqGood(req)){
			_.menu = req.menu;
			_.ChangeTab(_.menu);
		}
        else{
			var index = $("#"+_.selected).find('a').attr("id").substring(6,7);
			_.tab.tabs('option','active',parseInt(index)-1);
            selected = [];
        }
		
    },
	AcResult:function(){
		return true;
	},
	WatchMod:function(){
        _.ModFlag(true);
    },
    AutoWatch:function(c){
        var f = c.find('form[_watch]');
        if (f.length){
            //input/textarea之类控件内容改变后，修改当前页面标志[除非控件有属性_nowatch
            f.find("input,textarea,select").not('[_nowatch]').change(_.WatchMod);
        }
    },
	AutoInit:function(c){
        //反选
        function AutoRevert(c){
            var s_a = c.find("thead a:first");
            if (s_a.attr('auto_sel')) {
                s_a.click(function(){
                    return _.SelectAll(this);
                });
            }
        }
        AutoRevert(c);
        //按钮样式
        //c.find("button").not('.ui-button').button();
		
        //readonly
        //_.ReadOnly(c);
        //_.TextAreaAJ(c);
    },
	/*
	* iframe 头部内容
	*/
	my_name_is:function(name,subname){
		var lis = $(".apdbase-nav>li");
		$(".dropdown-navbar li").removeClass("selected");
		lis.each(function(){
			var t = $(this).children("a").eq(0).text();
			t = t.replace(/(^\s*)|(\s*$)/g, ""); 
			if( t == name ) {
				$(this).siblings().removeClass("navbar-selected").end().addClass("navbar-selected");
				var lis2 = $(this).find("li");
				lis2.each(function(){
					var as = $(this).children("a");
					if( as.attr("_name") == subname || as.text().replace(/(^\s*)|(\s*$)/g, "") == subname){
						$(this).addClass("selected");
					}					
				});
			}
		});
		
		
	},
	apdbaseNavHover:function(){
		//主菜单hover事件
		$(".apdbase-nav > li").hover(
			function(){
				$(this).addClass("open");
			},
			function(){
				$(this).removeClass("open");
			}
		);
	},
	loginName:function(){
		var n = $('#login_name');
		n.html(getCookie("LoginName"));
		function getCookie(name) 
		{ 
			var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
		 
			if(arr=document.cookie.match(reg))
		 
				return unescape(arr[2]); 
			else 
				return null; 
		}
	},
	/*
	*Ajax监控函数
	*/
	ajaxTrack:function(req){
		if( !/http:\/\//.test(req.url)){
			req.url = _.FullUrl(req.url);
			req.url = "http://" + window.location.host+req.url;
		}
		var args = { _n : req.n , _v:_.v};
		args._url = req.url;
		args._type = req.type;
		for(var i in req.args){
			if (req.args[i] !== undefined)
			{
				args[i] = req.args[i];
			}
		}
		var query=[];
        var totalLen = 0;
        function _Get(x){
            if (args[x] !== undefined) {
                var curV = x + '='+encodeURIComponent(args[x]);
                if (totalLen + curV.length + 1 <= 2000) //max 2083
                {
                    totalLen += curV.length + 1;
                    query.push(curV);
                }
            }
        }
        //sys first
        for(var n in args)
            if (n.length > 0 && n.charAt(0) == "_") _Get(n);
        //then user
        for(var n in args)
            if (n.length > 0 && n.charAt(0) != "_") _Get(n);
        query = query.join('&');
		var host = window.location.href.split('#')[0];
		var info = host+'#'+query;
		_track(info);
	},
	/*封装合并dataTables
	*	@parms id 表格ID
	*	@parms settings 设置参数
	*	@return table对象
	*/
	dataTable:function(id,settings){
		var defaults = {
			"iDisplayLength":20,
			"sDom":'t',
			"sScrollY": "500px",
			"sScrollX": "100%",
			"sScrollXInner": "150%",
			"bScrollCollapse": true,
			"bPaginate": true
		};
		defaults = $.extend({},defaults,settings || {})
		var oTable = $("#"+id).dataTable(defaults);
		
		new FixedColumns( oTable, {
		"iLeftWidth": 150,
		"fnDrawCallback": function ( left, right ) {
			var that = this, groupVal = null, matches = 0, heights = [], index = -1;
			
			/* Get the heights of the cells and remove redundant ones */
			$('tbody tr td', left.body).each( function ( i ) {
				var currVal = this.innerHTML;
				
				/* Reset values on new cell data. */
				if (currVal != groupVal) {
					groupVal = currVal;
					index++;
					heights[index] = 0;
					matches = 0;
				} else  {
					matches++;
				}
				
				heights[ index ] += $(this.parentNode).height();
				if ( currVal == groupVal && matches > 0 ) {
					this.parentNode.parentNode.removeChild(this.parentNode);
				}
			} );

			/* Now set the height of the cells which remain, from the summed heights */
			$('tbody tr td', left.body).each( function ( i ) {
				that.fnSetRowHeight( this.parentNode, heights[ i ] );
			} );
			
			}
		});
		
		return oTable;
		
	}
    /* ---------------   util  --------------- */
});


(function(){

//dataTable 优化配置
	var adpBaseDefaults = {
		oLanguage:$.extend({},$.fn.dataTableSettings.oLanguage,{
			sEmptyTable: "没有数据在表格中",
			sInfoFiltered: "(从 _MAX_ 条数据中筛选出)",
			sLengthMenu: "每页显示 _MENU_ 条记录",
			sInfoPostFix: "",
			sInfoThousands: ",",
			sZeroRecords: "没有检索到数据",
			sInfo: "从第 _START_ 到第 _END_ 条数据；共 _TOTAL_ 条记录",
			sInfoEmtpy: "没有数据",
			sLoadingRecords: "正在加载数据...",
			sProcessing: "正在加载数据...",
			sSearch: "搜索:",
			sUrl: "",
			oPaginate: {
				sFirst: "首页",
				sPrevious: "前页",
				sNext: "后页",
				sLast: "尾页"
			},
			oAria:{
				sSortAscending: ": activate to sort column ascending",
				sSortDescending: ": activate to sort column descending"
			}
		}),	
		fnInitComplete:function(oSettings, json){
			if($("#" + oSettings.sTableId + "_info").text() == "undefined" ){
				$("#" + oSettings.sTableId + "_info").text("");
			}
			if($("#" + oSettings.sTableId + "_info").length > 0){
				var sorting_table_info = $("#" + oSettings.sTableId + "_info").html();
				sorting_table_info = sorting_table_info.replace("undefined", "");
				$("#" + oSettings.sTableId + "_info").html(sorting_table_info);
			}
			$("#" + oSettings.sTableId + "_info").text("共 " + oSettings.fnRecordsDisplay() + " 条记录 ");
			$("#" + oSettings.sTableId).parents("div").find("input").each(function(){
			    if($(this).attr("type") == "search"){
				$(this).keyup(function(){
				$("#" + oSettings.sTableId + "_info").text("共 " + oSettings.fnRecordsDisplay() + " 条记录 ");
				});
			    }
			});

		},
		fnInfoCallback:function(oSettings, iStart, iEnd, iMax, iTotal, sPre){
			if($("#" + oSettings.sTableId + "_info").text() == "undefined" ){
				$("#" + oSettings.sTableId + "_info").text("");
			}
			if($("#" + oSettings.sTableId + "_info").length > 0){
				var sorting_table_info = $("#" + oSettings.sTableId + "_info").html();
				sorting_table_info = sorting_table_info.replace("undefined", "");
				$("#" + oSettings.sTableId + "_info").html(sorting_table_info);
			}
		},
		sDom:'<"row-fluid"<"span6"<"dataTables_length"r>><"span6"<"dataTables_filter"f>>>t<"row-fluid"<"span6"il><"span6"<"dataTables_filter"p>>>'
	};
	$.fn.dataTable && ($.fn.dataTable.defaults = $.extend({},$.fn.dataTable.defaults,adpBaseDefaults));

//datepicker中文优化
	var fnDatepicker = $.fn.datepicker;
	$.fn.datepicker=function(settings){
		var defaults={
			language:"zh-CN",
			autoclose:true
		};
		var options = $.extend({},defaults,settings || {});
		fnDatepicker.call(this,options);
	}
	
//统一修复 $.browers 错误
	$.extend({browser:{}});
	$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
	$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
	$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
	$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
})();


var MessageCount = {
	num:0,
	MessageCountPollSeconds:200,//200s 一次请求总数据
	url:"http://iworks.oa.com/cgi-bin/work_plat/cgi-bin/message/msgGet.cgi",
	init:function(){
		MessageCount.getCount();
	},
	getCount:function(){
		$("#msg-count-bell").removeClass("icon-animated-bell");
		var req = {};
		req.message_finish = "1,3";
		req.sys_no = 0;
		req.message_user = $("#login_name").html();
		MessageCount.ajaxToServer($.toJSON(req),function(data){
			if(data.errno == 0){
				MessageCount.showResult(data.result);
			}
			else {
				alert("操作失败:"+data.error);
			}
		});
	},
	showResult:function(result){
		var msgNum=0;
		if ( result && result.length ){
			$.each(result,function(index,entry){
				msgNum += entry["message_unfinish_num"];
			});
		
			if ( msgNum > MessageCount.num){
				$("#msg-count-bell").addClass("icon-animated-bell");
			}
		}
		MessageCount.num = msgNum;
		$("#msg-count").html(MessageCount.num);
		window.setTimeout(MessageCount.getCount,MessageCount.MessageCountPollSeconds*1000);
	},
	//jsonp for CROS
	ajaxToServer:function(params,callback){
		$.ajax({
			async:false,
			url:MessageCount.url,
			type:'GET',
			dataType:'jsonp',
			crossDomain:true,
			data:{"req":params},
			jsonp:"jsonp",
			success:function(data){
				callback(data);
			},
			error:function(msg,b,c){alert(msg,b,c);}
		});
		
	}
}
