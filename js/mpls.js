// © 2015-2016 Vasniktel (Mez0_Teck)

window.onload = function () {
	document.getElementById("streamName").innerHTML = "Нет станции";
	document.getElementById("props").innerHTML = "0 кбит/с | 0 кГц";
	setTimeout('onloading()', 500);
}
function onloading() {
	psp.sysRadioSetMasterVolume (255);
	psp.sysRadioSetDebugMode (1);
}
var timeoutId = '';
html = '<hr><div align="center">';
if (typeof(playlist) != 'undefined') {
	
	for (var i = 0, n = playlist.length; i < n; i++) {
		html+='<p><span name="head">'+playlist[i].header+'</span><br>';
		html+='<form name="mpls">';
		html+='<p>Имя станции: <input type="text" class="inputText" name="header" value="'+playlist[i].header+'"><br>';
		html+='Ссылка на поток: <input type="text" class="inputText" name="url" value="'+playlist[i].url+'"><br>';
		html+='Имя картинки: <input type="text" class="inputText" name="image" value="'+playlist[i].image+'"></p>';
		html+='</form>';
		html+='<button onclick="test('+i+');"><span class="button">Тест</span></button> ';
		html+='<button onclick="stop();"><span class="button">Стоп</span></button> ';
		html+='<hr>';
	}
	for (var i = playlist.length, n = playlist.length+2; i < n; i++) {
		html+='<p><span name="head">Новая станция</span><br>';
		html+='<form name="mpls">';
		html+='<p>Имя станции: <input type="text" class="inputText" name="header" value=""><br>';
		html+='Ссылка на поток: <input type="text" class="inputText" name="url" value=""><br>';
		html+='Имя картинки: <input type="text" class="inputText" name="image" value=""></p>';
		html+='</form>';
		html+='<button onclick="test('+i+');"><span class="button">Тест</span></button> ';
		html+='<button onclick="stop();"><span class="button">Стоп</span></button> ';
		html+='<hr>';
	}
} else {
	for (var i = 0; i < 2; i++) {
		html+='<p><span name="head">Новая станция</span><br>';
		html+='<form name="mpls">';
		html+='<p>Имя станции: <input type="text" class="inputText" name="header" value=""><br>';
		html+='Ссылка на поток: <input type="text" class="inputText" name="url" value=""><br>';
		html+='Имя картинки: <input type="text" class="inputText" name="image" value=""></p>';
		html+='</form>';
		html+='<button onclick="test('+i+');"><span class="button">Тест</span></button> ';
		html+='<button onclick="stop();"><span class="button">Стоп</span></button> ';
		html+='<hr>';
	}
}

html += '</div>';

document.write(html);

delete html;

function saveFile() {
	var header, url, image, sendData = "(";
	for (var i = 0, k = document.getElementsByName('mpls').length; i < k; i++) {
		header = document.forms[i].header.value;
		url = document.forms[i].url.value;
		image = document.forms[i].image.value;
		if (header == '' && url == '' && image == '')
			continue;
		sendData+="array('name'=>'"+header+"','url'=>'"+url+"','image'=>'"+image+"'),";
	}
	sendData+=");";
	if (sendData == '();')
		alert('Вы не ввели ни одной станции.');
	else {
		document.save.hidden.value = sendData;
		document.save.submit();
	}
}
function cancel() {
	if (confirm('Все несохранённые данные будут утеряны. Продолжить?'))
		document.location.href = 'index.html';
}
function test(i) {
	var url = document.forms[i].url.value;
	if (url == '')
		alert('Ссылка на поток не обнаружена.');
	else {
		var stream;
		if (timeoutId !== '')
			clearTimeout(timeoutId);
		if (url.indexOf('.m3u')+1)
			stream = psp.sysRadioPlayM3u(url,"pspRadioPlayer","pspRadioPlayer");
		else if (url.indexOf('.pls')+1)
			stream = psp.sysRadioPlayPls(url,"pspRadioPlayer","pspRadioPlayer");
		else
			stream = psp.sysRadioPlayStream(url,"pspRadioPlayer");
		if (stream == -1) {
			alert('Произошла ошибка при получении потока.');
			psp.sysRadioStop ();
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