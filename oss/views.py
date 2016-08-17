#coding=utf-8
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
import json
from django.db.models import Avg, Count, Min, Max
import time
from mds_db import mdsDB, geo, unicodeCast
import time, ConfigParser
from query import query
# Create your views here.

#utils

def jsonify (content) :
	return HttpResponse (json.dumps({\
			"error" : content, \
			"errno" : 0,\
			}), content_type="application/json")


#core 

def index (request) :
	template = loader.get_template ("oss/index.html");
	return HttpResponse (template.render())

def ftp_overview (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ftp_distribution (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ftp_distribution_result (request) :
	template = loader.get_template ("oss/ftp/distribution/result.html");
	return jsonify(template.render({
		"date" : time.strftime("%Y%m%d", time.localtime())
		}))

def ftp_distribution_result_get (request) :
	if request.is_ajax () and "GET" == request.method:
		cf = ConfigParser.RawConfigParser ()
		cf.read("oss/mds3.conf")
		qr = query.QueryResult (cf.get("QueryResult", "url"))
		file_name = request.GET.get("file_name")
		start_time = request.GET.get("start_time")
		end_time = request.GET.get("end_time")
		return HttpResponse (json.dumps(qr.getRawJson({
			"file_name" : file_name,
			"start_time" : start_time,
			"end_time" : end_time
			})), content_type="application/json");


def ftp_distribution_ocinfo (request) :
    template = loader.get_template ("oss/ftp/distribution/ocinfo.html")

    mds_db = mdsDB.MDSDB ()

    gIdList = mds_db.getGroupIdList ()
    gInfos = mds_db.getGroupInfoByIdList(gIdList)
    ocIds = mds_db.getOCIdListByGroupIdList(gIdList)

    options = []

    for iGroupId in gIdList:
        options.append(gInfos[iGroupId]["name"])

    return jsonify (template.render ({\
        "options" : options, \
    }))

def ftp_distribution_ocinfo_getOCList (request) :
	if request.is_ajax () and 'GET' == request.method :
		mds_db = mdsDB.MDSDB ()
		gIdList = mds_db.getGroupIdList ()
		gInfos = mds_db.getGroupInfoByIdList(gIdList)
		ocIds = mds_db.getOCIdListByGroupIdList(gIdList)
		group2OCList = {}
		for iGroupId in gIdList:
			group2OCList[gInfos[iGroupId]["name"]] = []
			ocInfos = mds_db.getOCInfoByIdList(ocIds[iGroupId]['priOCIds'])
			for iOCId in ocInfos.keys():
				iOCInfo = ocInfos[iOCId]
				group2OCList[gInfos[iGroupId]["name"]].append(
					{
						u"id" : iOCId ,
						u"name" : iOCInfo['area_name'],
						u"weight": iOCInfo['weight'],
						u"state": iOCInfo['state'],
					}
				)
			ocInfos = mds_db.getOCInfoByIdList(ocIds[iGroupId]['resOCIds'])
			for iOCId in ocInfos.keys():
				iOCInfo = ocInfos[iOCId]
				group2OCList[gInfos[iGroupId]["name"]].append(
					{
						u"id" : iOCId,
						u"name" : iOCInfo['area_name'],
						u"weight": iOCInfo['weight'],
						u"state": iOCInfo['state'],
					}
				)
		return HttpResponse(json.dumps(group2OCList), content_type="application/json")
	else:
		return HttpResponse(json.dumps({"error" : "unknown"}), content_type="application/json")


def ftp_distribution_ocinfo_getOCInfo (request) :
	if request.is_ajax () and 'GET' == request.method :
		mds_db = mdsDB.MDSDB ()
		oc_id = request.GET.get("ocid")
		return HttpResponse (json.dumps (mds_db.getDataNodeInfo(int(oc_id))), content_type="application/json")

def ftp_dispatch (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ftp_download (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ftp_sourcestation (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ugc_overview (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ugc_distribution (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ugc_dispatch (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ugc_download (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())

def ugc_sourcestation (request) :
	template = loader.get_template ("developing.html");
	return jsonify(template.render())
