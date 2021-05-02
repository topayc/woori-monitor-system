package com.woori.monitor.model;

import java.util.ArrayList;
import java.util.Arrays;

public class MonitorInfoCommand {
	private MonitorInfoSummary totalSummary;
	private MonitorInfoSummary groupSummary;
	private ArrayList<MonitorInfo> monitorInfoList;
	
	private String result = "error";
	private int totalSummaryMin;
	private int totalSummaryMax;

	private int groupSummaryMin;
	private int groupSummaryMax;
	
	public void prepareData(ArrayList<MonitorInfo> sourceList, String filterGroupKey){
		totalSummary = new MonitorInfoSummary();
		groupSummary = new MonitorInfoSummary();
		monitorInfoList = new ArrayList<MonitorInfo>();
	
		
		for (MonitorInfo monitorInfo : sourceList){
			this.totalSummary.setTotalCallCount(this.totalSummary.getTotalCallCount() + monitorInfo.getTotalCall());
			this.totalSummary.setTotalInCallCount(this.totalSummary.getTotalInCallCount()+ monitorInfo.getInCall());
			this.totalSummary.setTotalOutCallCount(this.totalSummary.getTotalOutCallCount()+  monitorInfo.getOutCall());
			this.totalSummary.setTotalRonaCallCount(this.totalSummary.getTotalRonaCallCount() + monitorInfo.getRonaCall());
			this.totalSummary.setTotalTrnsCallCount(this.totalSummary.getTotalTrnsCallCount() + monitorInfo.getTrnsCall());
			this.totalSummary.setTotalCnfrCallCount(this.totalSummary.getTotalCnfrCallCount()+ monitorInfo.getCnfrCall());
			this.totalSummary.setTotalAbnCallCount(this.totalSummary.getTotalAbnCallCount() + monitorInfo.getAbnCall());
		}
		
		if (filterGroupKey == null) {
			groupSummary = totalSummary;
		}
 		
		for (MonitorInfo monitorInfo : sourceList){
			if (filterGroupKey == null) {
				this.monitorInfoList.add(monitorInfo);
			}else {
				if (monitorInfo.getAtDescription().equals(filterGroupKey)){
					this.groupSummary.setTotalCallCount(this.groupSummary.getTotalCallCount() + monitorInfo.getTotalCall());
					this.groupSummary.setTotalInCallCount(this.groupSummary.getTotalInCallCount()+ monitorInfo.getInCall());
					this.groupSummary.setTotalOutCallCount(this.groupSummary.getTotalOutCallCount()+  monitorInfo.getOutCall());
					this.groupSummary.setTotalRonaCallCount(this.groupSummary.getTotalRonaCallCount() + monitorInfo.getRonaCall());
					this.groupSummary.setTotalTrnsCallCount(this.groupSummary.getTotalTrnsCallCount() + monitorInfo.getTrnsCall());
					this.groupSummary.setTotalCnfrCallCount(this.groupSummary.getTotalCnfrCallCount()+ monitorInfo.getCnfrCall());
					this.groupSummary.setTotalAbnCallCount(this.groupSummary.getTotalAbnCallCount() + monitorInfo.getAbnCall());
					this.monitorInfoList.add(monitorInfo);
				}
			}
		}
		String tempNum = "10000000000";
		
		int[] datas= new int[]{
				this.totalSummary.getTotalCallCount(), 
				this.totalSummary.getTotalOutCallCount(),
				this.totalSummary.getTotalRonaCallCount(),
				this.totalSummary.getTotalTrnsCallCount(),
				this.totalSummary.getTotalCnfrCallCount(),
				this.totalSummary.getTotalAbnCallCount()
			};
			
		Arrays.sort(datas);
		int modNum = Integer.parseInt(tempNum.substring(0, String.valueOf(datas[datas.length-1]).length()));
		this.totalSummaryMin = 0;
		//this.totalSummaryMax = datas[datas.length-1] + 50;
		this.totalSummaryMax = (int)(Math.ceil((double)datas[datas.length-1] / modNum)) * (modNum);

		
		datas = new int[]{
				this.groupSummary.getTotalCallCount(), 
				this.groupSummary.getTotalInCallCount(),
				this.groupSummary.getTotalRonaCallCount(),
				this.groupSummary.getTotalTrnsCallCount(),
				this.groupSummary.getTotalCnfrCallCount(),
				this.groupSummary.getTotalAbnCallCount()
		};
		
		Arrays.sort(datas);
		
		modNum = Integer.parseInt(tempNum.substring(0, String.valueOf(datas[datas.length-1]).length()));
		this.groupSummaryMin = 0;
		//this.groupSummaryMax = datas[datas.length-1] + 50;
		this.groupSummaryMax = (int)(Math.ceil((double)datas[datas.length-1] / (double)modNum)+2) * (modNum);
		
		

		
		MonitorInfo monitorInfo = new MonitorInfo();
		monitorInfo.setAgentName("[전체]");
		monitorInfo.setSkillGroupKorName(filterGroupKey == null ? "[전체팀]" : "[" + filterGroupKey+ " 전체]" );
		monitorInfo.setTotalCall(this.groupSummary.getTotalCallCount());
		monitorInfo.setInCall(this.groupSummary.getTotalInCallCount());
		monitorInfo.setOutCall(this.groupSummary.getTotalOutCallCount());
		monitorInfo.setTrnsCall(this.groupSummary.getTotalTrnsCallCount());
		monitorInfo.setCnfrCall(this.groupSummary.getTotalCnfrCallCount());
		monitorInfo.setRonaCall(this.groupSummary.getTotalRonaCallCount());
		
		this.monitorInfoList.add(0, monitorInfo);
		this.result = "succeed";
	}

	public MonitorInfoSummary getTotalSummary() {
		return totalSummary;
	}

	public void setTotalSummary(MonitorInfoSummary totalSummary) {
		this.totalSummary = totalSummary;
	}

	public MonitorInfoSummary getGroupSummary() {
		return groupSummary;
	}

	public void setGroupSummary(MonitorInfoSummary groupSummary) {
		this.groupSummary = groupSummary;
	}

	public ArrayList<MonitorInfo> getMonitorInfoList() {
		return monitorInfoList;
	}

	public void setMonitorInfoList(ArrayList<MonitorInfo> monitorInfoList) {
		this.monitorInfoList = monitorInfoList;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public int getTotalSummaryMin() {
		return totalSummaryMin;
	}

	public void setTotalSummaryMin(int totalSummaryMin) {
		this.totalSummaryMin = totalSummaryMin;
	}

	public int getTotalSummaryMax() {
		return totalSummaryMax;
	}

	public void setTotalSummaryMax(int totalSummaryMax) {
		this.totalSummaryMax = totalSummaryMax;
	}

	public int getGroupSummaryMin() {
		return groupSummaryMin;
	}

	public void setGroupSummaryMin(int groupSummaryMin) {
		this.groupSummaryMin = groupSummaryMin;
	}

	public int getGroupSummaryMax() {
		return groupSummaryMax;
	}

	public void setGroupSummaryMax(int groupSummaryMax) {
		this.groupSummaryMax = groupSummaryMax;
	}


}
