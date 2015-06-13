var os = require("os");
var cpu = module.exports = {
  _getCurrent: function () {
    var total_idle = 0, total_tick = 0;
    var cpus = os.cpus();
    var response;

    for (var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[i];
      for (type in cpu.times) {
        total_tick += cpu.times[type];
      }

      total_idle += cpu.times.idle;
    }

    response = { idle: total_idle / cpus.length,  total: total_tick / cpus.length };
    
    this.start = this.start || response;

    return response;
  },
  run: function () {
    var endMeasure = this._getCurrent(); 
    var idleDifference = endMeasure.idle - this.start.idle;
    var totalDifference = endMeasure.total - this.start.total;
    var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    return percentageCPU + "% CPU Usage.";
  }
}