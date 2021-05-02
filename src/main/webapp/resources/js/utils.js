String.prototype.trim = function(){return this.replace(/(^\s*)|(\s*$)/gi, "");}
UTF8 = {
		//Converts from ANSI to UTF-8
		encode: function(s){
        for(var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
            s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
        );
        return s.join("");
    },
    //Converts from UTF-8 to ANSI
    decode: function(s){
        for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
            ((a = s[i][c](0)) & 0x80) &&
            (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
            o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
        );
        return s.join("");
    }
};

//유닉스 타임을 구함.(유닉스 타임은 초 단위임)
//파라미터가 없을 경우 현재 시간의 유닉스 타임을 구함 
// getTime 메서드는 1000분의 1 초의 mileseconds 로 구하기 때문에 1000으로 나누어 주어야 함
function unixTime(date){
	if (!date) date = new Date();
	return date.getTime(); 
}


//초를 시간:분:초 포맷으로 변경
function humanReadableTime(seconds) {
  var pad = function(x) { return (x < 10) ? "0"+x : x; }
  return pad(parseInt(seconds / (60*60))) + ":" +
         pad(parseInt(seconds / 60 % 60)) + ":" +
         pad(seconds % 60)
}

function getParameter(paramName) {
	var _tempUrl = location.href.split("?")[1];
	var _tempArray = _tempUrl.split('&');
	for (var i = 0; _tempArray.length; i++) {
		var _keyValuePair = _tempArray[i].split('=');

		if (_keyValuePair[0] == paramName) {
			return _keyValuePair[1];
		}
	}
}

function stringByteLength(str) {
	return ~-encodeURI(str).split(/%..|./).length;
}

function uniToAscii(str) {
	var regex = /\\[uU]([a-zA-Z0-9]+)/g;
	var result;
	while (result = regex.exec(str)) {
	str = str.split(result[0]).join(String.fromCharCode(parseInt(result[1], 16)));
	}
	return str;
	}

function log (log, type,level){
	if (type != 7) return
	if (!level) level = "log";
	console[level](log);
}

function randomRange(n1, n2) {
  return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
}

function getUrlParams() {
  var params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
  return params;
} 


function trim(str){
	return str.replace(/^\s*|\s*$/g, '');
}

function isNulOrBlank (str) {
	if(typeof source === 'undefined' || source  == null || trim(source).length == 0 ) return true
	else return false;
}

//스트링이  널이거나 공백일 경우, 디폴트 값으로 반환
function null2str(source,defaultValue) {
	 if(typeof source === 'undefined' || source  == null || trim(source).length == 0 ) return defaultValue 
	 else return source;
}

//문자열 숫자를 숫자로 변환
function str2int(source, defaultValue){
	if (typeof source === "number") return source;
	if (typeof defaultValue == "undefined" || typeof defaultValue != 'number') defaultValue = 0;
	if (source.length == 0 || source == "") return defaultValue;

	var result = Number(source);
	if (isNaN(result)) result = defaultValue;
	return result;
		
}

function formatDate(date) {
	var sDate;
	if (date < 10) {
		sDate = "0"+ date;
	}else {
		sDate = date.toString();
	}
	
	return sDate;
}

function formatNumber(x){
	x = typeof x == "number" ? x.toString() : x;
	return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
