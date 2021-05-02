package com.woori.monitor.dao.interfaces;

import java.util.ArrayList;

import com.woori.monitor.model.MonitorInfo;

public interface MonitorInfoDao {
	public ArrayList<MonitorInfo> getMonitorInfo(MonitorInfo monitorInfo);
	public ArrayList<MonitorInfo> getAllMonitorInfos();
	
}
