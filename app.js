
var sysUsage = require('./system-usage');
var worker = require('./worker');
var WebSocketServer = require('ws').Server;
var express = require('express')
var jade = require('jade');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);

app.set('port', process.env.PORT || 5000);
app.set('views', path.resolve(__dirname, 'views'));
app.set('public', path.resolve(__dirname, 'public'));
app.set('json spaces', 4);

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

app.get('/', function (req, res) {
    res.send( jade.renderFile(path.resolve(app.get('views'), 'index.jade'), 
      { title: 'Get usage of system' })
    );
  });

app.get('/summary', function (req, res) {
    worker.getSummary(function (err, summary) {
      if (err) res.json({error: err });
      res.json({response: summary });
    });
  });

server.listen( app.get('port') );

var wss = new WebSocketServer({server: server});
io.on('connection', function (socket) {
  socket.send('update', {});
  socket.on('update', function (data) {
    var timer;
    if (data && data.time) {
      sysUsage.getCurrentCPU(function (cpu) {
        timer = setTimeout(function () {
          sysUsage.calculate(cpu, function (usage) {
            socket.send('update', usage);
            worker.save(usage, function (message) {
              socket.send('saveToDB', message);
              clearTimeout(timer);
            });
          });
        }, data.time);
      });
    } else {
      clearTimeout(timer);
    }
  });
});