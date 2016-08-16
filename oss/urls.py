#coding=utf-8
from django.conf.urls import url, include
from oss import views

urlpatterns = [
	url (r"^$", views.index, name="oss_index"),
	url (r"^ftp_overview$", views.ftp_overview, name="oss_ftp_overview"),
	url (r"^ftp_distribution$", views.ftp_distribution, name="oss_ftp_distribution"),
	url (r"^ftp_distribution_result$", views.ftp_distribution_result, name="oss_ftp_distribution_result"),
	url (r"^ftp_distribution_ocinfo$", views.ftp_distribution_ocinfo, name="oss_ftp_distribution_ocinfo"),
	url (r"^ftp_distribution_ocinfo_getOCList$", views.ftp_distribution_ocinfo_getOCList, name="oss_ftp_distribution_ocinfo_getOCList"),
	url (r"^ftp_distribution_ocinfo_getOCInfo$", views.ftp_distribution_ocinfo_getOCInfo, name="oss_ftp_distribution_ocinfo_getOCInfo"),
	url (r"^ftp_dispatch$", views.ftp_dispatch, name="oss_ftp_dispatch"),
	url (r"^ftp_dowload$", views.ftp_download, name="oss_ftp_download"),
	url (r"^ftp_sourcestation$", views.ftp_sourcestation, name="oss_ftp_sourcestation"),
	url (r"^ugc_overview$", views.ugc_overview, name="oss_ugc_overview"),
	url (r"^ugc_distribution$", views.ugc_distribution, name="oss_ugc_distribution"),
	url (r"^ugc_dispatch$", views.ugc_dispatch, name="oss_ugc_dispatch"),
	url (r"^ugc_download$", views.ugc_download, name="oss_ugc_download"),
	url (r"^ugc_sourcestation$", views.ugc_sourcestation, name="oss_ugc_sourcestation"),
]
