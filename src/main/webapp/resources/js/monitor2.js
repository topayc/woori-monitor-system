/*
 *	2007 3-17 
 * initGroupStatusGrid : 초기화시 교육 컬럼 추가 (1424 라인)
 * updateGroupStateSummary : 위의 교육 컬럼 추가로 실제 그리드에  교육 데이타 추가 및 업데이트 반경(1939, 1961 라인)
 * 
 */

var groupStatusGrid = [
	{teamNameKor : "-" ,login:"-" ,avail :"-"  , talkin : "-" , wrapup:"-" , breaking:"-" , working:"-" ,conference: "-" , meal:"-" ,out:"-"  }
]; 

var agentCallStatusDatas = [
	{agentName : "-" ,skilGroupKorName :"-" ,totalCall :"-", inCall :"-", outCall:"-", trnsCall:"-", cnfrCall:"-", ronaCall:"-" }
];

//한글 상태명으로 색상 결정 
/*
function cellStyler(value,row,index){
	log(">>> cellStyler Called ");
	log("value : " + value + " , index : " + index);
	log(row);
	
	var color = "";
	
	switch(value){
		case "로그아웃": color = COLOR_STAT_TYPE.LOGOUT; break;
		case "대기":   color = COLOR_STAT_TYPE.AVAIL ; break;
		case "후처리": color = COLOR_STAT_TYPE.WRAPUP; break;
		case "보류": color = COLOR_STAT_TYPE.HOLD; break;
		case "통화중": color = COLOR_STAT_TYPE.TALK; break;
		
		case "업무": color = COLOR_STAT_TYPE.WORKING; break;
		case "회의": color = COLOR_STAT_TYPE.CONFERENCE; break;
		case "식사": color = COLOR_STAT_TYPE.MEALING; break;
		case "외출": color = COLOR_STAT_TYPE.OUT; break;
		case "휴식": color = COLOR_STAT_TYPE.BREAKING; break;
		case "교육": color = COLOR_STAT_TYPE.EDU; break;
		default: color  = COLOR_STAT_TYPE.DEFAULT; break;
	}
	log(">>> cellStyler End ");
  return color ;
}
*/

//OCX 로 부터 받은 패킷중 상태 문자열에 의한 셀 스타일러
function cellStyler2(value,row,index){
	var color =  MONITOR.protocol.agentStateType2[row.stateType][4];
  if (!color) {
  	color = 'background-color:rgb(240,240,240);color:black;'
  }
  return color;
}

//상태 코드값에 의한 스타일러 
function cellStyler(value,row,index){
	var color =  MONITOR.protocol.agentStateType[row.stateTypeCode][4];
  if (!color) {
  	color = 'background-color:rgb(240,240,240);color:black;'
  }
  return color;
}

function genId(value,row,index){
	return row['agentId'];
}

var MONITOR = {
	isInit : false,
	monitorOCX : null,
	dataSource : {
		agentStateLog : {},  // 에이전트별 상태 변화 저장
		agentLogCheck : {},  // 에이전트의 상태 추적 여부 
		agentList : [],
		
		/*
		 * 로딩한 상담원 리스트를 그리드레 빠르게 적용하기 위하여
		 * 각 그룹별로 필터링된 오브젝트
		 * 상담원 전체 리스트를 로드한 후, filering 작업이 수행됨 
		 * key : 스킬그룹 ID,  value : 각 스킬그룹에 속한 상담원 리스트  
		 */
		groupedAgentList : {},
		
		
		callQueuedStats: [],
		agentStateSummary : {},  
		
		/*
		 * key : 긱 그룹의 sgId;
		 * value : 각 그룹의 통계 정보 
		 */
		groupStateSummary : { },
		
		/*
		 * key : 긱 그룹의 sgId;
		 * value : 각 그룹의 스킬 정보
		 */
		skillGroups : {}, 
		
		/*
		 * 스킬 그룹별 가중치에 따라 소팅된 스킬그룹 배열
		 */
		sortedSkillGroups : []
	},
	
	//HTML Element 
	element : {},
	
	//Runtime App Info 
	appInfo : {
		/* 뷰의 초기화 여부 */
		isViewInit : false, 
		
		selectedLeftTab : {
			title : "전체",
			indes : 0,
			gridId : 'all_grid',
			agents : "",
			sgId : 'all',
			sgEngName : "all",
			sgKorName : "전체",
			sgNumber : -1
			
		},
		selectedRightTab : {
			index : 0, 
			title : "상담원 상태 현황"
		}
	},

	protocol : { 
		//AgentStat
		agentStateType : {
			//상담원 상태 코드 
			"0" : [0,"eLogin","LOGIN","로그인"												,'background-color:rgba(255,000,204,1);color:white;border'],
			"1" :	[1,"eLogout","LOGOUT","로그아웃"										,'background-color:rgba(120,120,120,1);color:white;'],
			"2" :	[2,"eNotReady","NOTREADY","이석"										,'background-color:rgba(240,240,240,1);color:black;'],
			"3" :	[3,"eAvailable","AVAIL","대기"											,'background-color:rgba(255,255,0,1);color:black;'],
			"4" :	[4,"eTalking","TALKING","통화중"										,'background:rgba(0,255,0,1);color:black;'],
			"5" :	[5,"eWorkNotReady","WORKNOTREADY","업무 미준비"			,'background-color:rgba(220,220,220,1);color:black;'],
			"6" :	[6,"eWorkReady","WORKREADY","업무준비"							,'background-color:rgba(51,255,255,1);color:black'],
			"7" :	[7,"eBusyOther","BUSYOTHER","다른일중"							,'background-color:rgba(70,70,70,1);color:white;'],
			"8" :	[8,"eReserved","RESERVED","후처리"									,'background-color:rgba(0,102,0,1);color:white;'],
			"9" :	[9,"eUnknown","UNKNOWN","알수없음"									,'background-color:rgba(0,51,51,1);color:white;'],
			"10" :[9,"eHold","HOLD","보류"														,'background-color:rgba(240,240,240,1);color:black;'],
			// 상세 이석
			"301"	:	[301,"working","WORKING","업무"										,'background-color:rgba(51,255,255,1);color:black;'],
			"302" :	[302,"conference","CONFERENCE","회의"							,'background-color:rgba(102,51,0,1);color:white;'],
			"303" :	[303,"mealing","MEALING","식사"										,'background-color:rgba(204,000,000,1);color:white;'],
			"304" :	[304,"out","OUT","외출"														,'background-color:rgba(153,102,00,1);color:white;'],
			"305" :	[305,"breaking","BREAKING","휴식"									,'background-color:rgba(255,153,100,1);color:black;'],
			"306" :	[306,"edu","EDU","교육"														,'background-color:rgba(255,204,051,1);color:black;']
		},
		
		
		agentStateType2 : {
			"LOGOUT" 	:	[1,"eLogout","LOGOUT","로그아웃"						,'background-color:rgb(120,120,120);color:white;'],
			"AVAIL" 	:	[3,"eAvailable","AVAIL","대기"								,'background-color:rgb(255,255,0);color:black;'],
			"TALKIN" 	:	[4,"eTalking","TALKIN","통화중"							,'background:rgb(0,255,0);color:black;'],
			"TALKOUT" :	[4,"eTalking","TALKOUT","통화중"						,'background:rgb(0,255,0);color:black;'],
			"WRAPUP" 	:	[8,"eReserved","WRAPUP","후처리"						,'background-color:rgb(0,102,0);color:white;'],
			"HOLDIN" 	:	[9,"eHold","HOLDIN","보류"										,'background-color:rgb(240,240,240);color:black;'],
			"HOLDOUT" :	[9,"eHold","HOLDOUY","보류"									,'background-color:rgb(240,240,240);color:black;'],

			// 상세 이석
			"NR301"	:	[301,"working","WORKING","업무"										,'background-color:rgb(51,255,255);color:black;'],
			"NR302" :	[302,"conference","CONFERENCE","회의"							,'background-color:rgb(102,51,0);color:white;'],
			"NR303" :	[303,"mealing","MEALING","식사"										,'background-color:rgb(204,000,000);color:white;'],
			"NR304" :	[304,"out","OUT","외출"														,'background-color:rgb(153,102,00);color:white;'],
			"NR305" :	[305,"breaking","BREAKING","휴식"									,'background-color:rgb(255,153,100);color:black;'],
			"NR306" :	[306,"edu","EDU","교육"														,'background-color:rgb(255,204,051);color:black;']
		},

		//더미 데이타를 생성하기 위한 임시 스킬그룹ID,스킬그룹 넘버, 스킬그룹 한글 이름, 스킬그룹 영문이름
		sgNames : [
			["1000", "1000", "reception",   "수신"],
			["1001", "1001", "credit",   		"여신"],
			["1002", "1002", "card", 				"카드"],
			["1003", "1003", "exchange",		"외환"],
			["1004", "1004", "retire",			"퇴직연금&방카"],
			["1005", "1005", "BPR",					"BPR"],
			["1006", "1006", "unit",				"단말"],
			["1007", "1007", "network",			"통신"],
			["1008", "1008", "security",	  "보안"],
			["1009", "1009", "automation",	"자동화"]
		]

	},
	
	groupPieChartList : [], 
	agentStatusHBarChart : "",
	agentStatusDonutChart :"",
	groupStatusBarChart: "",
	agentCallBarChart : "",
	agentCallHBarChart : "",
	
	queryTimer : null,
	
	ocxMode : "product",
	queryMode :  "product",
	stateLastingUpdateTimer : null,
	config : {
		storageSupport : localStorage ? true : false,
		tmpObj : {
			sData:{},
			pieChartData : []
		},
		
		log : {common : 1, event : 2, func :3},
		color : {
			pieChart : { 
				login : 'rgb(0,102,0)', 
				avail :'rgb(255,255,0)' , 
				leaveSeat : 'rgb(251,51,0)', 
				talkin : 'rgb(0,255,0)'
			},
			groupStatsBarChart : {
				backgroundColor : [
					'rgba(255,255,0, 0.4)',
			    'rgba(0,255,0, 0.4)',
			    'rgba(255,153,100, 0.4)',
			    'rgba(51,255,255, 0.4)',
			    'rgba(102,51,0, 0.4)',
			    'rgba(204,000,000, 0.4)',
			    'rgba(153,102,00, 0.4)',
			    'rgba(255,204,051, 0.4)'
				],
				borderColor : [
					'rgba(180,180,0, 1)',
				  'rgba(0,255,0, 1)',
				  'rgba(255,153,100, 1)',
				  'rgba(51,255,255, 1)',
				  'rgba(102,51,0, 1)',
				  'rgba(204,000,000, 1)',
				  'rgba(153,102,00, 1)',
				  'rgba(255,204,051, 1)'
				]
			}
		},
		
		ocXEventHandlers : [
			["getEventOnAgentList(SrtnString)",					"MONITOR.getEventOnAgentList(SrtnString);"],
			["getEventOnAgentStateChange(SrtnString))",	"MONITOR.getEventOnAgentStateChange(SrtnString)"],
			["getEventOnAgentStateSummary(SrtnString)", "MONITOR.getEventOnAgentStateSummary(SrtnString)"],
			["getEventOnGroupStateSummary(SrtnString)", "MONITOR.getEventOnGroupStateSummary(SrtnString);"],
			["getEventOnCallQueued(SrtnString)",				"MONITOR.getEventOnCallQueued(SrtnString);"]
			
		],
		serverInfo : {
			hostA : "172.30.5.59" , 
			portA : "9999" , 
			hostB : "172.17.5.59", 
			portB: "9999"
		},
		chart : {
			minSize : 0,
			maxSize : 60
		},
		stateLastingInterval : 2000,
		queryIntervalTime : 3000,
		ocxId : 'monitorOCX',
		
		/*
		 * 스킬그룹 소팅을 위한 가중치값으로 현재는 임시 설정
		 * 실제 운영시에는 아래 스킬 그룹의 아이디를 실제 코드값으로 변경해야 함 
		*/
		skillGroupSort : {
			"1000" : 1,	
			"1001" : 2,	
			"1002" : 3,	
			"1003" : 4,	
			"1004" : 5,	
			"1005" : 6,	
			"1006" : 7,	
			"1007" : 8,	
			"1008" : 9,	
			"1009" : 10
			}
	},
	
	/*상수정보*/
	CONSTANTS : {
		AGENTLIST 		: "AGENTLIST",
		STORAGE_KEY_STATE_DATAS 	: "stateDatas",
		STORAGE_KEY_STATE_CONFIG   : "stateConfig",
		
		ON 	: "on",
		OFF : "off"
		
	},
   
	init : function(){
		var params = getUrlParams();
		this.queryMode =  params.queryMode ? params.queryMode : "product";
		this.ocxMode = this.isOCXExisted() ? "product" : "test";
		this.initProgram();
	},

	
	initProgram : function(){
		
		this.initObject();  
		this.addEventHandler();
		
		if (this.ocxMode == "product") {
			var agents = this.loadData(this.CONSTANTS.AGENTLIST);
			if (agents) {
				this.agentList = JSON.Parse(agents);
				this.initView();
			}else {
				openLoadingProgress("&nbsp;Monitor 서버 연결 및 초기화중 ....","");
				var bConnect = this.ctiosConnect(
						this.config.serverInfo.hostA,this.config.serverInfo.portA,
						this.config.serverInfo.hostB,this.config.serverInfo.portB
				);
				closeLoadingProgress();
				
				if (!bConnect) {
					document.getElementsByTagName('body')[0].innerHTML = "";
					openMessageWindow("&nbsp;&nbsp;monitorOCX 서버 연결 실패", "서버에 연결중 에러가 발생했습니다");
					return;
				}
				
				//호출시 중복 연결문제 발생 , getEventOnAgentList 이벤트를 통해 리스트를 받는 것으로 변경
				//this.ctiosAgentList();  
				
				//이벤트 등록은 jsp 파일에서 직접 등록
				//this.addEventHandler(); 
				
			}
		}else if(this.ocxMode == "test") {
			var context = this;
			openLoadingProgress("&nbsp;데이타 로딩 및 초기화중....","");
			setTimeout(function(){
				//가상의 패킷을 생성하여, 이벤트 함수 호출
				var pack = context.createAgentListDummy()
				context.getEventOnAgentList(pack);
				
				/*
				 * 아래의 초기화 함수는 getEventOnAgentList 함수에서 호출됨
				 * 아래의 함수는 초기 AgentList 수신한 직후 호출되어야 함 
				context.parseAgentListPacket(pack);
				context.groupAgentList();
				context.extractSkillGroup(); // 에이전트 리스트로 부터 1차 스킬 그룹 추출
				context.sortSkillGroup();    // 추출된 1차 스킬 그룹으로 부터 소팅된 스킬 그룹 배열 생성
				context.initObject();
				context.initView();          // 뷰 초기화 
				*/
				
				var pack2 = context.createDummyCallQueued();
				context.getEventOnCallQueued(pack2);
				
				context.createDummyAgentStateChange();
				
				var pack3 = context.createAgentStateSummary();
				context.getEventOnAgentStateSummary(pack3);

				var pack4 = context.createGroupStateSummary();
				context.getEventOnGroupStateSummary(pack4);
				
				closeLoadingProgress();
				context.startChartUpdateTimer();
				
			},100);
		}else {
			document.getElementsByTagName('body')[0].innerHTML = "";
			openMessageWindow("&nbsp;&nbsp;초기화 오류", "초기화 실패");
			return;
		}
	},
	
	addEventHandler : function (){
		var context = this;
		$(window).on("beforeunload", function(){
			if (context.ocxMode != "test") {
				context.ctiosDisconnect();
				//log(">>> monitorOCX disconnect !!")
			}
		});
	},
	
	startChartUpdateTimer : function(){
		var context = this;
		
		//getEventOnAgentStateChange Timer
		setInterval(function(){
			context.createDummyAgentStateChange();
		},2000);
		
		//getEventOnCallQueued Timer
		setInterval(function(){
			var pack1 = context.createDummyCallQueued();
			context.getEventOnCallQueued(pack1);
		},3000);
		
		//getEventAgentStateSummary Timer
		setInterval(function(){
			var pack2 = context.createAgentStateSummary();
			context.getEventOnAgentStateSummary(pack2);
			
			var pack3 = context.createGroupStateSummary();
			context.getEventOnGroupStateSummary(pack3);
		},2500);
	},
	
	IsInstalledOCX : function(progId) {
		 try {
	     //var myobj = new ActiveXObject("MyObject.axMyObject.1.0"); // COM 객체의 ProgID(프로그램아이디)
	     var myobj = new ActiveXObject(progId); // COM 객체의 ProgID(프로그램아이디)
	     if (myobj != null) return true;
	     else return false;
	   } catch(e) {
	     return false;
	   }
		},
		
	isOCXExisted : function(){
			this.monitorOCX = document.getElementById(this.config.ocxId);
			if (this.monitorOCX) {
				return true;
			}else {
				return false;
			}
			//log(">> ocx Run Mode : " + this.ocxMode,1);
		},
	
	ctiosConnect : function(hostA, portA, hostB, portB){
		log("### OCX 서버 연결 시작",12);
		log("",12);
		var result = this.monitorOCX.ctiosConnect(hostA, portA, hostB, portB);
		if (result == 1) {
			log("### OCX 서버[" + this.config.serverInfo.hostA + "] 연결 성공",12);
			log("",12);
			return true;
		}else if (result == -1){
			log("### OCX 서버[" + this.config.serverInfo.hostA + "] 연결 실패",12);
			log("",12);
			return false;
		}
	},
	
	ctiosDisconnect : function(){
		log("### OCX 서버[" + this.config.serverInfo.hostA + "] 연결 끊음",12);
		this.monitorOCX.ctiosDisconnect();
	},
	
	ctiosAgentList : function(){
		log("### ctiosAgentList  AgentList 요청",12);
		var agentListPacket = this.monitorOCX.ctiosAgentList();
		this.getEventOnAgentList(agentListPacket);
	},
	
	updateStateLastingTime : function (){
		var agentStateGrid = this.element.agentStateGrid;
		var agents = agentStateGrid.datagrid('getRows');
		var agentsLength = agents.length;
		var curUnixTime = unixTime();
		var elems = $('.datagrid-cell-c5-readableLastingTime');
		for (var i = 0; i < agents.length; i++){
			agents[i].readableLastingTime = humanReadableTime(Math.floor((curUnixTime - str2int(agents[i].lastingTime,0)) / 1000)); 
			
			//아래의 구문은 해당 Row 전체를 업데이트함 
			//agentStateGrid.datagrid("refreshRow", i);
			
			/* 해당 로우의 상태시간 셀 내용만 변경 */
			$(elems[i+1]).html(agents[i].readableLastingTime);
		}
	},
	
	getEventOnAgentList : function(packet) {
		log("### [EVENT] getEventOnAgentList CALLED ",12);
		log(packet,12);
		log("### [EVENT] getEventOnAgentList  END",12);
		log("",12);
		
		var nStart = new Date().getTime();      
		this.parseAgentListPacket(packet);
		this.initLogTracking();
		this.sortAgentList();
		this.groupAgentList();    
		this.extractSkillGroup(); 
		this.sortSkillGroup();
		this.sortSkillGroupWeightName();
		var nEnd = new Date().getTime();      
		console.log("> 데이타 생성 및 구조화 시간 : "  + (nEnd - nStart) + " ms");
		
		nStart = new Date().getTime();      
		this.initObject();      
		this.initView();  
		nEnd = new Date().getTime();      //시작시간 체크(단위 ms)
		console.log("> 뷰 초기화 시간: "  + (nEnd - nStart) + " ms");
		
		/*상태시간 업데이트 타이머가 존재하면 제거*/  
		if (this.stateLastingUpdateTimer) {
			setTimeout(this.stateLastingUpdateTimer);
			this.stateLastingUpdateTimer = null;
		}
		
		/*상태시간 업데이트 타이머 생성*/  
		
		var context = this;
		this.stateLastingUpdateTimer = setInterval(function(){
			 context.updateStateLastingTime();
		}, this.config.stateLastingInterval);
		
	},
	
	getEventOnAgentStateChange : function(packet) {
		log("### [EVENT] getEventOnAgentStateChange CALLED ",12);
		log(packet,12);
		log("### [EVENT] getEventOnAgentStateChange END ",12);
		log("",12);
		var agent = this.parseAgentStateChangePacket(packet);
		if (agent) {
			this.updateAgentStatusGrid(agent);  //변경사항 
		}
	},
	
	getEventOnGroupStateSummary : function(packet){
		log("### [EVENT] getEventOnGroupStateSummary CALLED ",12);
		log(packet,12);
		log("### [EVENT] getEventOnGroupStateSummary END",12);
		log("",12);
		this.parseGroupStateSummaryPacket(packet);
		this.updateGroupStateSummary();
		
	},
	
	getEventOnCallQueued : function(packet){
		log("### [EVENT] getEventOnCallQueued CALLED",12);
		log(packet,12);
		log("### [EVENT] getEventOnCallQueued END",12);
		log("",12);
		this.parseCallQueuedPacket(packet);
		this.updateCallQueuedGrid();
	},
	
	getEventOnAgentStateSummary : function(packet) {
		log("### [EVENT] getEventOnAgentStateSummary CALLED ",12);
		log(packet,12);
		log("### [EVENT] getEventOnAgentStateSummary END",12);
		log("",12);
		this.parseAgentStateSummaryPacket(packet);
		this.updateAgentStateSummary();
	},
	
	ctiosQueryAgent : function(agentId) {
		log("### ctiosQueryAgent call",12);
		log("",12);
		var result = this.monitorOCX.ctiosQueryAgent(agentId);
	},
	
	ctiosForceLogout : function(agentId) {
		log("### ctiosForceLogout " + agentId + " 강제 로그아웃 요청",12);
		log("",12);
		this.monitorOCX.ctiosForceLogout(agentId);
	},
	
  initObject : function(){
  	
  	var groupStateSummary = this.dataSource.groupStateSummary;
  	var sortedSkillGroups =  this.dataSource.sortedSkillGroups;
		var agentStateSummary = this.dataSource.agentStateSummary;
		
		agentStateSummary.sgname = "[전체]"
		agentStateSummary.total = 0;
		agentStateSummary.logout= 0;
		agentStateSummary.avail = 0;
		agentStateSummary.talkin = 0;
		agentStateSummary.talkout = 0;
		agentStateSummary.wrapup = 0;
		agentStateSummary.holdin= 0;
		agentStateSummary.holdout = 0;
		
		agentStateSummary.working = 0;
		agentStateSummary.conference= 0;
		agentStateSummary.mealing = 0;
		agentStateSummary.out = 0;
		agentStateSummary.breaking = 0;
		agentStateSummary.edu = 0;
		
  	for (var i = 0; i < sortedSkillGroups.length ; i++) {
  		if (typeof groupStateSummary[sortedSkillGroups[i].sgId] == "undefined") {
				groupStateSummary[sortedSkillGroups[i].sgId] = {
						sgid : sortedSkillGroups[i].sgId,
						sgnumber : sortedSkillGroups[i].sgNumber,
						sgengname : sortedSkillGroups[i].sgEngName,
						sgkorname : sortedSkillGroups[i].sgKorName,
						total : 0,
						logout : 0,
						avail : 0,
						talkin  : 0,
						talkout : 0,
						wrapup : 0,
						holdIn : 0,
						holdout : 0,
						working  : 0,
						conference : 0,
						mealing : 0,
						out  : 0,
						breaking  : 0,
						edu : 0
					}
			}
  	}
  	
  	this.element.leftTab = $('#left_tab').tabs();
  	
  	/* HTML element*/
  	this.element.agentSummaryLogin = $("#agentStatsSummary_login");
  	this.element.agentSummaryAvail = $("#agentStatsSummary_avail");
  	this.element.agentSummaryCall = $("#agentStatsSummary_call");
  	this.element.agentSummaryLeaveSeat = $("#agentStatsSummary_left_seat");
  	
  	this.element.groupSummarylLogin = $("#group_summary_panel_login");
  	this.element.groupSummarylAvail = $("#group_summary_panel_avail");
  	this.element.groupSummarylCalling = $("#group_summary_panel_calling");
  	this.element.groupSummaryWrapup = $("#group_summary_panel_wrapup");
  	this.element.groupSummarylBreaking = $("#group_summary_panel_breaking");
  	this.element.groupSummarylWorking = $("#group_summary_panel_working");
  	this.element.groupSummarylMeeting = $("#group_summary_panel_meeting");
  	this.element.groupSummarylMear = $("#group_summary_panel_mear");
  	this.element.groupSummarylOut = $("#group_summary_panel_out");
  	this.element.groupSummarylEdu = $("#group_summary_panel_edu");
  	
  	this.element.totalCallCount = $('.totalCallCount');
  	this.element.totalInCallCount = $('.totalInCallCount');
  	this.element.totalOutCallCount = $('.totalOutCallCount');
  	this.element.totalTrnsCallCount = $('.totalTrnsCallCount');
  	this.element.totalRonaCallCount = $('.totalRonaCallCount');
  	this.element.totalCnfrCallCount = $('.totalCnfrCallCount');
  	
  	this.element.groupStatsPanel = $('#groupStatsPanel');
  },
  
	getNameFromCode : function(agentState, responsCode) {
		var obj = agentState == "2" || agentState == 2 ?  
				this.protocol.agentStateType[responsCode] : this.protocol.agentStateType[agentState];
		var name = obj[3];
		return name;
	},
	
	initLogTracking : function(){
		var agentStateConfig;
		var localData;
		var agentList = this.dataSource.agentList;
		
		for (var i = 0; i < agentList.length; i++){
			agentStateConfig = this.loadData(agentList[i].agentId + "_state_config");
			if (!agentStateConfig){
				agentStateConfig = {
					tracking : "off",
					alert : "off",
					agentId : agentList[i].agentId
				};
				this.saveData(agentList[i].agentId + "_state_config", JSON.stringify(agentStateConfig));
				agentStateConfig = null;
				//log(">> Local Storage ",7);
				//log(JSON.parse(this.loadData(agentList[i].agentId + "_state_config")),7);
			}
		}
	},
	
	groupAgentList : function(){
		var agentList = this.dataSource.agentList;
		var groupedAgentList = this.dataSource.groupedAgentList;
		var agent;
		
		for (var i = 0; i < agentList.length; i++){
			agent = agentList[i];
			if (typeof groupedAgentList[agent.sgId] === "undefined") {
				groupedAgentList[agent.sgId] = [];
			}
			groupedAgentList[agent.sgId].push(agent);
		}
	},
	
	extractSkillGroup : function() {
		this.dataSource.skillGroups = {};
		var agentList = this.dataSource.agentList;
		var agent;
		
		for (var i = 0; i < agentList.length; i++){
			agent = agentList[i];
			this.dataSource.skillGroups[agent.sgId] = { 
					sgId:agent.sgId, 
					sgNumber: agent.sgNumber ,
					sgEngName:agent.sgEngName, 
					sgKorName:agent.sgKorName 
				};
		}
	},
	
	/* 영문 스킬그룹 이름으로 스킬그릅 sort 가중치 오브젝트 생성 
	 * CallQueued packet 정렬을 위해 생성
	 * key : 스킬 그룹 영문이름, 한글이름 , value : 가중치 
	 */
	sortSkillGroupWeightName : function(){
		this.config.sortWeightName = {};
		var sortedSkillGroups =  this.dataSource.sortedSkillGroups;
		for (var i = 0; i < sortedSkillGroups.length; i ++ ){
			var value = i + 1;
			this.config.sortWeightName[sortedSkillGroups[i].sgEngName] = value;
			this.config.sortWeightName[sortedSkillGroups[i].sgKorName] = value;
		}
	},
	
	sortAgentList : function(){
		var agentList =  this.dataSource.agentList;
		agentList.sort(function(s1, s2){
			return s1.agentName < s2.agentName? -1 : s1.agentName > s2.agentName ? 1 : 0; 
		});
	},
	
	sortSkillGroup : function(){
		var skillGroupSort = this.config.skillGroupSort;
		this.dataSource.sortedSkillGroups = [];
		
		for (var skillGroupName in this.dataSource.skillGroups) {
			if (this.dataSource.skillGroups.hasOwnProperty(skillGroupName)){
				this.dataSource.sortedSkillGroups.push(this.dataSource.skillGroups[skillGroupName]);
			}
		}
		this.dataSource.sortedSkillGroups.sort(function(g1, g2){
			return skillGroupSort[g1.sgId] < skillGroupSort[g2.sgId] ? -1 : skillGroupSort[g1.sgId] > skillGroupSort[g2.sgId] ? 1 : 0; 
		});
	},
	
	parseAgentListPacket : function(packet) {
		this.dataSource.agentList.lenght = 0;
		var agent;
		
		var packetArr = packet.split("|");
		for (var i = 0; i < packetArr.length ; i++) {
			agent = this.makeAgentFromAgentPacket(packetArr[i]);
			if (agent) this.dataSource.agentList.push(agent);
		}
		
		/*
		 * 상담원 수로 차트 사이즈 조정
		 * 10단위로 맞춘후, 라벨표시를 위하여 20 증가 
		 */
		//this.config.chart.maxSize = n = Math.ceil(this.dataSource.agentList.length/10) * 10 + 20; 
		this.config.chart.maxSize = 200
	},
	
	parseAgentListPacket2 : function(packet){
		var nStart = new Date().getTime();      //시작시간 체크(단위 ms)
		/* 관련 변수 초기화 */
		this.dataSource.agentList.length = 0;
		this.dataSource.skillGroups = {};
		this.dataSource.sortedSkillGroups.length = 0;
		this.dataSource.groupedAgentList = {};
		
		
		var agent;
		/* 전역 변수의 지역 참조 선언*/
		var agentList =  this.dataSource.agentList;
		var skillGroups = this.dataSource.skillGroups;
		var sortedSkillGroups = this.dataSource.sortedSkillGroups;
		var groupedAgentList = this.dataSource.groupedAgentList;
		var skillGroupSort = this.config.skillGroupSort;
		var groupStateSummary = this.dataSource.groupStateSummary;
		
		var packetArr = packet.split("|");
		for (var i = 0; i < packetArr.length ; i++) {
			
			agent = this.makeAgentFromAgentPacket(packetArr[i]);
			if (agent) {
				this.dataSource.agentList.push(agent);
				/*스킬 그룹 추출*/
				if (typeof skillGroups[agent.sgId] === "undefined"){
					var skillData = { 
							sgId:agent.sgId, 
							sgNumber: agent.sgNumber , 
							sgEngName:agent.sgEngName, 
							sgKorName:agent.sgKorName 
					};
					skillGroups[agent.sgId] = skillData;
					sortedSkillGroups.push(skillData); 
				}
				
				/*스킬그룹별 GroupStateSummary 기본 객체 생성*/
				if (typeof groupStateSummary[agent.sgId] == "undefined") {
					groupStateSummary[agent.sgId] = {
							sgid : agent.sgId,
							sgnumber : agent.sgNumber,
							sgengname : agent.sgEngName,
							sgkorname : agent.sgKorName,
							total : 0,
							logout : 0,
							avail : 0,
							talkin  : 0,
							talkout : 0,
							wrapup : 0,
							holdIn : 0,
							holdout : 0,
		
							working  : 0,
							conference : 0,
							mealing : 0,
							out  : 0,
							breaking  : 0,
							edu : 0
						}
				}
				
				/* 각 스킬그룹별로 상담원을 데이타 그리드에 뿌려주기 위해 상담 그룹별로 상담원을 그룹핑 */	
				if (typeof groupedAgentList[agent.sgId] === "undefined") {
					groupedAgentList[agent.sgId] = [];
				}
				groupedAgentList[agent.sgId].push(agent);
			}
		}
		
		/*상담원 리스트를 한글 이름 오름차순으로 정렬*/
		agentList.sort(function(s1, s2){
			return s1.agentName < s2.agentName? -1 : s1.agentName > s2.agentName ? 1 : 0; 
		});

		
		/* 추출한 스킬 그룹을 스킬 그룹 가중치에 따라 정렬*/
		sortedSkillGroups.sort(function(g1, g2){
			return skillGroupSort[g1.sgId] < skillGroupSort[g2.sgId] ? -1 : skillGroupSort[g1.sgId] > skillGroupSort[g2.sgId] ? 1 : 0; 
		});
		
		/* 영문 스킬그룹 이름으로 스킬그릅 sort 가중치 오브젝트 생성 
		 * CallQueued packet 정렬을 위해 생성
		 * key : 스킬 그룹 영문이름, 한글이름 , value : 가중치 
		 */
		this.config.sortWeightName = {};
		for (var i = 0; i < sortedSkillGroups.length; i ++ ){
			var value = i + 1;
			this.config.sortWeightName[sortedSkillGroups[i].sgEngName] = value;
			this.config.sortWeightName[sortedSkillGroups[i].sgKorName] = value;
		}
		
		/* 상담원 수로 차트 사이즈 조정 */
		//this.config.chart.maxSize = this.dataSource.agentList.length
		this.config.chart.maxSize = 200;
		
		var nEnd =  new Date().getTime();      //종료시간 체크(단위 ms)
		console.log("### parseAgentListPacket 함수 실행 시간 : 상담원 수 --> " + this.dataSource.agentList.length);
		console.log((nEnd - nStart) + " ms");
		
	},
	
	
	
	//변경사항 
	makeAgentFromAgentPacket : function(packet) {
		var packetUit = packet.split("^");
		if (packetUit[6].indexOf('/') > 0 || packetUit[6].length == 0 || packetUit[6] == ''){
			console.log("### 잘못된 상담원 정보[스킬 그룹에러] : " + packetUit[6]);
			console.log(packet);
			console.log("");
			return null;
		}
		
		var agent = {};
		agent.agentId  = packetUit[0];
		agent.extn = packetUit[1];
		agent.agentState = null2str(packetUit[2] , "1"); // agentState 값이 없을 경우 logout으로 설정
		agent.responseCode = packetUit[3];
		agent.callDir = packetUit[4];
		agent.lastingTime = packetUit[5];
		
		// 그리드에 표시하기 위한 시간 문자열
		agent.readableLastingTime = humanReadableTime(Math.floor((unixTime(new Date()) - str2int(packetUit[5],0)) / 1000)); 
		//agent.readableLastingTime = humanReadableTime(unixTime(new Date()) - str2int(packetUit[5],0)); 
		agent.sgId = packetUit[6];
		agent.sgNumber = packetUit[7];
		agent.sgEngName = packetUit[8];
		agent.sgKorName = packetUit[9];
		agent.teamId = packetUit[10];
		agent.teamEngName = packetUit[11];
		agent.teamKorName = packetUit[12];
		agent.agentName = packetUit[13];
		agent.position = packetUit[14];
		agent.stateType = packetUit[15];
	  
		//agent State 와 이석코드에 따른 최종 상담원 상태 코드값
		agent.stateTypeCode = agent.agentState != "2" ? agent.agentState : agent.responseCode;
		//agent State 와 이석코드에 따른 최종 상담원 한글 상태명
		agent.stateTypeKor  =  this.getNameFromCode(agent.agentState , agent.responseCode);
		return agent;
	},
	
	parseAgentStateChangePacket : function(packet) {
		var packetUit = packet.split("^"),
				isSearchAgent = false,
				searchAgentIndex = -1,
				targetAgent,
				agentStateConfig,
				agentLocalStateData,
				context = this;
		
		for (var i = 0; i < this.dataSource.agentList.length ; i++){
			if (this.dataSource.agentList[i].agentId == packetUit[0]) {
				searchAgentIndex = i;
				isSearchAgent = true;
				break;
			}
		}
		
		if (isSearchAgent == true) {
			targetAgent = this.dataSource.agentList[i];
			targetAgent.agentId  = packetUit[0];
			targetAgent.extn = packetUit[1];
			targetAgent.agentState =  null2str(packetUit[2] , "1"); // agentState 값이 없을 경우 logout으로 설정
			targetAgent.responseCode = packetUit[3];
			targetAgent.callDir = packetUit[4];
			targetAgent.lastingTime = packetUit[5];
			
			// 그리드에 표시하기 위한 시간 문자열
			targetAgent.readableLastingTime = humanReadableTime(Math.floor((unixTime(new Date()) - str2int(packetUit[5],0)) / 1000)); 
			//targetAgent.readableLastingTime = humanReadableTime(str2int(packetUit[5],0)); 
			targetAgent.sgId = packetUit[6];
			targetAgent.sgNumber = packetUit[7];
			targetAgent.sgEngName = packetUit[8];
			targetAgent.sgKorName = packetUit[9];
			targetAgent.teamId = packetUit[10];
			targetAgent.teamEngName = packetUit[11];
			targetAgent.teamKorName = packetUit[12];
			targetAgent.agentName = packetUit[13];
			targetAgent.position = packetUit[14];
			targetAgent.stateType = packetUit[14];
			
			//agent State 와 이석코드에 따른 최종 상담원 상태 코드값
			targetAgent.stateTypeCode = targetAgent.agentState != "2" ? targetAgent.agentState : targetAgent.responseCode;
			//agent State 와 이석코드에 따른 최종 상담원 한글 상태명
			targetAgent.stateTypeKor  =  this.getNameFromCode(targetAgent.agentState , targetAgent.responseCode);
			
			//트랙킹 코드 
			agentStateConfig= this.loadData(targetAgent.agentId + "_state_config");
			if (agentStateConfig) {
				agentStateConfig = JSON.parse(agentStateConfig);
				if (agentStateConfig.alert == "on") {
					setTimeout(function(){
						showMessage(targetAgent.agentName + ' 상태 변경', "상태 : " + targetAgent.stateTypeKor);
					},10)
				}
				
				if (agentStateConfig.tracking == "on") {
					agentLocalStateData = JSON.parse(this.loadData(targetAgent.agentId + "_state_logs"));
					if (!agentLocalStateData) agentLocalStateData = [];
					agentLocalStateData.push(targetAgent);
					setTimeout(function(){
						context.saveData(targetAgent.agentId + "_state_logs", JSON.stringify(agentLocalStateData));
					},10)
				}
			} 
		}else {
			log("#### [parseAgentStateChangePacket] 존재하지 않는 AgentID : " + packetUit[0]);
		}
		
		return targetAgent;
	},

	parseCallQueuedPacket : function(packet) {
		this.dataSource.callQueuedStats.length = 0;
		var packet,data,
				packetArr = packet.split("|");
		
		for (var i = 0; i < packetArr.length ; i++) {
			packet = packetArr[i].split("^");
			if (packet.length != 4) continue;
 			this.dataSource.callQueuedStats.push({
 				serviceEngName : packet[0],
 				serviceKorName : packet[1],
 				waitClientCount : packet[2],
 				longestWaitTime : packet[3],
 				humanLongestWaitTime : humanReadableTime(str2int(packet[3],0)) 
			});
		}
		var callQueuedStats = this.dataSource.callQueuedStats;
		var sortWeightName = this.config.sortWeightName;
		
		callQueuedStats.sort(function(g1, g2){
			return sortWeightName[g1.serviceKorName] < sortWeightName[g2.serviceKorName] ? 
					-1 : sortWeightName[g1.serviceKorName] > sortWeightName[g2.serviceKorName] ? 1 : 0; 
		});

	},
	
	parseAgentStateSummaryPacket : function (packet) {
		
		var packArr = packet.split('^');
		var agentStateSummary = this.dataSource.agentStateSummary;
		//if (packArr.length != 14) return;
		
		agentStateSummary.sgname = "[전체]"
		agentStateSummary.total = str2int(packArr[0]);
		agentStateSummary.logout= str2int(packArr[1]);
		agentStateSummary.avail = str2int(packArr[2]);
		agentStateSummary.talkin = str2int(packArr[3]);
		agentStateSummary.talkout = str2int(packArr[4]);
		agentStateSummary.wrapup = str2int(packArr[5]);
		agentStateSummary.holdin= str2int(packArr[6]);
		agentStateSummary.holdout = str2int(packArr[7]);
		
		agentStateSummary.working = str2int(packArr[8]);
		agentStateSummary.conference= str2int(packArr[9]);
		agentStateSummary.mealing = str2int(packArr[10]);
		agentStateSummary.out = str2int(packArr[11]);
		agentStateSummary.breaking = str2int(packArr[12]);
		agentStateSummary.edu = str2int(packArr[13]);
	},
	
	parseGroupStateSummaryPacket : function (packet) {
		log("#### parseGroupStateSummaryPacket  호출됨",12 );
		var groupStateSummary = this.dataSource.groupStateSummary;
		var packArr = packet.split('|');
		var pack;
		var targetGroup;
		
		//그룹별 stateSummary 갱신
		for (var i = 0; i < packArr.length ; i++){
			 pack = packArr[i].split("^");
			 targetGroup =  groupStateSummary[pack[0]];
			 if (!targetGroup) {
				 console.log("### [parseGroupStateSummaryPacket]" + pack[0] + ":" +  pack[2] + ":" +  pack[2] + "존재하지 않는 그룹의 GroupStateSummary ");
				 continue;
			 }
			 targetGroup.sgid = pack[0];
			 targetGroup.sgnumber = pack[1];
			 targetGroup.sgengname = pack[2];
			 targetGroup.sgkorname = pack[3];
			 
			 //agentStateSummary 의 내용과 동일
			 targetGroup.total = str2int(pack[4]);
			 targetGroup.logout = str2int(pack[5]);
			 targetGroup.avail = str2int( pack[6]);
			 targetGroup.talkin = str2int(pack[7]);
			 targetGroup.talkout = str2int(pack[8]);
			 targetGroup.wrapup = str2int(pack[9]);
			 targetGroup.holdIn = str2int(pack[10]);
			 targetGroup.holdout = str2int(pack[11]);
			 
			 targetGroup.working = str2int(pack[12]);
			 targetGroup.conference = str2int(pack[13]);
			 targetGroup.mealing = str2int(pack[14]);
			 targetGroup.out = str2int(pack[15]);
			 targetGroup.breaking = str2int(pack[16]);
			 targetGroup.edu = str2int(pack[17]);
		}
	},
	
	initView : function(){
		this.initTab();
		this.initDataGrid();
		this.initChart();
		this.appInfo.isViewInit = true; 
	},
	
	initTab : function (){
		this.initLeftTab();
		this.initRightTab();
	},
	
	initLeftTab : function (){
		var context = this;
		var sortedSkillGroups = this.dataSource.sortedSkillGroups;
	  var sortedSkillGroupLen = sortedSkillGroups.length;
	  
	  //Add Skill Group tab 
	  this.element.leftTab = $('#left_tab').tabs({
			onSelect : function(title, index){
				
				if (context.appInfo.isViewInit == false) return;
				var selectedGridId, sgId,sgEngName, sgKorName, sgNumber;
				var tabInfo = context.dataSource.skillGroups;
				if (title == "전체") {
					selectedGridId = "all_grid"
					sgId = "all";
					sgEngName = "all";
					sgKorName = "전체";
					sgNumber = "-1";
				}else {
					for (var property in tabInfo){
						if (tabInfo.hasOwnProperty(property)) {
							if (tabInfo[property].sgKorName === title) {
								sgId = property;
								sgEngName = tabInfo[property].sgEngName;
								sgKorName = tabInfo[property].sgKorName;
								sgNumber = tabInfo[property].sgNumber;
								selectedGridId = property + "_grid"; 
							}
						}
					}
				}
				
				//현재 선택된 탭 정보 갱신 
				var selectedLeftTab = context.appInfo.selectedLeftTab;
				selectedLeftTab.title = title;
				selectedLeftTab.index = index;
				selectedLeftTab.gridId = selectedGridId;
				selectedLeftTab.agents = title == "전체" ? context.dataSource.agentList : context.dataSource.groupedAgentList[sgId];
				selectedLeftTab.sgId = sgId;
				selectedLeftTab.sgEngName = sgEngName;
				selectedLeftTab.sgKorName = sgKorName;
				selectedLeftTab.sgNumber = sgNumber;
			
				
				/* 탭 전환과 관련된 화면 처리 
				 * 탭의 빠른 전환을 위해서 timer로 처리 
				 * */
				setTimeout(function(){
					
					/* 선택된 스킬그룹에 의하여 DataGrid Filtering*/
					context.element.agentStateGrid.datagrid('removeFilterRule','teamKorName');
					if (selectedLeftTab.title != "전체" ) {
						context.element.agentStateGrid.datagrid('addFilterRule', {
							field: 'teamKorName',
							op: 'equal',
							value :selectedLeftTab.sgKorName
						});
					}
					context.element.agentStateGrid.datagrid('doFilter');
					
					/* 
					 * 탭이 변경되었을 경우 해당 탭의 상태 시간 갱신
					 * 해당 그리드의 필터링 작업이 끝났을 때 호출해야 함 
					 */
					context.updateStateLastingTime();
					
					if (context.appInfo.selectedRightTab.title === "상담원 상태 현황"){
						context.element.groupStatsPanel.panel({ title : "전체 현황  [" + title +"]" });
						context.updateAgentStateSummary();
						context.updateGroupStateSummary();
						
						/*
						 * 선택한 탭이 all 이 아닐 경우, 파이차트 1개만 남기고 다 hide
						 * */
						if (context.appInfo.selectedLeftTab.sgId != "all") {
							for (var j = 0; j <context.dataSource.sortedSkillGroups.length;j++) {
								if (j != 0) {
									$('#group_pie_'+(j+1)).hide();
								}
							}
						}else {
							for (var j = 0; j <context.dataSource.sortedSkillGroups.length;j++) {
									$('#group_pie_'+(j+1)).show();
							}
						}
					}
					
					//탭이 변경되었을 때 현재 선택된 오른쪽 탭이 상담원 통화 현황 이라면 즉시 쿼리 시작 
					if (context.appInfo.selectedRightTab.title === "상담원 통화 현황"){
						context.query();
					}
				},5);
			}
	  });
	  
	  //스킬그룹 탭 추가 
	  for (var i = 0 ; i < sortedSkillGroupLen ; i++ ) {
	  	this.element.leftTab.tabs('add',{
	      title:sortedSkillGroups[i].sgKorName,
	      //content:"<table class='agentStatusGrid' id = '" + sortedSkillGroups[i].sgId + "_grid" + "'  style='display:block;width:100%;'></table>",
	      closable:false,
	      selected: false
		  });
		}

	},
	
	addSkillGroupTab : function(){
		var sortedSkillGroups = this.dataSource.sortedSkillGroups;
	  var sortedSkillGroupLen = sortedSkillGroups.length;
	  
		for (var i = 0 ; i < sortedSkillGroupLen ; i++ ) {
			this.element.leftTab.tabs('add',{
				title:sortedSkillGroups[i].sgKorName,
				content:"<table class='agentStatusGrid' id = '" + sortedSkillGroups[i].sgId + "_grid" + "'  style='display:block;width:100%;'></table>",
				closable:false,
				selected: false
			});
		}
	},

	
	//변경사항
	initRightTab : function(){
		var context = this;
		this.element.rightTab = $('#right_tab').tabs({
			onSelect : function(title, index){
				//Right tab 갱신
				context.appInfo.selectedRightTab.title = title; 
				context.appInfo.selectedRightTab.index = index; 

				if (context.appInfo.selectedRightTab.title === "상담원 상태 현황") {
					if (context.queryTimer) {
						clearInterval(context.queryTimer);
					}
					context.queryTimer = null;
					setTimeout(function(){
						context.updateAgentStateSummary();
						context.updateGroupStateSummary();
					},10);
					
				}else if (context.appInfo.selectedRightTab.title === "상담원 통화 현황"){
					context.initAgentCallStatusGrid();
					if (context.queryTimer) {
						clearInterval(content.queryTimer);
						content.queryTimer = null;
					}
					context.query("intial Query")
					context.queryTimer = setInterval(function(){
						context.query();
					},context.config.queryIntervalTime);
				}
			}
		});
		this.element.rightTab.tabs("select",0);
	},

	initDataGrid : function(){
		this.initCallQueuedGrid();
		this.initAgentStatusGrid();
		this.initGroupStatusGrid();
		this.initAgentCallStatusGrid();
	},
	
	initAgentStatusGrid : function (){
		var context = this;
		this.element.agentStateGrid = $('.agentStatusGrid').datagrid();
		this.element.agentStateGrid.datagrid({
			rownumbers:true,
			width:465,
			singleSelect:true,
			collapsible:true,
			fitColumns:true,
			//title : "그룹별 현황",
			border:true,
			onRowContextMenu : function (e, index, row){
				e.preventDefault();
			  	$(this).datagrid("selectRow", index);
			  	cmenu = $('<div/>').appendTo('body');
			  	cmenu.menu({
			  		onClick : function(item){
			  			var id = item.memberInfo.agentId;
			  			var name = item.memberInfo.agentName;
			  			var agentConfig;
			  			switch(item.action){
			  			case "force_logout":
			  				openMessageDlg("강제 로그아웃",name + " ["+ id+ "] " + "  사용자를 강제 로그아웃합니다",
			  						(function(agentId){
			  							return function() {
			  								MONITOR.ctiosForceLogout(agentId);
			  							}
			  						})(id));
			  				break;
			  			
			  			case "list_tracking":
			  				console.log("List Tracking");
			  				if ($('#'+  row.agentName + "_" + row.agentId + "_window").length > 0) return;
			  				var gridData = context.loadData(item.memberInfo.agentId + "_state_config");
			  				if (gridData) {
			  					gridData = JSON.parse(gridData);
			  				}else {
			  					gridData = [];
			  				}
			  				console.log(gridData);
			  				messageWindow({
			  					title : row.agentName + " 상태 리스트",
			  					content : "",
			  					width : 600,
			  					height : 312,
			  					modal: false,
			  					gridData : gridData,
			  					gridId : row.agentName + '_' + row.agentId + '_state_log_grid', 
			  					content : '<table id = "'+ row.agentName + '_' + row.agentId + '_state_log_grid' +'" style="width:100%;height:100%" > </table>',
			  					windowId : row.agentName + "_" + row.agentId + "_window"
			  				});
			  				break;
			  			
			  			case "stop_tracking":
			  				agentConfig = JSON.parse(context.loadData(item.memberInfo.agentId + "_state_config"));
			  				agentConfig.tracking = "off";
			  				context.saveData(row.agentId + "_state_config", JSON.stringify(agentConfig));
			  				break;
			  			
			  			case "start_tracking":
			  				agentConfig = JSON.parse(context.loadData(item.memberInfo.agentId + "_state_config"));
			  				agentConfig.tracking = "on";
			  				context.saveData(row.agentId + "_state_config", JSON.stringify(agentConfig));
			  				break;
			  			
			  			case "start_alert":
			  				agentConfig = JSON.parse(context.loadData(item.memberInfo.agentId + "_state_config"));
			  				agentConfig.alert = "on";
			  				context.saveData(row.agentId + "_state_config", JSON.stringify(agentConfig));
			  				break;
			  			
			  			case "stop_alert":
			  				agentConfig = JSON.parse(context.loadData(item.memberInfo.agentId + "_state_config"));
			  				agentConfig.alert = "off";
			  				context.saveData(row.agentId + "_state_config", JSON.stringify(agentConfig));
			  				break;
			  			}
			  		}
			  	});
			  	
			  	var fields = ["상태 로그 보기"];
			   	var elNames = ["list_tracking"];
			  	var mClasses = ["icon-ok"];
			  	
			  	var agentConfig = context.loadData(row.agentId + "_state_config"); 
			  	
			  	if (agentConfig) {
			  		agentConfig = JSON.parse(agentConfig);
			  	}
			  	if (agentConfig) {
			  		if (agentConfig.tracking == "on"){
			  			fields.push("상태 추적 중지");
			  			elNames.push("stop_tracking");
					  	mClasses.push("icon-no");
			  		}else {
			  			fields.push("상태 추적 시작");
			  			elNames.push("start_tracking");
					  	mClasses.push("icon-ok");
			  		}
			  		
			  		if (agentConfig.alert == "on"){
			  			fields.push("알림메세지 중지");
			  			elNames.push("stop_alert");
					  	mClasses.push("icon-no");
			  		}else {
			  			fields.push("알림메세지 시작");
			  			elNames.push("start_alert");
					  	mClasses.push("icon-ok");
			  		}
			  	}
			  	
			  	if (row.agentState != "1") {
			  		fields.push( row.agentName +" 로그아웃");
			  		elNames.push("force_logout");
			  		mClasses.push("icon-remove");
			  	}

			  	for(var i=0; i<fields.length; i++){
			  		cmenu.menu('appendItem', {
			  			memberInfo : row,
			  			text: fields[i],
			  			name: elNames[i],
			  			action: elNames[i],
			  			iconCls: mClasses[i]
			  		});
			  	}

			  	cmenu.menu('show', {
			  		left:e.pageX,
			  		top:e.pageY
			  	});
			},
		    columns:[[
		        {field:'agentName',title:'상담원명',width:130,align:'left'},
		        {field:'stateTypeKor',title:'현재상태',width:120,align:'left',styler:cellStyler},
		        {field:'readableLastingTime',title:'상태시간',width:120,align:'center',
		        	styler: function(value,row,index){
		    				//if (value < 20){
		    					return 'font-weight:bold;';
		    				//}
		    			}
		        },
		        
		        {field:'extn',title:'내선번호',width:100,align:'right'},
		        {field:'teamKorName',title:'팀구분',width:100,align:'left'},
		        {field:'agentId',title:'Agent ID',width:120,align:'right'}
		    ]],
		    data :  this.dataSource.agentList
		});
		this.element.agentStateGrid.datagrid('enableFilter');
		//this.element.agentStateGrid.datagrid('destroyFilter');
		this.element.agentStateGrid.datagrid('removeFilterRule');
		$(".datagrid-filter-row").hide();

		/*
		 * Left Tab의 각 스킬그룹별 AgentState 그리드를 초기데이타로 초기화 
		
		var groupAgentList = this.dataSource.groupedAgentList;
		for (var sgId in groupAgentList){
			$('#' + sgId + "_grid").datagrid({
				 data : groupAgentList[sgId] 
			});
		}
		*/
	},
	
	
	initCallQueuedGrid : function (){
		this.element.callQueuedGrid = $('#callQueuedGird').datagrid();
		this.element.callQueuedGrid.datagrid({
			rownumbers:true,
			singleSelect:true,
			border : true,
			collapsible:false,
			fitColumns:true,
			//title : "그룹별 현황",
		  columns:[[
		        {field:'serviceKorName',title:'스킬 그룹',width:200,align:'left'},
		        {field:'waitClientCount',title:'대기콜 수',width:100,align:'right'},
		        {field:'humanLongestWaitTime',title:'최장 대기 시간',width:100,align:'right'}
		    ]],
		    data : []
		});
	},
	
	//교육 컬럼 추가 
	initGroupStatusGrid : function(){
		this.element.groupStateGrid = $('#groupStatusGrid').datagrid();
		this.element.groupStateGrid.datagrid({
			rownumbers:true,
			singleSelect:true,
			collapsible:false,
			fitColumns:true,
			//title : "전체 현황[단말]",
			border:false,
		    columns:[[
		        {field:'teamNameKor',title:'팀구분',width:200,align:'center'},
		        {field:'login',title:'로그인',width:100,align:'center'},
		        {field:'avail',title:'대기',width:100,align:'center'},
		        {field:'talkin',title:'통화중',width:100,align:'center'},
		        {field:'wrapup',title:'후처리',width:100,align:'center'},
		        {field:'breaking',title:'휴식',width:100,align:'center'},
		        {field:'working',title:'업무',width:100,align:'center'},
		        {field:'conference',title:'회의',width:100,align:'center'},
		        {field:'meal',title:'식사',width:100,align:'center'},
		        {field:'out',title:'외출',width:100,align:'center'},
		        {field:'edu',title:'교육',width:100,align:'center'}
		    ]],
		    data : []
		});
	},
	
	initAgentCallStatusGrid : function(){
		this.element.agentCallStateGrid =  $('#agentCallStatusGrid').datagrid();
		this.element.agentCallStateGrid.datagrid({
			rownumbers:true,
			singleSelect:true,
			collapsible:false,
			fitColumns:true,
			//title : "전체 현황",
			border:false,
		    columns:[[
		        {field:'agentName',title:'상담원명',width:100,align:'center'},
		        {field:'skillGroupKorName',title:'팀구분',width:170,align:'center'},
		        {field:'totalCall',title:'전체 상담콜',width:100,align:'center'},
		        {field:'inCall',title:'응대콜',width:100,align:'center'},
		        {field:'outCall',title:'발신콜',width:100,align:'center'},
		        {field:'trnsCall',title:'호전환',width:100,align:'center'},
		        {field:'cnfrCall',title:'3자통화',width:100,align:'center'},
		        {field:'ronaCall',title:'No 응대콜',width:100,align:'center'}
		    ]]
		    //data :  []
		});
	},
	
	initChart: function(){
		var ctx_agentStatusHBarChart = document.getElementById("agentStatusHBarChart");
		this.agentStatusHBarChart = new Chart(ctx_agentStatusHBarChart, {
		    type: 'horizontalBar',
		    data: {
		        labels: ['로그인','대기','이석','통화중'],
		        datasets: [{
		        	  //data: [0,0,0,0],
		            backgroundColor: [
		            	this.config.color.pieChart.login,
		            	this.config.color.pieChart.avail,
		            	this.config.color.pieChart.leaveSeat,
		            	this.config.color.pieChart.talkin
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	animation:{
		    		duration: 0,
		    		onComplete : function(){
		    			var ctx = this.chart.ctx;
		    			var defaultFontColor =   this.chart.config.options.defaultFontColor;

		    			ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
		    			ctx.fillStyle = this.chart.config.options.defaultFontColor;
		    			ctx.textAlign = 'center';
		    			ctx.textBaseline = 'bottom';
		    			ctx.font = "bold 10pt Courier";
		    			this.data.datasets.forEach(function (dataset) {
		    				for (var i = 0; i < dataset.data.length; i++) {
		    					//라벨별 텍스트 색상 조절 
		    					switch(i){
		    					case 0: ctx.fillStyle = "black";break;
		    					case 1: ctx.fillStyle = "black";break;
		    					case 2: ctx.fillStyle = "black";break;
		    					case 3: ctx.fillStyle = "black";break;
		    					}
		    					var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
		    					ctx.fillText(dataset.data[i], model.x+13, model.y+7);
		    				}
		    			});
		    		}
		    	},
		    	legend: {
		    		verticalAlignment: "bottom",
		    		horizontalAlignment: "center",
		    		display:false,

		    	},
		    	responsive: false,
		    	scales: {
		    		yAxes: [{
		    			barPercentage: 0.7,
		    			ticks: {
		    				beginAtZero:true
		    			}
		    		}],
		    		xAxes: [{
		    			barPercentage: 0.5, 
		    			ticks: {
		    				min : this.config.chart.minSize,
		    				max : this.config.chart.maxSize,
		    				beginAtZero: true   // minimum value will be 0.
		    			}
		    		}]
		    	}
		    }
		});
		
		var ctx_agentStatusDonutChart = document.getElementById("agentStatusDonutChart");
		this.agentStatusDonutChart = new Chart(ctx_agentStatusDonutChart, {
			type:"doughnut",
		    
			data: {
		        labels: ['로그인','대기','이석','통화중'],
		        datasets: [{
		            label: '',
		            data: [0,0,0,0],
		            backgroundColor: [
		            	this.config.color.pieChart.login,
		            	this.config.color.pieChart.avail,
		            	this.config.color.pieChart.leaveSeat,
		            	this.config.color.pieChart.talkin
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	animation:{
            duration: 0
		    	},
		    	legend: {
	                display: true,
	                position: 'right',
	            },
		    	responsive: false,
		    }
		});
		
		var ctx_groupStatusBarChart = document.getElementById("groupStatusBarChart");
		this.groupStatusBarChart = new Chart(ctx_groupStatusBarChart , {
		    type: 'bar',
		    data: {
		        labels: ["대기", "통화", "휴식", "업무", "회의", "식사", "외출", "교육"],
		        datasets: [{
		            label: '',
		            data: [0, 0, 0, 0, 0, 0,0,0],
		            backgroundColor: this.config.color.groupStatsBarChart.backgroundColor,
		            borderColor: this.config.color.groupStatsBarChart.borderColor,
		            borderWidth: 1
		        }]
		    },
		    
		    options: {
		    	animation:{
		      duration: 0,
		      onComplete : function(){
		      	var ctx = this.chart.ctx;
		          ctx.font = Chart.helpers.fontString(
		          		Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
		          ctx.fillStyle = this.chart.config.options.defaultFontColor;
		          ctx.textAlign = 'center';
		          ctx.textBaseline = 'bottom';
		          ctx.font = "bold 10pt Courier";
		          this.data.datasets.forEach(function (dataset) {
		              for (var i = 0; i < dataset.data.length; i++) {
		                  var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
		                  
		                  ctx.fillText(dataset.data[i], model.x, model.y);
		              }
		          });
		        }
		      },
		    	legend: {
		    	    //verticalAlignment: "center",
		    	    //horizontalAlignment: "center",
		    	    position: 'right',
		    		display:false,
		    		fullWidth : true
		        },
		        
		    	responsive: false,
		        scales: {
		            yAxes: [{
		            	ticks: {
		            		min : this.config.chart.minSize,
		            		max : this.config.chart.maxSize,
		                    beginAtZero: true   // minimum value will be 0.
		                }
		            }],
		            xAxes: [{ barPercentage: 0.5 }]
		        }
		    }
		});
		
		//등록된 스킬 그룹별로 파이 차트 엘리먼트 추가 
		var sortedSkillGroups = this.dataSource.sortedSkillGroups;
		var groupPieChartContainer = $("#group_pie_chart");
		for (var i = 0; i < sortedSkillGroups.length ; i++){
			
			//수정사항 : 각 파이 차트의 크기, 보더, 배경색 변경 
			var html = 
				'<div style="float:left;width:164px;height:170px;padding:0px;margin-left:4px;margin-top:3px;background-color:#F2F2F2;border :1px solid #DDDDDD ">'+
					'<canvas id="' + 'group_pie_' +  (i+1) +'" style ="width:160px;height:150px" > [No canvas support] </canvas>'+
				'</div>';
			groupPieChartContainer.append(html);
		}
		groupPieChartContainer.css("height", (Math.ceil(sortedSkillGroups.length / 4) * 150) + 'px');
		
		//그룹별 파이차트 엘리먼트에 대한  대한 차트 초기화 
		var groupPieChartConfig = {
				type:"doughnut",
			
				data: {
		        labels: ['로그인','대기','이석','통화중'],
		        datasets: [{
		            label: '',
		            data: [0,0,0],
		            backgroundColor: [
		            	this.config.color.pieChart.login,
		            	this.config.color.pieChart.avail,
		            	this.config.color.pieChart.leaveSeat,
		            	this.config.color.pieChart.talkin
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		     // title: {
		       // display: true,
		        //text: 'Chart'
		      //},
		    	
		    	animation:{
            duration: 0
		    	},
		    	legend: {
	                display: false,
	                position: 'right',
	            },
		    	responsive: false,
		        
		    }
		};
		
		for (var i = 0 ; i < sortedSkillGroups.length ; i++) {
			var ctx = document.getElementById("group_pie_" + (i+1));
			this.groupPieChartList[i] = new Chart(ctx, groupPieChartConfig );
		}
		
		var ctx_agentCallBarChart = document.getElementById("agentCallBarChart");
		this.agentCallBarChart = new Chart(ctx_agentCallBarChart, {
		    type: 'bar',
		    
		    data: {
		    	 labels: ['전체상담콜','발신콜','전환','3자통화','No 응대콜'],
		        datasets: [{
		            label: '',
		            //data: [4,4,4,4,4],
		            backgroundColor: [
		              'rgba(255, 99, 132, 0.2)',
		              'rgba(54, 162, 235, 0.2)',
		              'rgba(255, 206, 86, 0.2)',
		              'rgba(75, 192, 192, 0.2)',
		              'rgba(153, 102, 255, 0.2)',
		            ],
		            borderColor: [
		              'rgba(255,99,132,1)',
		              'rgba(54, 162, 235, 1)',
		              'rgba(255, 206, 86, 1)',
		              'rgba(75, 192, 192, 1)',
		              'rgba(153, 102, 255, 1)',
		               
		            ],
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	animation:{
		      duration: 0,
		      onComplete : function(){
		      	var ctx = this.chart.ctx;
		          ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
		          ctx.fillStyle = this.chart.config.options.defaultFontColor;
		          ctx.textAlign = 'center';
		          ctx.textBaseline = 'bottom';
		          ctx.font = "bold 10pt Courier";
		          this.data.datasets.forEach(function (dataset) {
		          	for (var i = 0; i < dataset.data.length; i++) {
		          		var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
		              ctx.fillText(dataset.data[i], model.x, model.y);
		            }
		          });
		        }
		      },
		    	legend: {
		    		verticalAlignment: "bottom",
		    	  horizontalAlignment: "center",
		    		display:false,
		      },
		    	responsive: false,
		        scales: {
		        	yAxes: [{
		          	ticks: {
		          		min : this.config.chart.minSize,
	            		max : this.config.chart.maxSize,
		              beginAtZero: true   // minimum value will be 0.
		            }
		          }],
		          xAxes: [{ barPercentage: 0.5 }]
		       }
		    }
		});
		
		var ctx_agentCallHBarChart = document.getElementById("agentCallHBarChart");
		this.agentCallHBarChart = new Chart(ctx_agentCallHBarChart, {
		    type: 'horizontalBar',
		    data: {
		        labels: ['포기콜','전환','응대콜','전체상담콜'],
		        datasets: [{
		        	label: '',
		          //data: [3,13,15,10],
		          backgroundColor: ['rgb(0,229,229)','rgb(0,200,200)','rgb(0,153,153)','rgb(0,117,117)'],
		          borderWidth: 1
		      }]
		    },
		    options: {
		    	animation:{
		      duration: 0,
		      onComplete : function(){
		      	var ctx = this.chart.ctx;
		          ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
		          ctx.fillStyle = this.chart.config.options.defaultFontColor;
		          ctx.textAlign = 'center';
		          ctx.textBaseline = 'bottom';
		          ctx.font = "bold 10pt Courier";
		          this.data.datasets.forEach(function (dataset) {
		          for (var i = 0; i < dataset.data.length; i++) {
		          	var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
		          	ctx.fillText(dataset.data[i], model.x+10, model.y+7);
		          }
		          });
		            }
		        },
		    	legend: {
		    		verticalAlignment: "bottom",
		    	  horizontalAlignment: "center",
		    		display:false,
		      },
		    	responsive: false,
		        scales: {
		        yAxes: [{ barPercentage: 0.7, }],
		        xAxes: [{ barPercentage: 0.5 , ticks: {
		        	min : this.config.chart.minSize,
          		max : this.config.chart.maxSize,
	                beginAtZero: true   // minimum value will be 0.
	            }}]
		        }
		     }
		});
	},
	
	//2017-3-15 서버 쿼리 및 구조 변경으로 수정 
	query : function(message){
		var context = this;
		var reqParam = {q : new Date().toString(),queryMode : this.queryMode};
		if ( context.appInfo.selectedLeftTab.title !="전체") {
			reqParam.skillGroupKorName = context.appInfo.selectedLeftTab.title 
		}
		
		$.getJSON(
		"monitorInfo",reqParam ,
			function(result){
				context.updateRightTab2(result);
			}
		);
	},
	
	updateRightTab2 : function(data){
		
		//this.agentCallBarChart.options.scales.yAxes[0].ticks.min = data.totalSummaryMin;
		this.agentCallBarChart.options.scales.yAxes[0].ticks.min = 0;
		this.agentCallBarChart.options.scales.yAxes[0].ticks.max = data.totalSummaryMax;
		this.agentCallBarChart.data.datasets[0].data  = [
			data.totalSummary.totalCallCount,
			data.totalSummary.totalOutCallCount,
			data.totalSummary.totalTrnsCallCount,
			data.totalSummary.totalCnfrCallCount,
			data.totalSummary.totalRonaCallCount
		];
		this.agentCallBarChart.update();
		
		this.element.totalCallCount.eq(0).text(data.totalSummary.totalCallCount);
  	this.element.totalInCallCount.eq(0).text(data.totalSummary.totalInCallCount);
  	this.element.totalOutCallCount.eq(0).text(data.totalSummary.totalOutCallCount);
  	this.element.totalTrnsCallCount.eq(0).text(data.totalSummary.totalTrnsCallCount);
  	this.element.totalRonaCallCount.eq(0).text(data.totalSummary.totalRonaCallCount);
  	this.element.totalCnfrCallCount.eq(0).text(data.totalSummary.totalCnfrCallCount); 
  	
  	this.element.agentCallStateGrid.datagrid({ data : data.monitorInfoList });
  	
  	//현재 선택된 탭에 따라 차트에 표시할 데이타 선택
  	var bData = this.appInfo.selectedLeftTab == "전체" ? data.totalSummary : data.groupSummary; 
  
  	this.element.totalCallCount.eq(1).text(bData.totalCallCount);
  	this.element.totalInCallCount.eq(1).text(bData.totalInCallCount);
  	this.element.totalOutCallCount.eq(1).text(bData.totalOutCallCount);
  	this.element.totalTrnsCallCount.eq(1).text(bData.totalTrnsCallCount);
  	this.element.totalRonaCallCount.eq(1).text(bData.totalRonaCallCount);
  	this.element.totalCnfrCallCount.eq(1).text(bData.totalCnfrCallCount); 
  	
  	//this.agentCallHBarChart.options.scales.xAxes[0].ticks.min = data.totalSummaryMin;
  	this.agentCallHBarChart.options.scales.xAxes[0].ticks.min = 0;
		this.agentCallHBarChart.options.scales.xAxes[0].ticks.max = this.appInfo.selectedLeftTab.title == "전체" ? 
				data.totalSummaryMax: data.groupSummaryMax;
		
		this.agentCallHBarChart.data.datasets[0].data  = [
			bData.totalAbnCallCount,
			bData.totalTrnsCallCount,
			bData.totalInCallCount,
			bData.totalCallCount
			];
		this.agentCallHBarChart.update();
	},
	
	updateCallQueuedGrid : function (){
		this.element.callQueuedGrid.datagrid({ 
			data : this.dataSource.callQueuedStats 
		});
	},
	
	findIndexByAgentId : function(searchSource, id){
		var index = -1
		for (var i = 0 ; searchSource.length ; i++ ){
			if (searchSource[i].agentId == id) {
				index = i;
				break;
			}
		}
		return index;
	},
	
	updateAgentStatusGrid : function(agent){
		var tabInfo = this.dataSource.skillGroups,
				selectedLeftTab = this.appInfo.selectedLeftTab,
				searchSource = this.dataSource.agentList,targetRowIndex = -1,targetAgent;
		
		var curGridAgents = this.element.agentStateGrid.datagrid('getRows');
		for (var i = 0; i < curGridAgents.length; i++) {
			if (curGridAgents[i].agentId == agent.agentId) {
				targetRowIndex = i;
				targetAgent = curGridAgents[i];
				break;
			}
		}
		var selectedRowAgent = this.element.agentStateGrid.datagrid('getSelected');
		if (targetRowIndex != -1 ){ 
			this.element.agentStateGrid.datagrid("refreshRow",targetRowIndex);
			if (selectedRowAgent  && selectedRowAgent.agentId ==  targetAgent.agentId) 
				this.element.agentStateGrid.datagrid("selectRow", targetRowIndex);
			
		}
	},
		
	updateAgentStateSummary : function(){
		var loginCount,
				availCount,
				leaveSeatCount,
				talkCount;
		
		if (this.appInfo.selectedRightTab.index != 0) return; 
		
		var summary = this.dataSource.agentStateSummary;
		if (summary) {
			loginCount = summary.total - summary.logout;
			availCount = summary.avail;
			leaveSeatCount = 
				summary.working + summary.conference + 
				summary.mealing + summary.out + 
				summary.breaking + summary.edu;
			talkCount = summary.talkin + summary.talkout;
			
			this.element.agentSummaryLogin.text(loginCount);
	  	this.element.agentSummaryAvail.text(availCount);
	  	this.element.agentSummaryCall.text(talkCount );
	  	this.element.agentSummaryLeaveSeat.text(leaveSeatCount);
			
			this.agentStatusHBarChart.data.datasets[0].data  = [
				loginCount,
				availCount,
				leaveSeatCount,
				talkCount
			];
			this.agentStatusHBarChart.update();
			
			this.agentStatusDonutChart.data.datasets[0].data  = [
				loginCount,
				availCount,
				leaveSeatCount,
				talkCount
			];
			this.agentStatusDonutChart.update();
		}
	},
	
	updateGroupStateSummary : function(){
		if (this.appInfo.selectedRightTab.index != 0) return; 
		
		var gridDataArr = [],
				dataArr,
				groupTotalData;
				agentStateSummary = this.dataSource.agentStateSummary,
				selectedLeftTab = this.appInfo.selectedLeftTab;
		
		groupTotalData = {
				teamNameKor : agentStateSummary.sgname ,
				login:agentStateSummary.total - agentStateSummary.logout,
				avail : agentStateSummary.avail ,
				talkin : agentStateSummary.talkin + agentStateSummary.talkout,
				wrapup:agentStateSummary.wrapup,
				breaking:agentStateSummary.breaking, 
				working:agentStateSummary.working, 
				conference: agentStateSummary.conference, 
				meal:agentStateSummary.mealing, 
				out:agentStateSummary.out, 	
				edu:agentStateSummary.edu //교육 컬럼 데이타 추가 
		};
		gridDataArr.push(groupTotalData);
		
		var groupData;
		if (selectedLeftTab.sgId != "all") {
			group = this.dataSource.groupStateSummary[selectedLeftTab.sgId];
			if (!group) {
				group = this.dataSource.groupStateSummary[selectedLeftTab.sgKorName];
			}
			if (group) {
				groupData = {
						teamNameKor : group.sgkorname ,
						login:group.total - group.logout,
						avail : group.avail ,
						talkin : group.talkin + group.talkout,
						wrapup:group.wrapup,
						breaking:group.breaking, 
						working:group.working, 
						conference: group.conference, 
						meal:group.mealing, 
						out:group.out,
						edu:group.edu // 교육 컬럼 데이타 추가  	
				};
				gridDataArr.push(groupData)
			}
		}
		this.element.groupStateGrid.datagrid({ data : gridDataArr });
		
		var stData = this.config.tmpObj.sData;
		if (selectedLeftTab.sgId == "all") {
			stData.login = agentStateSummary.total - agentStateSummary.logout;
			stData.avail = agentStateSummary.avail;
			stData.talk = agentStateSummary.talkin + agentStateSummary.talkout;
			stData.wrapup = agentStateSummary.wrapup;
			stData.breaking = agentStateSummary.breaking;
			stData.working = agentStateSummary.working;
			stData.conference = agentStateSummary.conference;
			stData.meal = agentStateSummary.mealing;
			stData.out = agentStateSummary.out;
			stData.edu = agentStateSummary.edu;

		}else {
			if (group){
				stData.login = group.total - group.logout
				stData.avail = group.avail;
				stData.talk = group.talkin + group.talkout;
				stData.wrapup = group.wrapup;
				stData.breaking = group.breaking;
				stData.working = group.working;
				stData.conference = group.conference;
				stData.meal = group.mealing;
				stData.out = group.out;
				stData.edu = group.edu;
			}
		}
		
		this.element.groupSummarylLogin.text(stData.login);  
  	this.element.groupSummarylAvail.text(stData.avail);  
  	this.element.groupSummarylCalling.text(stData.talk);  
  	this.element.groupSummaryWrapup.text(stData.wrapup);  
  	this.element.groupSummarylBreaking.text(stData.breaking); 
  	this.element.groupSummarylWorking.text(stData.working);  
  	this.element.groupSummarylMeeting.text(stData.conference);  
  	this.element.groupSummarylMear.text(stData.meal);  
  	this.element.groupSummarylOut.text(stData.out); 
  	this.element.groupSummarylEdu.text(stData.edu); 
				
		this.groupStatusBarChart.data.datasets[0].data  = [
			stData.avail,
			stData.talk,
			stData.breaking,
			stData.working,
			stData.conference,
			stData.meal,
			stData.out,
			stData.edu
			];
		this.groupStatusBarChart.update();
		
		var pieChartData = [];
		var pieChartTitles = [];
		
		var sortedSkillGroups = this.dataSource.sortedSkillGroups;
		var groupStateSummary = this.dataSource.groupStateSummary;
		var target,sgId, sgKorName;
		
		if (selectedLeftTab.sgId == "all") {
			for(var i = 0; i <  sortedSkillGroups.length; i++ ){
				sgId = sortedSkillGroups[i].sgId;
				sgKorName = sortedSkillGroups[i].sgKorName
				target = groupStateSummary[sgId] ? groupStateSummary[sgId] : groupStateSummary[sgKorName];
				//console.log("타켓 그룹 아이디 : " + sgId + " : " + sgKorName);
				//console.log("타켓 오브젝트");
				//console.log(target);
				pieChartData.push({
					login: target.total - target.logout,
					avail : target.avail,
					leaveSeat :	target.working + target.conference + target.mealing + target.out + target.breaking + target.edu, 
					talk :	target.talkin + target.talkout // 파이차트에서 통화중 추가 
					
				});
				pieChartTitles.push(sgKorName);
			}
		}else {
			target = groupStateSummary[selectedLeftTab.sgId] ? 
					groupStateSummary[selectedLeftTab.sgId] : groupStateSummary[selectedLeftTab.sgKorName];
			sgKorName = selectedLeftTab.sgKorName;
			pieChartData.push({
				login: target.total - target.logout,
				avail : target.avail,
				leaveSeat :	target.working + target.conference + target.mealing + target.out + target.breaking + target.edu, 
				talk :	target.talkin + target.talkout // 파이차트에서 통화중 추가 
			});
			pieChartTitles.push(sgKorName);
		}
		
		for (var i = 0; i < pieChartData.length; i++){
			this.groupPieChartList[i].options.title.display = true;
			this.groupPieChartList[i].options.title.text = pieChartTitles[i];
			
			this.groupPieChartList[i].data.datasets[0].data = [
				pieChartData[i].login,
				pieChartData[i].avail,
				pieChartData[i].leaveSeat,
				pieChartData[i].talk  // 파이차트에서 통화중 추가 
			];
			this.groupPieChartList[i].update();
		}
	},
	
	saveData : function(key, value){
		if (window.localStorage) window.localStorage.setItem(key, value)
	},
	
	loadData : function(key){
		if (window.localStorage)	return window.localStorage.getItem(key);
	},
	
	clearData : function(){
		if (window.localStorage)	window.localStorage.clear();
	},
	
	removeData : function(key){
		if (window.localStorage)	window.localStorage.removeItem(key);
	}
};