package com.woori.monitor.dao.mapper;

import java.util.ArrayList;

import com.woori.monitor.model.MonitorInfo;

public interface MonitorInfoMapper {
	public ArrayList<MonitorInfo> getMonitorInfo(MonitorInfo monitorInfo);
	public ArrayList<MonitorInfo> getAllMonitorInfos();
}
