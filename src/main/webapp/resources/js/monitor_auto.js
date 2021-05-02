/**
 * 
 */
MONITOR.createAgentListDummy  = function(){
	var agentInfos = [];
	var agentInfo = null;
	
	for (var i = 0; i <20; i++){
		agentInfo = [];
		agentInfo.push("910000" + i);  //agentId
		agentInfo.push(Math.floor(Math.random() * 1000) + 1);  //Extn
		
		var agentState = randomRange(0,10);
		agentInfo.push(agentState)//StateType;
		
		//agentState 가 이석상태일 경우 상세 이석 코드 생성
		var responseCode = agentState == 2 ? randomRange(301,306).toString() : "";
		agentInfo.push(responseCode)//ResponseCode; 
		agentInfo.push("IN");  //콜방향
		agentInfo.push(unixTime() - (randomRange(10000, 20000)));  //지속시간
				
		var sGroup = this.protocol.sgNames[randomRange(0,9)];
		//스킬그룹ID,스킬그룹 넘버,  스킬그룹 영문이름,스킬그룹 한글 이름,
		agentInfo.push(sGroup[0])  //SG_ID
		agentInfo.push(sGroup[1])  //SG_NUMBER
		agentInfo.push(sGroup[2]); //SG_EngName
		agentInfo.push(sGroup[3]); //SG_KorName
		
		agentInfo.push(randomRange(3000,4000).toString());  //team_id
		agentInfo.push(sGroup[2]); //TEAM_EngName
		agentInfo.push(sGroup[3]); //TEAM_KorName
		agentInfo.push("name_" + (i+1)); //agent name
		agentInfo.push("Y"); //직책 구분
		agentInfo.push(agentState); //STATE_TYPE
		
		agentInfos.push(agentInfo.join('^'));
	}
	
	//잘못된 패킷 : 스킬그룹 관련 필드가 공백인 경우 
	var invalidAgentInfo1 = [];
	i = i +1;
	
	invalidAgentInfo1.push("910000" + i);  //agentId
	invalidAgentInfo1.push(Math.floor(Math.random() * 1000) + 1);  //Extn
	
	var agentState = randomRange(0,10);
	invalidAgentInfo1.push(agentState)//StateType;
	
	//agentState 가 이석상태일 경우 상세 이석 코드 생성
	var responseCode = agentState == 2 ? randomRange(301,306).toString() : "";
	invalidAgentInfo1.push(responseCode)//ResponseCode;
	invalidAgentInfo1.push("IN");  //콜방향
	invalidAgentInfo1.push(randomRange(10,100).toString());  //지속시간

	invalidAgentInfo1.push('')  //SG_ID
	invalidAgentInfo1.push('')  //SG_NUMBER
	invalidAgentInfo1.push(''); //SG_EngName
	invalidAgentInfo1.push(''); //SG_KorName
	
	invalidAgentInfo1.push(randomRange(3000,4000).toString());  //team_id
	invalidAgentInfo1.push(sGroup[2]); //TEAM_EngName
	invalidAgentInfo1.push(sGroup[3]); //TEAM_KorName
	invalidAgentInfo1.push("name_" + (i+1)); //agent name
	invalidAgentInfo1.push("Y"); //직책 구분
	invalidAgentInfo1.push(agentState); //STATE_TYPE
	
	agentInfos.push(invalidAgentInfo1.join('^'));
	

//잘못된 패킷 : 스킬 그룹 ID 가 여러개 인 경우 
	var invalidAgentInfo2 = [];
	i = i +1;
	invalidAgentInfo2.push("910000" + i);  //agentId
	invalidAgentInfo2.push(Math.floor(Math.random() * 1000) + 1);  //Extn
	
	var agentState = randomRange(0,10);
	invalidAgentInfo2.push(agentState)//StateType;
	
	//agentState 가 이석상태일 경우 상세 이석 코드 생성
	var responseCode = agentState == 2 ? randomRange(301,306).toString() : "";
	invalidAgentInfo2.push(responseCode)//ResponseCode;
	invalidAgentInfo2.push("IN");  //콜방향
	invalidAgentInfo2.push(randomRange(10,100).toString());  //지속시간

	invalidAgentInfo2.push(this.protocol.sgNames[0][0] + "/" + this.protocol.sgNames[1][0]);  //SG_ID
	invalidAgentInfo2.push(this.protocol.sgNames[0][0] + "/" + this.protocol.sgNames[1][0]);  //SG_NUMBER
	invalidAgentInfo2.push(this.protocol.sgNames[0][2] + "/" + this.protocol.sgNames[1][2]); //SG_EngName
	invalidAgentInfo2.push(this.protocol.sgNames[0][3] + "/" + this.protocol.sgNames[1][3]); //SG_KorName
	
	invalidAgentInfo2.push(randomRange(3000,4000).toString());  //team_id
	invalidAgentInfo2.push(sGroup[2]); //TEAM_EngName
	invalidAgentInfo2.push(sGroup[3]); //TEAM_KorName
	invalidAgentInfo2.push("name_" + (i+1)); //agent name
	invalidAgentInfo2.push("Y"); //직책 구분
	invalidAgentInfo2.push(agentState); //STATE_TYPE
	
	agentInfos.push(invalidAgentInfo2.join('^'));
	
	
	var pack = agentInfos.join('|');
	return pack;
};

MONITOR.createAgentStateSummary = function(){
	var agentStatsSummary = [];
	agentStatsSummary.push(randomRange(100,200)); //전체 인원 	index 0
	agentStatsSummary.push(randomRange(30,50));  //로그아웃 		index 1
	agentStatsSummary.push(randomRange(30,50));  //대기 				index 2
	agentStatsSummary.push(randomRange(30,50));  //통화(I) 			index 3
	agentStatsSummary.push(randomRange(30,50));  //통화(O)			index 4
	agentStatsSummary.push(randomRange(30,50));  //후처리				index 5
	agentStatsSummary.push(randomRange(30,50));  //보류(I)			index 6
	agentStatsSummary.push(randomRange(20,30));  //보류(O)			index 7
	agentStatsSummary.push(randomRange(20,30));  //301					업무 index 8 
	agentStatsSummary.push(randomRange(20,30));  //302					회의 index 9
	agentStatsSummary.push(randomRange(20,30));  //303					식사 index 10
	agentStatsSummary.push(randomRange(20,30));  //304					외출 index 11
	agentStatsSummary.push(randomRange(20,30));  //305					휴식 index 12
	agentStatsSummary.push(randomRange(20,30));  //306					교육 index 13

	//log(agentStatsSummary,12)
	var packet = agentStatsSummary.join("^");
	return  packet;
	
};

MONITOR.createGroupStateSummary = function(){
	var packArr = [];
	var data;
	var skillGroups = this.dataSource.sortedSkillGroups;
	for (var i = 0; i < skillGroups.length; i++){
		data = [];
		data.push(skillGroups[i].sgId);            //스킬그룹 아이디      index0
		data.push(skillGroups[i].sgNumber);			 //스킬그룹 넘버				index1
		data.push(skillGroups[i].sgEngName);     //스킬그룹 영문 이름		index2
		data.push(skillGroups[i].sgKorName);     //스킬 그룹 한글 이음 	index3
		data.push(randomRange(40,70));  //전체인원							index4
		data.push(randomRange(20,30));  //로그아웃							index5
		data.push(randomRange(20,30));  //대기									index6
		data.push(randomRange(20,30));  //통화(I)							index7
		data.push(randomRange(20,30));  //통화(O)							index8
		data.push(randomRange(20,30));  //후처리								index9
		data.push(randomRange(20,30));  //보류(I) 							index10
		data.push(randomRange(20,30));  //보류(O) 							index11
		data.push(randomRange(20,30));  //301								index12
		data.push(randomRange(20,30));  //302								index13
		data.push(randomRange(20,30));  //303								index14
		data.push(randomRange(20,30));  //304								index15
		data.push(randomRange(20,30));  //305								index16
		data.push(randomRange(20,30));  //306								index17
		packArr.push(data.join("^"));
	}

	var packetStr = packArr.join("|");
	return packetStr;
};

MONITOR.createDummyCallQueued = function(){
	var queuedStatsArr = [], sGroup, queuedStats;
	var skillGroups = this.dataSource.skillGroups;
	//log("^^^skillGroup : ----------------> ",1);
	//log(skillGroup,1);
	var skillArrs = [];
	for (var skillGroupId in skillGroups){
		if (skillGroups.hasOwnProperty(skillGroupId)) {
			skillArrs.push(skillGroups[skillGroupId]);
		}
	}
	
	for (var i = (skillArrs.length - 1) ; i >=  0 ; i--){
		queuedStats = [];
		sGroup = skillArrs[i];
		
		queuedStats.push(randomRange(300000, 400000)); //서비스 영문이름
		queuedStats.push(sGroup.sgKorName); //서비스 한글 이름
		queuedStats.push(randomRange(10,100).toString());  //대기콜수
		queuedStats.push(randomRange(1,100).toString());  // 최장 대기 시간
		queuedStatsArr.push(queuedStats.join('^'));
	}
 
	var pack = queuedStatsArr.join('|');
	//log("### CallQueuedDState PACKET ####",1)
	//log(pack,1);
	//log("### CallQueuedDState END ####",1)
	return pack;
};

MONITOR.createDummyAgentStateChange = function(){
	var agentRIndex = randomRange(0, this.dataSource.agentList.length-1);
	var targetAgent = this.dataSource.agentList[agentRIndex];
	
	var stateType = randomRange(0,10);
	targetAgent.agentState = stateType.toString();
	targetAgent.responseCode = targetAgent.agentState == "2" ? randomRange(301,306).toString() : "";
	
	var cuTime = unixTime();
	targetAgent.lastingTime = cuTime;
	targetAgent.readableLastingTime = "00:00:00";
	//----------------------------------------------------------------------------------------------------------
	
	var agentInfo = [];
	agentInfo.push(targetAgent.agentId);  //agentId
	agentInfo.push(targetAgent.extn);  //Extn
	
	var agentState = randomRange(0,10);
	agentInfo.push(targetAgent.agentState)//StateType;
	
	agentInfo.push(targetAgent.responseCode)//ResponseCode; 
	agentInfo.push(targetAgent.callDir );  //콜방향
	agentInfo.push(targetAgent.lastingTime)//지속시간
			
	//스킬그룹ID,스킬그룹 넘버,  스킬그룹 영문이름,스킬그룹 한글 이름,
	agentInfo.push(targetAgent.sgId)  //SG_ID
	agentInfo.push(targetAgent.sgNumber)  //SG_NUMBER
	agentInfo.push(targetAgent.sgEngName); //SG_EngName
	agentInfo.push(targetAgent.sgKorName); //SG_KorName
	
	agentInfo.push(targetAgent.teamId);  //team_id
	agentInfo.push(targetAgent.teamEngName); //TEAM_EngName
	agentInfo.push(targetAgent.teamKorName); //TEAM_KorName
	agentInfo.push(targetAgent.agentName); //agent name
	agentInfo.push(targetAgent.position); //직책 구분
	agentInfo.push(targetAgent.stateType); //STATE_TYPE
	
	//log("### createDummyAgentStateChange 더미데이타 끝 ####",3)
	this.getEventOnAgentStateChange(agentInfo.join("^"));
};

























