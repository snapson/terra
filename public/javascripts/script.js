var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
var UI = {
	cpu: $('#cpu'),
	mem: $('#mem'),
	db_change: $('#db_change')
};

ws.onmesage = function (response) {
	if (response) {
		if (response.usage.cpu && response.usage.mem) {
			UI.cpu.html( response.usage.cpu + "% CPU Usage.");
			UI.mem.html( response.usage.mem + '% MEM Usage.');
		}
		UI.db_change.html('Saved with error equal to \'' + (response.message || null) + '\'');
	}
}