#coding=utf-8
import requests, json

class QueryResult :
	def __init__ (self, url) :
		self.__url__ = url
		
	def getRawJson (self, params) :
		jsonData = None
		try:
			jsonData = requests.get (self.__url__, params).json()
		except Exception, e:
			print e
			jsonData = {"errno" : -1, "error" : u"无法获取Json数据"}
		finally:
			return jsonData

if __name__ == '__main__':
	qr = QueryResult("mds3.conf")
	print qr.getRawJson({"file_name" : "123", "start_time" : 20160717, "end_time" : 20160717})
