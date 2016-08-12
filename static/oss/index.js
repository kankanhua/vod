
     $(function(){
        _.InitAccordion({
            maxMreq:4,//最大Enter层数
            urlPrefix:'',//cgi前缀
            $c:$('#page-content'),//右边内容区域Div
            appName:'TARS',
            sysIntro:'TARS',//系统信息
            sysAdmin:'coreyxu',//系统负责人
            $nav:$('#apdbase-breadcrumbs'),//面包屑导航区域DIV
            menusel:'div.menuaccordion',//左导航区域DIV
            selected:"_overview"//默认打开的ID
        });
       //init_dictionary();
   });

$.ajaxSetup({
    contentType: "application/x-www-form-urlencoded"
});
