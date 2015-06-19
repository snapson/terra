var os = require('os');
var sysUsage = module.exports = {
  getCurrentCPU: function (next) {
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
    next({ idle: totalIdle / cpus.length,  total: totalTick / cpus.length });
  },
  _getCPU: function (startMeasure, next) {
    this.getCurrentCPU(function (endMeasure) {
      var idleDifference = endMeasure.idle - startMeasure.idle;
      var totalDifference = endMeasure.total - startMeasure.total;
      var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

      next(percentageCPU);
    });
  },
  _getMEM: function () {
    return +(process.memoryUsage().rss / os.totalmem() * 100).toFixed(2);
  },
  calculate: function (startMeasure, next) {
    var that = this;

    that._getCPU(startMeasure, function (cpu) {
      next({ cpu: cpu, mem: that._getMEM() });
    });
  }
}