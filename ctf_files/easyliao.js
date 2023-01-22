/*
打开对话框接入到指定的客服
cId:公司id
tar：客服登陆账号
tag:标签ID
msg:待发送消息
*/
function openJesongChatByCus(cId, tar, tag, msg) {
  return openJesongChat(cId, 'c', tar, tag, msg);
}
/*
打开对话框接入到指定的客服分组
cId:公司id
tar：客服分组ID
tag:标签ID
msg:待发送消息
*/
function openJesongChatByGroup(cId, tar, tag, msg) {
  return openJesongChat(cId, 'g', tar, tag, msg);
}

//微信跳转
function openJesongChatWx(cId, tar, tag, msg) {
  var ua = navigator.userAgent.toLowerCase();
  var isWeixin = ua.indexOf('micromessenger') != -1;
  if (isWeixin) {
	  window.location = '//c-' + cId + '.p.easyliao.com/live/chat.do?c=' + cId + '&g=' + tar;
  }else{
	 return openJesongChat(cId, 'g', tar, tag, msg)
  }
}

function easyliaoIsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
function openJesongChat(cId, c, tar, tag, msg) {
  var param = '';
  if (c == 'c') {
    param += 'n=' + tar;
  } else if (c == 'g') {
    param += 'g=' + tar;
  }
  if (tag) {
    param += '&tag=' + tag;
  }
  if (msg) {
    param += '&msg=' + window.encodeURIComponent(msg);
  }
  if ("undefined" == typeof jesong || !jesong.util || !jesong.util.openChat) {
    openNoJesongJsChat(cId, param);
  } else {
    jesong.util.openChat(param);
  }
  return false;
}
function openNoJesongJsChat(cId, params) {
  var url = "https://live.easyliao.com/live/" + 'chat.do?c=' + cId;
  url = url + "&chatUrl=" + window.encodeURIComponent(window.location.href);

  if (typeof params == 'string' && params.length != 0) {
    url += '&' + params;
  }

  if (getCook('JESONG_VISITOR_ID')) {
    url = url + "&v=" + getCook('JESONG_VISITOR_ID');
  }
  if (getCook('JESONG_USER_ID')) {
    url = url + "&u=" + getCook('JESONG_USER_ID');
  }

  if (getCook("im_refer")) {
    url = url + "&ref=" + window.encodeURIComponent(getCook("im_refer"));
  }
  else {
    var refer = getPageRefer();
    if (refer != "") {
      url = url + "&ref=" + window.encodeURIComponent(refer);
    }
  }

  var exts = null;
  if (getCook("JESONG_EXT_DATA")) {
    exts = getCook("JESONG_EXT_DATA");
  }
  if (typeof (JESONG_EXT_DATA) != "undefined") {
    exts = JESONG_EXT_DATA;
  }
  try {
    if (exts != null && typeof exts == "object") {
      var _ext = "#params:";
      var _i = 0;
      for (var key in exts) {
        if (_i > 0) {
          _ext += ",";
        }
        _ext = _ext + key + "," + exts[key];
        _i++;
      }
      exts = _ext;
    }
    if (exts != null && exts != "") {
      url = url + "&ext=" + window.encodeURIComponent(exts);
    }
  } catch (e) {
  }
  try {
    var _scripts = document.getElementsByTagName("script");
    var _reg = /\/\/scripts\.easyliao\.com\/[0-9]+\/([0-9]+)\.js/;
    for (var i = 0; i < _scripts.length; i++) {
      var _url = _scripts[i].src;
      if (_url && _reg.test(_url)) {
        var _config = _url.match(_reg);
        if (_config.length == 2) {
          url = url + "&config=" + _config[1];
          break;
        }
      }
    }
  } catch (e) {
  }
  var p = "height=525,width=800,directories=no,location=no,menubar=no,resizeable=no,status=no,toolbar=no,top=100,left=200";

  if (easyliaoIsPC()) {
    try {
      var cw = window.open(url, 'chat_' + cId, p); cw.focus();
    } catch (e) {
      window.location = url;
    }
  }
  else
    window.location = url;
}
function jesongGetDomain(url) {
  var domain = url.match(/(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i);
  if (domain.length > 2) {
    return domain[2];
  } else {
    return null;
  }
}
function getPageRefer() {
  if (document.referrer) {
    try {
      var refer = document.referrer;

      if (refer) {
        var referDomain = jesongGetDomain(refer);
        var currDomain = window.location.host;
        if (referDomain && referDomain == currDomain) {
          refer = "";
        }
      }

      if (refer != "") {
        return refer;
      }
    } catch (e) { };
  }
  return "";
}
function getCook(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)"); arr = document.cookie.match(reg); if (arr) { return unescape(arr[2]); } else { return null; }
}
function setCook(name, value, t) {
  if (typeof t == 'undefined' || t == null) t = 60 * 30 * 24 * 60 * 60 * 1000;
  var exp = new Date(); exp.setTime(exp.getTime() + t);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
function initJesongRefer() {
  var refer = getPageRefer();
  if (refer != "") {
    setCook('im_refer', refer, 10 * 60 * 1000);
  }
}
	//initJesongRefer(); //开启cookie记录来源 
