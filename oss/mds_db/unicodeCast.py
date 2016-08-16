#coding=utf-8

def unicodeCast (obj):
    '''python 3 has little support for chinses'''
    resStr = u""
    if type(obj) is dict:
        resStr += u"{"
        for iKey in obj.keys():
            resStr += unicodeCast(iKey) + u":" + unicodeCast(obj[iKey]) + u","
        resStr += u"}"
    elif type(obj) is list:
        resStr += u"["
        for iEle in obj:
            resStr += unicodeCast(iEle) + u","
        resStr += u"]"
    elif type(obj) is tuple:
        resStr += u"("
        for iEle in obj:
            resStr += unicodeCast(iEle) + u","
        resStr += u")"
    elif type(obj) is str:
        resStr += obj.decode("utf-8")
    else:
        resStr += unicode(obj)

    return resStr
