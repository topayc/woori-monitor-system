
function openMessageWindow(t,m) {
	var elStr = '<div id="message_window" style ="padding:30px;font-weight:bold;font-family:Gulim, Dotum;font-size:12px;color:#0092DC"></div>';
	$(elStr).appendTo('body');
	$('#message_window').html(m);
	$('#message_window').window({
		width:400,
		height:200,
		modal:true,
		title:t,
		onClose : function(){
			$("#message_window").window('destroy');
		}
	});
}

function messageWindow(opts){

	var options = {title : "", content : "", width : 400, height: 500, modal : true};
	$.extend(options, opts);
	var elStr = '<div id="'+ options.windowId +'" style ="padding:3px;"></div>';
	$(elStr).appendTo('body');
	
	$("#"+ options.windowId ).html(options.content);
	$("#"+ options.windowId ).window({
		width:options.width,
		height:options.height,
		modal:options.modal,
		title:options.title,
		border: 'thin',
		cls : "c6",
		
		onOpen: function(){
			var stateGrid = $('#' + options.gridId).datagrid();
			stateGrid.datagrid({
				rownumbers:true,
				singleSelect:true,
				border : true,
				collapsible:false,
				fitColumns:true,
				//title : "그룹별 현황",
			  columns:[[
			        {field:'agentId',title:'Agent Id',width:100,align:'center'},
			        {field:'agentName',title:'이름',width:100,align:'left'},
			        {field:'extn',title:'내선',width:100,align:'center'},
			        {field:'stateTypeKor',title:'상태',width:100,align:'left'},
			        {field:'readableLastingTime',title:'상태시간',width:100,align:'center'},
			        {field:'sgKorName',title:'스킬그룹',width:100,align:'left'},
			        {field:'position',title:'직책',width:100,align:'center'}
			    ]],
			    data : options.gridData ?  options.gridData : []
			});
		},
		
		onClose : function(){
			$("#"+ options.windowId).window('destroy');
			$("#"+ options.windowId).window('close');
		}
	});
	$("#"+ options.elemId).window('open');
}

function openLoadingProgress(t,m){
	var elStr = 
		'<div id="loading" style ="padding:30px;font-weight:bold;font-family:Gulim, Dotum;font-size:12px;color:#0092DC">'+
			'<img class ="loading" style ="width:66px;height:66px;position:absolute;left:50%;top:50%;margin-left:-33px;margin-top:-23px" src="resources/images/loading.gif">'+
		'</div>';
	$(elStr).appendTo('body');
	$('#loading').window({
		collapsible : false,
		minimizable : false,
		maximizable : false,
		closable : false,
		width:300,

		//border:'thin',
		height:150,
		modal:true,
			
		title:t,
		onClose : function(){
			$("#loading").window('destroy');
		}
	});
}

function showMessage(title, msg, showType){
	 $.messager.show({
     title:title,
     msg:msg,
     cls : "c5",
     border: "thin",
     showType:showType ? showType : "show"
	 });
}

function closeLoadingProgress(){
	$("#loading").window('destroy');
	$("#loading").remove();
}

function openMessageDlg(t,m,fn) {
	var elStr = '<div id="message_dlg" style ="padding:30px;font-weight:bold;font-family:Gulim, Dotum;font-size:12px;color:#0092DC"></div>';
	$(elStr).appendTo('body');
	$('#message_dlg').text(m);
	$('#message_dlg').dialog({
		width:400,
		//border:'thin',
		height:200,
		modal:true,
		border: 'thin',
		cls : "c6",
		buttons:[
			{text:'확인',handler:function(){
				$("#message_dlg").dialog('close');
				if (MONITOR.ocxMode !="test") fn();
			}},
			{text:'취소',handler:function(){
				$("#message_dlg").dialog('close');
			}}
		],
			
		title:t,
		onClose : function(){
			$("#message_dlg").window('destroy');
		}
	});
}
