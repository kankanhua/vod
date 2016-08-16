#coding=utf-8

import unicodeCast
import MySQLdb

class MDSDB:
    def __init__ (self):
        self.__error = None
        self.__conn = None
        try :
            self.__conn = MySQLdb.connect (
                db      = "mds_db",
                user    = "root",
                passwd  = "root",
                host    = "localhost",
                charset = "utf8"
            )
        except Exception, ex :
            self.__error = "fail to connect mysql"
        finally:
            if self.__conn == None:
                self.__error = "wrong attibutes"

    def __del__ (self) :
        if self.__conn != None:
            self.__conn.close ()

    #db operations

    def select (self, cmd) :
        cur = self.__conn.cursor()
        cur.execute (cmd)
        return cur.fetchall ()

    #db getter

        #group
    def getGroupIdList (self) :
        _rawMsg = self.select ("select distinct(ocgroup_id) from mds3_ocgroup_info")
        gidList = []
        for iGid in _rawMsg:
            gidList.append (iGid[0])
        #special for ungrouped ocs
        gidList.append (-1)
        return gidList
	
    def getGroupIdByName (self, groupName) :
        _rawMsg = self.select ("select ocgroup_id from mds3_ocgroup_name where ocgroup_name ='" + groupName + "'")
        return -1 if len(_rawMsg) == 0 else _rawMsg[0][0]
	
    def getGroupInfoByIdList (self, gidList) :
        _res = {}
        for iGroupId in gidList:
            if iGroupId > 0:
                _res[iGroupId] = {}
                _rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld" % (iGroupId))
                _res[iGroupId]['sum'] = _rawMsg[0][0]
                _rawMsg = self.select ("select count(oc_id) from mds3_ocgroup_info where ocgroup_id = %ld and is_used = 1" % (iGroupId))
                _res[iGroupId]['count'] = _rawMsg[0][0]
                _rawMsg = self.select ("select ocgroup_name from mds3_ocgroup_name where ocgroup_id = %d" % (iGroupId))
                _res[iGroupId]['name'] = _rawMsg[0][0]
            else:
                _res[iGroupId] = {}
                _rawMsg = self.select ("select count(zone_id) from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info)")
                _res[iGroupId]['sum'] = _rawMsg[0][0]
                _rawMsg = self.select ("select count(zone_id) from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info) and is_used = 1")
                _res[iGroupId]['count'] = _rawMsg[0][0]
                _res[iGroupId]['name'] = u"未使用"
        return _res

    def getOCIdListByGroupIdList (self, gidList) :
        '''{gid : {priOCIds : [oc1, oc2], resOCIds : [oc3, oc4, ...]}}'''
        _res = {}
        for iGroupId in gidList:
            _res[iGroupId] = {"priOCIds" : [], "resOCIds" : []}
            if iGroupId > 0:
				_rawMsg = self.select ("select oc_id, oc_weight from mds3_ocgroup_info where ocgroup_id = %ld order by oc_weight desc limit 2"% (iGroupId))
				for _iRawMsg in _rawMsg :
					_res[iGroupId]["priOCIds"].append(_iRawMsg[0])

				_rawMsg = self.select ("select oc_id, oc_weight from mds3_ocgroup_info where ocgroup_id = %ld order by oc_weight desc"% (iGroupId))
				for _iRawMsg in _rawMsg :
					if _iRawMsg[0] not in _res[iGroupId]["priOCIds"]:
						_res[iGroupId]["resOCIds"].append(_iRawMsg[0])
            else:
                _rawMsg = self.select ("select zone_id from zone_info where zone_id not in (select oc_id from mds3_ocgroup_info)")
                for _iRawMsg in _rawMsg :
					_res[iGroupId]["resOCIds"].append(_iRawMsg[0])
        return _res

    def is_bigOC (self, ocidList) :
        '''{ocid : isbigOC}'''
        _res = {}
        for iOCId in ocidList:
            _res[iOCId] = (len(self.select ("select * from group_cover_info where group_id = %ld and zone_id = %d"  % (20002L, iOCId))) == 1);
        return _res

        #oc
    def getOCInfoByIdList (self, ocidList) :
        '''{ocid : {name : name, weight : weight, state : is_used, prior : is_bigOC}}'''
        _res = {}
        for iOCId in ocidList:
			_res[iOCId] = {}
			_rawMsg = self.select ("select area_name, is_used, data_node_max_speed from zone_info where zone_id = %ld" % (iOCId))
			_res[iOCId]['area_name'] = _rawMsg[0][0]
			_res[iOCId]['state'] = _rawMsg[0][1]
			_res[iOCId]['weight'] = 0
			_res[iOCId]['max_speed'] = _rawMsg[0][2]
			_rawMsg = self.select ("select oc_weight, is_used, max_download_speed from mds3_ocgroup_info where oc_id = %ld" % (iOCId))
			if len(_rawMsg) == 1 :
				_res[iOCId]['weight'] = _rawMsg[0][0]
				_res[iOCId]['state'] = _rawMsg[0][1]
				_res[iOCId]['prior'] = self.is_bigOC ([iOCId])[iOCId]
				_res[iOCId]['max_speed'] = _rawMsg[0][2]
        return _res
	
    def getGroupIdByOCId (self, ocid) : 
		_rawMsg = self.select ("select ocgroup_id from mds3_ocgroup_info where oc_id = %d" % (ocid))
		return -1 if len(_rawMsg) == 0 else _rawMsg[0][0]

    def updateOCInfo (self, updateOCInfo) : 
		cur = self.__conn.cursor()
		try:
			for iOCInfo in updateOCInfo:
				_ocid = iOCInfo["id"]
				_fgid = iOCInfo["fgid"]
				_tgid = iOCInfo["tgid"]
				_wght = iOCInfo["wght"]
				_used = iOCInfo["used"]
				_mdpd = iOCInfo["mdsp"]
				cur.execute ("update zone_info set is_used = %d where zone_id = %d" % (_used, _ocid))
				if _fgid != -1:
					cur.execute ("delete from mds3_ocgroup_info where oc_id = %d" % (_ocid))
				if _tgid != -1:
					cur.execute ("insert into mds3_ocgroup_info values(%d, %d, %d, %d, %d)" % (_tgid, _ocid, _wght, _used, _mdpd))
			self.__conn.commit ()
		except Exception, e:
			print e
			self.__conn.rollback()
			return False
		else :
			return True
    
    def getDataNodeInfo (self, OCId): 
		_res = {}
		_rawMsg = self.select ("select area_name from zone_info where zone_id = %ld" % (OCId))
		_res['name'] = _rawMsg[0][0]
		_rawMsg = self.select ("select wan_ip, lan_ip, is_used from data_node_info where zone_id = %ld order by is_used" % (OCId))
		_res["agent"] = []
		for iRes in _rawMsg :
			_res["agent"].append ({
				"wan" : iRes[0],
				"lan" : iRes[1],
				"state" : iRes[2]
				})

		return _res
		

if __name__ == '__main__':
	testdb = MDSDB()
	print ">>1: show all group"
	gidList = testdb.getGroupIdList()
	print unicodeCast.unicodeCast (gidList)
	print ">>2: show all group info"
	gInfos = testdb.getGroupInfoByIdList(gidList)
	print unicodeCast.unicodeCast (gInfos)
	print ">>3: show all oc"
	ocIds = testdb.getOCIdListByGroupIdList(gidList)
	print unicodeCast.unicodeCast (ocIds)
	print ">>4: show all oc info"
	for iGroupId in gidList:
		print ">> group", iGroupId
		print unicodeCast.unicodeCast (testdb.getOCInfoByIdList(ocIds[iGroupId]['priOCIds']))
		print unicodeCast.unicodeCast (testdb.getOCInfoByIdList(ocIds[iGroupId]['resOCIds']))
	print ">>5: show gid"
	print testdb.getGroupIdByName ("1")
