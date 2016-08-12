#coding=utf-8
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
import json
from django.db.models import Avg, Count, Min, Max
import time

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
