// © 2015-2016 Vasniktel (Mez0_Teck)

var VERS = {
	index:3.01,
	mpls:3.01,
	lic:2.7,
	css:2.9,
	img:2.7,
	js:3.14,
	icon:2.7
};

var sleepId, countId, end, countDiv = document.getElementById("count");

window.onload = function () {
	document.getElementById("streamName").innerHTML = "Нет станции";
	document.getElementById("props").innerHTML = "0 кбит/с | 0 кГц";
	countDiv.innerHTML = "00:00:00";
	setTimeout('autoloadFunc ()', 500);
}
function autoloadFunc () {
    psp.sysRadioSetMasterVolume (255);
    psp.sysRadioSetDebugMode (1);
}

function openPage () {
	var formData = document.forms['urlForm'].urlInput.value;
	window.open(formData, "_blank", "");
}
function updater () {
	var sendData = "('index'=>"+VERS.index+",'lic'=>"+VERS.lic+",'css'=>"+VERS.css+",'js'=>"+VERS.js+",'img'=>"+VERS.img+",'mpls'=>"+VERS.mpls+",'icon'=>"+VERS.icon+");";
	document.update.hidden.value = sendData;
	document.update.submit();
}
function timer () {
    var timeData = document.forms['timerForm'].timerInput.value;
    var time = parseInt(timeData,10);
    if (time <= 0 || isNaN(time) || time >= 1440)
    	alert("Минуты задаются числом, которое больше \"0\" и меньше \"1440\".");
    else { 
	    if (countDiv.innerHTML !== "00:00:00") {
			clearTimeout(sleepId);
			clearTimeout(countId);
		}
        sleepId = setTimeout('psp.sysRadioSleep()',time*60000-10000);
		var today = new Date();
        end = Date.parse(today)+time*60000;
        count();
    }
}
function clearTimer () {
    clearTimeout(sleepId);
	clearTimeout(countId);
	countDiv.innerHTML = "00:00:00";
}
function count () {
	var today1 = new Date();
	var timer = end-Date.parse(today1);
	var hours = Math.floor((timer/(1000*60*60))%24);
	var minutes = Math.floor((timer/1000/60)%60);
	var seconds = Math.floor((timer/1000)%60);
	if ((seconds==0 && minutes==0 && hours==0) || (seconds<0 || minutes<0 || hours<0)) {
		clearTimeout(countId);
		countDiv.innerHTML = "00:00:00";
		return;
	}
	if (seconds<10) seconds = "0"+seconds;
	if (minutes<10) minutes = "0"+minutes;
	if (hours<10) hours = "0"+hours;
	countDiv.innerHTML = hours+":"+minutes+":"+seconds;
	countId = setTimeout('count()',1000);
}

if (typeof(playlist) == 'undefined') {

	if (confirm("Хотите добавить радиостанции в плеер?"))
		document.location.href = 'mpls.html';
	else
		document.write("<hr><h2 align='center' style='color: white'>Нет радиостанций</h2><hr>");

} else {

	svUrl = 'http://rfe-channel-07.akacast.akamaistream.net/7/886/229657/v1/ibb.akacast.akamaistream.net/rfe_channel_07';
	doc = "<hr>";
	for (var i=0, n = playlist.length;i<n;i++) {
		doc += "<div align='center'>";
		header = playlist[i].header;
		url = playlist[i].url;
		image = "img/"+playlist[i].image;
		if (image === 'img/none')
			doc += "<p><span name='head'>"+header+"</span>";
		else
			doc += "<p><img src="+image+">&nbsp;<span name='head'>"+header+"</span>";
		if (url === svUrl)
			doc += "<br>&nbsp;&nbsp;&emsp;<a href='http://mypls.16mb.com/schedule/' target='_blank' class='link'><u>Розклад програм</u></a>";
		doc += "</p><button onclick='stream("+i+");'><span class='button'>СТАРТ</span></button>&nbsp;";
		doc += "<button onclick='stop();'><span class='button'>СТОП</span></button><hr>";
		doc += "</div>";
	}
	document.write(doc);
	delete doc;
	delete svUrl;
	delete header;
	delete image;
	delete url;

	var timeoutId = '';

	function stream (i) {
		var url = playlist[i].url;
		if (url == '')
			alert('Ссылка на поток не обнаружена.');
		else {
			var stream;
			if (timeoutId !== '') clearTimeout(timeoutId);
			if (url.indexOf('.m3u')+1)
				stream = psp.sysRadioPlayM3u(url,"pspRadioPlayer","pspRadioPlayer");
			else if (url.indexOf('.pls')+1)
				stream = psp.sysRadioPlayPls(url,"pspRadioPlayer","pspRadioPlayer");
			else
				stream = psp.sysRadioPlayStream(url,"pspRadioPlayer");
			if (stream == -1) {
				alert('Произошла ошибка при получении потока.');
				psp.sysRadioStop ();
				document.getElementById("streamName").innerHTML = "Нет станции";
			} else {
				psp.sysRadioSetSubVolume (255);
				var name = document.getElementsByName("head")[i].innerHTML;
				document.getElementById("streamName").innerHTML = name;
				properties();
			}
		}
	}
	function stop () {
	    psp.sysRadioStop ();
		document.getElementById("streamName").innerHTML = "Нет станции";
		if (timeoutId !== '')
			clearTimeout(timeoutId);
		document.getElementById("props").innerHTML = "0 кбит/с | 0 кГц";
	}
	function properties () {
		var bitRate = psp.sysRadioGetBitRate () / 1000;
    	var samplingRate = psp.sysRadioGetSamplingRate () / 1000;
    	var prop = bitRate  + ' кбит/с' + " | " + samplingRate + ' кГц';
    	document.getElementById("props").innerHTML = prop;
    	if (bitRate==0||samplingRate==0)
    		timeoutId = setTimeout("properties()", 1000);
    	else
    		timeoutId = '';
	}
}