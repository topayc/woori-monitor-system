<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page session="false"%>
<!DOCTYPE html>
<html>
<head>
	<title>Woori Monitor</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="Expires" content="-1">
	<meta http-equiv="Pragma" content="no-cache">
	<meta http-equiv="Cache-Control" content="No-Cache">
	<!-- 
	<meta http-equiv="content-type" content="text/html; charset=euc-kr" />
	 -->
	<link rel="stylesheet" type="text/css" href="resources/themes/gray/easyui.css">
	<link rel="stylesheet" type="text/css" href="resources/css/default.css">
  	<link rel="stylesheet" type="text/css" href="resources/themes/icon.css">
  	<link rel="stylesheet" type="text/css" href="resources/themes/color.css">
  	
  	 <script type="text/javascript" src="resources/js/plugin/jquery.min.js"></script>
    <script type="text/javascript" src="resources/js/plugin/Chart.bundle.min.js"></script>
	<script type="text/javascript" src="resources/js/plugin/jquery.easyui.min.js"></script>
	<script type="text/javascript" src="resources/js/plugin/datagrid-filter.js"></script>
    <script type="text/javascript" src="resources/js/utils.js"></script>
    <script type="text/javascript" src="resources/js/ui_helper.js"></script>
</head>
<body id ="body_container">
	<!-- OCX Controll -->
	<!--  
   <OBJECT ID="monitorOCX" CLASSID="CLSID:BCB1F999-9ABD-4A00-B260-50FE578CC078" CODEBASE="/resources/Project1.CAB#version=1,0,0,0" width = "0" height = "0"></OBJECT>
    -->
    <div class="easyui-layout" id ="container" data-options="border:true" style="width:1280px;height:965px;overflow: hidden">
        <div data-options="region:'west',split:true" title="&nbsp;상담원 현황" style="width:470px;overflow:hidden;">
			<table class="callQueuedGird" id = "callQueuedGird" style="width:100%;height:30%" > </table>
		  	
		  	<div  id ="left_tab" style="width:100%;margin-top:7px;height:0px;overflow:hidden" data-options="border:false,narrow:true,plain:true">
		  		<div title="전체"> </div>
		  	</div>
		  	
		  	<div id ="left_tab_content"  style ="width:100%; height:500px">
		  		<table class="agentStatusGrid"  id ="agentStatusGrid" style="height:620px;width:100%;"></table>
		   </div>
		 </div>
        
       <div data-options="region:'center',border: false" style ="height:100%;overflow:hidden">
        	<div id="right_tab" class="easyui-tabs" style="width:100%;height:100%;overflow: hidden"  data-options="border: false,narrow : true,plain:true">
			    <div title="상담원 상태 현황" style="display:none;overflow: hidden">
			   		<div class="easyui-panel" title="전체 현황" style="width:100%;height:30%;">
				     	<div  class="easyui-layout" data-options="fit:true">
			   	    		<div data-options="region:'west',split:false,border:false"  style="width:90px">
			   	    			<div class="easyui-panel" id ="agentStatsSummary_login" headerCls="center_align" bodyCls ="center_align"	title="로그인" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="agentStatsSummary_avail" headerCls="center_align" bodyCls ="center_align"	title="대기"   style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="agentStatsSummary_left_seat" headerCls="center_align" bodyCls ="center_align"	title="이석"   style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="agentStatsSummary_call" headerCls="center_align" bodyCls ="center_align"	title="통화중" style="width:100%;height:55px;"></div>
			   	     			
			   	    		</div>
			   	    		<div data-options="region:'center',split:true,border:false"  >
			   	    			<div style="float:left;width:60%;height:100%;position:absolute;left:0px;top:0px;padding:10px">
				   	    			<canvas  id="agentStatusHBarChart" style ="width:400px;height:200px;">[No canvas support]</canvas>
				   	    		</div>
				   	    		<div style="float:left;width:40%;height:200px;position:absolute;left:60%;top:0px;padding:10px;">
				   	    			<canvas id="agentStatusDonutChart" style ="width:250px;height:200px;margin-top:5px;margin-left:20px" >[No canvas support]</canvas>
				   	    		</div>
			   	    		</div>
			   	    	</div>
			   	    </div>
			   	    <div class="easyui-panel" id = "groupStatsPanel" title="전체 현황 [단말]" style="width:100%;height:70%;padding:2px;">
			   	    	<div  class="easyui-layout" data-options="fit:true">
			   	    		<div data-options="region:'west',split:false,border:false"  style="width:90px" id ="summary">
			   	    			<div class="easyui-panel" id ="group_summary_panel_login"  title="로그인" headerCls="login"      bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_avail" title="대기"    headerCls="waiting"    bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_calling" title="통화중"  headerCls="calling"    bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_wrapup" title="<center style='color:white'><b>후처리</b></center>"  headerCls="post_con"   bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_breaking" title="휴식" 	  headerCls="break"	     bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_working" title="업무" 	  headerCls="working"    bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_meeting" title="<center style='color:white'><b>회의</b></center>"    headerCls="conference" bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_mear" title="<center style='color:white'><b>식사</b></center>"    headerCls="meal"       bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_out" title="<center style='color:white'><b>외출</b></center>"     headerCls="out" 	     bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	     			<div class="easyui-panel" id ="group_summary_panel_edu" title="교육"    headerCls="edu"  	     bodyCls ="center_align" style="width:100%;height:55px;"></div>
			   	    		</div>
			   	    		<div data-options="region:'center',split:true"  >
			   	    			<div  class="easyui-layout" data-options="fit:true" style="margin-left:3px">
			   	    				<div data-options="region:'north',split:false,border:true"  style="width:100%;height:20%">
			   	    					<table class="easyui-datagrid" id = "groupStatusGrid" style="width:100%;height:100%">
					   					</table>
			   	    				</div>
			   	    				<div data-options="region:'center',split:false,border:true"  style="width:100%;height:45%;">
			   	    					 <div class="easyui-panel" data-options="border:false" style="width:100%;height:98%;margin-left:5px;overflow: auto;padding:10px">
											  <div style="width:100%;height:100%;">
					   	    					      <canvas id="groupStatusBarChart"  width ="670" height ="270">[No canvas support]</canvas>
												</div>
										 </div>
			   	    				</div>
			   	    				<div  data-options="region:'south',split:false,border:true" style="position:relative;width:95%;height:30%;overflow: visible">
			   	    					 <div class="easyui-panel" data-options="border:false" style="width:100%;height:98%;overflow: auto;padding:3px">
											 <div id = "group_pie_chart" style ="width:100%;" >
											 </div>
										 </div>
			   	    				</div>
			   	    			</div>
			   	    		</div>>
			   	    	</div>
			   	    </div>
			    </div>
			    <div title="상담원 통화 현황" style="overflow:hidden;display:none;">
			        <div class="easyui-panel" title="전체 현황" style="width:100%;height:30%;padding:2px">
				     	<div  class="easyui-layout" data-options="fit:true,border:false">
			   	    		<div data-options="region:'west',split:false,border:false"  style="width:200px">
			   	    			<div class="easyui-panel totalCallCount" headerCls="center_align" bodyCls ="center_align"	title="전체 상담콜"  style="width:100%;height:55px;">-</div>
					   	    	<div class="easyui-panel totalInCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="응대콜"  style="width:50%;height:55px;">-</div>
					   	     	<div class="easyui-panel totalOutCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="발신콜" style="width:50%;height:55px;">-</div>
					   	     	<div class="easyui-panel totalTrnsCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="전환" style="width:50%;height:55px;">-</div>
					   	   		<div class="easyui-panel totalRonaCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="No 응대콜" style="width:50%;height:55px;">-</div>
					   			<div class="easyui-panel totalCnfrCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="3자 통화" style="width:50%;height:55px;">-</div>
			   	    		</div>
			   	    		<div data-options="region:'center',split:true,border:false"  style="width:92%">
			   	    			  <div class="easyui-panel" data-options="border:true" style="width:100%;height:98%;margin-left:5px;overflow: hidden;padding:10px">
									
									  <div style="width:100%;height:100%;">
			   	    					    <canvas id="agentCallBarChart"  width ="590" height ="200">[No canvas support]</canvas>
										</div>
								 </div>
			   	    		</div>>
			   	    	</div>
			   	    </div>
			   	    <div class="easyui-panel"  style="width:100%;height:70%;padding:2px;">
			   	    	<div  class="easyui-layout" data-options="fit:true">
			   	    		<div data-options="region:'north',split:true"  style="width:100%;height:60%">
			   	    				<table  id = "agentCallStatusGrid" style="width:100%;height:100%" ></table>
			   	    		</div>
			   	    		<div data-options="region:'center',split:false"  style="width:100%">
			   	    			<div  class="easyui-layout" data-options="fit:true">
					   	    		<div data-options="region:'west',split:false,border:false"  style="width:200px">
					   	    			<div class="easyui-panel totalCallCount" headerCls="center_align" bodyCls ="center_align"	 title="전체 상담콜"  style="width:100%;height:55px;">-</div>
					   	    			<div class="easyui-panel totalInCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="응대콜"  style="width:50%;height:55px;">-</div>
					   	     			<div class="easyui-panel totalOutCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="발신콜" style="width:50%;height:55px;">-</div>
					   	     			<div class="easyui-panel totalTrnsCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="전환" style="width:50%;height:55px;">-</div>
					   	     			<div class="easyui-panel totalRonaCallCount" headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="No 응대콜" style="width:50%;height:55px;">-</div>
					   	     			<div class="easyui-panel totalCnfrCallCount"  headerCls="center_align" bodyCls ="center_align"	data-options ="cls:'float_left'" title="3자 통화" style="width:50%;height:55px;">-</div>
					   	     			
					   	    		</div>
					   	    		<!-- agentCallHBarChart 스타일 시트 변경 -->
					   	    		<div data-options="region:'center',split:true,border:true"  style="width:92%;padding:20px;margin-left:5px;">
					   	    			 <div class="easyui-panel" data-options="border:false" style="width:100%;height:98%;margin-left:5px;overflow: hidden;padding:10px">
											  <div style="width:100%;height:100%;position:absolute;left:0px;top:0px;padding:10px;">
					   	    					    <canvas  id="agentCallHBarChart"    style ="margin-left:10px;margin-top:10px" width ="560" height ="210">[No canvas support]</canvas>
											  </div>
										 </div>
					   	    		</div>
					   	    		<!-- agentCallHBarChart 스타일 시트 변경 끝-->
			   	    			</div>
			   	    		</div>
			   	    	</div>
			   	    </div>
			    </div>
			</div>
        </div>
    </div>
    <script type="text/javascript" src="resources/js/monitor.js"></script>
    <script type="text/javascript" src="resources/js/monitor_auto.js"></script>
    <script type="text/javascript">
    	$(document).ready(function(){
    		MONITOR.init(); 
    	});
    </script>
    
    <script language="javascript" type="text/javascript" for="monitorOCX" event="getEventOnAgentList(SrtnString)">
    	MONITOR.getEventOnAgentList(SrtnString);
    </script>
    <script language="javascript" type="text/javascript" for="monitorOCX" event="getEventOnAgentStateChange(SrtnString)">
    	MONITOR.getEventOnAgentStateChange(SrtnString);
    </script>
    <script language="javascript" type="text/javascript" for="monitorOCX" event="getEventOnGroupStateSummary(SrtnString)">
   		 MONITOR.getEventOnGroupStateSummary(SrtnString);
    </script>
    <script language="javascript" type="text/javascript" for="monitorOCX" event="getEventOnCallQueued(SrtnString)">
   		 MONITOR.getEventOnCallQueued(SrtnString);
    </script>
    <script language="javascript" type="text/javascript" for="monitorOCX" event="getEventOnAgentStateSummary(SrtnString))">
    	MONITOR.getEventOnAgentStateSummary(SrtnString)
    </script>
</body>
</html> 
