var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
var UI = {
	cpu: $('#cpu'),
	mem: $('#mem'),
	db_change: $('#db_change')
};

$(document).ready(function () {
	console.log('rup application');
	ws.send('run');
	ws.onmesage = process_message;
});

function process_message (resp) {
	console.log('get from js', resp);
	if (resp) {
		if (resp.usage.cpu && resp.usage.mem) {
			UI.cpu.html( resp.usage.cpu + "% CPU Usage.");
			UI.mem.html( resp.usage.mem + '% MEM Usage.');
		}
		UI.db_change.html('Saved with error equal to \'' + (resp.message || null) + '\'');
		ws.send('update');
	}
}
