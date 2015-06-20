var socket = io.connect('http://localhost:5353');
var default_time = 30000;
var UI = {
	df: document.createDocumentFragment(),
	cpu: $('#cpu'),
	mem: $('#mem'),
	db_change: $('#db_change')
};

socket.on('update', function (data) {
	if (data) {
		if (data.cpu && data.mem) {
			UI.cpu.html( data.cpu + "% CPU Usage.");
			UI.mem.html( data.mem + '% MEM Usage.');
		}
		socket.emit('update', { time: default_time });
	}
});
socket.on('saveToDB', function (error) {
	UI.db_change.html('Saved with error equal to \'' + (error || null) + '\'');
});