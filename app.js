
var sysUsage = require('./system-usage');
var worker = require('./worker');
var express = require('express')
var jade = require('jade');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
// IO
var server = require('http').Server(app);
var io = require('socket.io')(server);
var os = require('os'); 

app.set('port', process.env.PORT || 5353);
app.set('views', path.resolve(__dirname, 'views'));
app.set('public', path.resolve(__dirname, 'public'));

app.use(express.static( app.get('public') ));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(function (err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: 'Error is occured!!! -> ' + err.message });
    return;
});
app.use(function (req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

// Error handling
app.route('/error')
  .get(function (req, res) {

  });

app.get('/', function (req, res) {
    res.send( jade.renderFile(path.resolve(app.get('views'), 'index.jade'), 
      { title: 'Get usage of system' })
    );
  });

server.listen( app.get('port') );

io.on('connection', function (socket) {
  socket.emit('update', {});
  socket.on('update', function (data) {
    var timer, calc;
    if (data && data.time) {
      timer = setTimeout(function () {
        calc = sysUsage.calculate();
        socket.emit('update', calc);
        worker.save(calc, function (message) {
          socket.emit('saveToDB', message);
        });
      }, data.time);
    } else {
      clearTimeout(timer);
    }
  });
});