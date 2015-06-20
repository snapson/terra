var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
var UI = {
	cpu: $('#cpu'),
	mem: $('#mem'),
	db_change: $('#db_change')
};

ws.onopen = function () {
	ws.send('Run application');
}
ws.onerror = function (err) {
	console.log('error is occured::', err);
}
ws.onmessage = function (resp) {
	var data = resp && resp.data && JSON.parse(resp.data);
	if (data) {
		if (data.usage.cpu && data.usage.mem) {
			UI.cpu.html( data.usage.cpu + "% CPU Usage.");
			UI.mem.html( data.usage.mem + '% MEM Usage.');
		}
		UI.db_change.html('Saved with error equal to \'' + (data.message || null) + '\'');
		ws.send('update');
	}
};