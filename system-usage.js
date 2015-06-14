var os = require("os");
var sysUsage = module.exports = {
  _getCurrentCPU: function () {
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();
    var response;

    for (var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[i];
      for (type in cpu.times) {
        totalTick += cpu.times[type];
      }

      totalIdle += cpu.times.idle;
    }

    response = { idle: totalIdle / cpus.length,  total: totalTick / cpus.length };
    
    this.start = this.start || response;

    return response;
  },
  _getCPU: function () {
    var endMeasure = this._getCurrentCPU(); 
    var idleDifference = endMeasure.idle - this.start.idle;
    var totalDifference = endMeasure.total - this.start.total;
    var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    return percentageCPU;
  },
  _getMEM: function () {
    return (process.memoryUsage().rss / os.totalmem() * 100).toFixed(2);
  },
  calculate: function () {
    return { 
      cpu: this._getCPU(),
      mem: this._getMEM()
    }
  }
}