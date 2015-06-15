var socket = io.connect('http://localhost:5353');
var default_time = 30000;
var UI = {
	df: document.createDocumentFragment(),
	cpu: $('#cpu'),
	mem: $('#mem'),
	db_change: $('#db_change'),
	list_of_docs: $('#list_of_docs')
};

socket.on('update', function (data) {
	if (data) {
		if (data.cpu && data.mem) {
			UI.cpu.html( data.cpu + "% CPU Usage.");
			UI.mem.html( data.mem + '% MEM Usage.');
		}
		socket.emit('update', { time: 1000 });
	}
});
socket.on('saveToDB', function (status, docs) {
	UI.db_change.html('Saved with error equal to \'' + status + '\'');
	if (docs) {
		$.each(docs, function (i, doc) {
			$(df).append( $('<li>').text(doc) );
		});
		UI.list_of_docs.append(UI.df);
	}
});