
var sysUsage = require('./system-usage');
var worker = require('./worker');
var express = require('express')
var jade = require('jade');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var refreshTime = 30000;
var timer;

app.set('port', process.env.PORT || 3000);
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
  worker.getLast(function (item) {
    clearInterval(timer);
    timer = false;

    res.send( jade.renderFile(path.resolve(app.get('views'), 'index.jade'), 
      {
        title: 'Get usage of system',
        usage: { cpu: item.cpu, mem: item.mem }
      })
    );
  });
});
app.post('/', function (req, res) {
  sysUsage.getCurrentCPU(function (cpu) {
    timer = timer || setInterval(function () {
      sysUsage.calculate(cpu, function (usage) {
        worker.save(usage, function (message) {
          console.log('Successfully saved!');
        });
      });
    }, refreshTime);
  });
});

app.get('/summary', function (req, res) {
  worker.getSummary(function (err, summary) {
    if (err) res.json({ error: err });
    res.json({ response: summary });
  });
});

app.listen(app.get('port'), function () {
  console.log('Listening on port: ', app.get('port'));
});