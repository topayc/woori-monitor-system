package com.woori.monitor.dao;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.woori.monitor.dao.interfaces.MonitorInfoDao;
import com.woori.monitor.dao.mapper.MonitorInfoMapper;
import com.woori.monitor.model.MonitorInfo;

@Repository
public class MonitorInfoDaoImpl implements MonitorInfoDao{
	
	@Autowired MonitorInfoMapper monitorInfoMapper;
	
	@Override
	public ArrayList<MonitorInfo> getMonitorInfo(MonitorInfo monitorInfo) {
		return this.monitorInfoMapper.getMonitorInfo(monitorInfo);
	}
	
	public ArrayList<MonitorInfo> getAllMonitorInfos(){
		return this.monitorInfoMapper.getAllMonitorInfos();
	}
}
