
var CPU = require('./cpu');
var express = require('express')
var jade = require('jade');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

app.set('port', process.env.PORT || 5353);
app.set('views', path.resolve(__dirname, 'views'));
app.set('public', path.resolve(__dirname, 'public'));

app.use(express.static( app.get('public') ));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: 'Error is occured!!! -> ' + err.message });
    return;
});
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

// Error handling
app.route('/error')
  .get(function(req, res) {

  });

// Work with tasks creation
app.get('/', function(req, res) {
    res.send( jade.renderFile(path.resolve(app.get('views'), 'index.jade'), 
      { title: 'Get CPU Usage' })
    );
  });

var server = require('http').Server(app);
var io = require('socket.io')(server);
var cpu_load = require('cpu-load');

server.listen( app.get('port') );

io.on('connection', function (socket) {
  // listen CPU events
  socket.emit('CPU', { time: false });
  socket.on('cpu-event', function (data) {
    if (data && data.time) {
      var timer = setTimeout(function () {
        socket.emit('CPU', { cpu: CPU.run() });
      }, data.time);
    } else {
      timer = null;
    }
  });
});