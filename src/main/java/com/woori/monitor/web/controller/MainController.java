package com.woori.monitor.web.controller;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.woori.monitor.dao.interfaces.MonitorInfoDao;
import com.woori.monitor.model.MonitorInfo;
import com.woori.monitor.model.MonitorInfoCommand;

@Controller
@RequestMapping
public class MainController {
	private static final Logger logger = LoggerFactory.getLogger(MainController.class);
	
	@Autowired MonitorInfoDao monitorInfoDao;
	
	/**
	 * 서블릿 루트 요청 처리 메서드 
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String home(Locale locale, Model model) {
		return "monitor";
	}
	
	/**
	 * 상담원 콜 현황탭을 선택했을 때 데이타 요청 처리 메서드 
	 */
	@RequestMapping(value = "/monitorInfo", method = RequestMethod.GET)
	@ResponseBody
	public MonitorInfoCommand getMonitorInfo(
			@RequestParam(value = "queryMode", required = false, defaultValue="product") String queryMode,
			@RequestParam(value = "skillGroupKorName", required = false, defaultValue="all") String skillGroupKorName){
		//logger.info("Request skillGroupKorName : " + skillGroupKorName);
		MonitorInfoCommand monitorInfoCommand = null;
		
		if (queryMode.equals("test")) {
			monitorInfoCommand  = this.createDummyMonitorInfoCommand(skillGroupKorName.equals("all") ? null : skillGroupKorName);
		} 
		else {
			ArrayList<MonitorInfo> monitorInfos = this.monitorInfoDao.getAllMonitorInfos();
			monitorInfoCommand = new MonitorInfoCommand();
			monitorInfoCommand.setMonitorInfoList(monitorInfos);
			monitorInfoCommand.prepareData(monitorInfos, skillGroupKorName.equals("all") ? null : skillGroupKorName);
		}
		return monitorInfoCommand;
	}

	/* 
	 * Create Test Dummy Member Info
	 * */
	public MonitorInfoCommand createDummyMonitorInfoCommand (String filterKey){
		MonitorInfoCommand monitorInfoCommand = new MonitorInfoCommand();
		ArrayList<MonitorInfo> monitorInfos = new ArrayList<MonitorInfo>();
		filterKey = filterKey == null ? "전체" : filterKey;
		Random random = new Random();
		for (int i = 0; i < 40; i++){
			MonitorInfo info = new MonitorInfo();
			info.setAgentId(String.valueOf(random.nextInt(1000000)));
			info.setAgentName("name_" + i);
			info.setAtEnterpriseName(filterKey);
			info.setAtDescription(filterKey);
			info.setAgentSkillOrder(random.nextInt(10));
			info.setSkillGroupNumber("1000102");
			info.setSkillGroupEngName(filterKey);
			info.setSkillGroupKorName(filterKey);
			info.setTotalCall(random.nextInt(50));
			info.setInCall(random.nextInt(50));
			info.setOutCall(random.nextInt(50));
			info.setTrnsCall(random.nextInt(50));
			info.setCnfrCall(random.nextInt(50));
			info.setAbnCall(random.nextInt(50));
			info.setRonaCall(random.nextInt(50));
			info.setLoginDateTime("2016-10-10 13:30:10");
			info.setLogoutDateTime("2016-10-10 13:30:10");
			info.setLoggedOnTime(random.nextInt(50));
			info.setCallsTalkTime(random.nextInt(50));
			info.setOutCallsTalkTime(random.nextInt(50));
			info.setAvailTime(random.nextInt(50));
			info.setNrTime(random.nextInt(50));
			info.setWorkTime(random.nextInt(50));
			info.setDtRgst("2016-10-10 13:30:10");
			monitorInfos.add(info);
		}
		monitorInfoCommand.setMonitorInfoList(monitorInfos);
		monitorInfoCommand.prepareData(monitorInfos, null);
	    return monitorInfoCommand;
	}
}
