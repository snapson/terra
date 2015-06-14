var socket = io.connect('http://localhost:5353');
var default_time = 30000;
socket.on('update', function (data) {
	if (data) {
		if (data.cpu && data.mem) {
			$('#cpu').html( data.cpu + "% CPU Usage.");
			$('#mem').html( data.mem + '% MEM Usage.');
		}
		socket.emit('update', { time: 1000 });
	}
});
socket.on('saveToDB', function (status) {
	$('#db_change').html('Saved with error equal to \'' + status + '\'');
});