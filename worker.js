var Server = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    moment = require('moment'),
    url = 'mongodb://nick:nick@ds039291.mongolab.com:39291/heroku_c6z290vc',
    worker = module.exports = {
      _connect: function (data, next) {
        var that = this;
        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          that._insert(data, db, function (err) {
            assert.equal(null, err);
            that._removeOldDoc(db, function (err) {
              assert.equal(null, err);
              db.close();
              next(err);
            });
          });
        });
      },
      _insert: function (data, db, next) {
        var collection = db.collection('usage');
        collection.insert([{ creation_at: new Date(), cpu: data.cpu, mem: data.mem }], function (err, result) {
          assert.equal(err, null);
          assert.equal(1, result.result.n);
          assert.equal(1, result.ops.length);
          console.log('saved', result.result.n);
          next(err, collection);
        });
      },
      _removeOldDoc: function (db, next) {
        db.collection('usage', function (err, collection) {
          assert.equal(null, err);
          var duration = moment.duration(24, 'hours');
          var diff = moment().subtract(duration, 'milliseconds');
          var date = new Date(diff.toISOString());

          if (date) {
            collection.remove({ creation_at: { $lte: date}}, function (err, response) {
              assert.equal(null, err);
              // console.log('%s document has been removed!', response.result.n);
              next(err);
            });
          }
        });
      },
      getSummary: function (next) {
        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          db.collection('usage', function (err, collection) {
            assert.equal(null, err);
            var diff = new Date(1970,1,1).getMilliseconds();

            collection.aggregate([
              {
                $group: {
                  '_id': {
                    $subtract: [
                      { $subtract: [ '$creation_at', diff ] },
                      { $mod: [
                        { $subtract: [ '$creation_at', new Date(1970,1,1) ] },
                        1000 * 60 * 60
                      ]}
                    ]
                  },
                  'minCpu': { $min: '$cpu' },
                  'maxCpu': { $max: '$cpu' },
                  'avgCpu': { $avg: '$cpu' },
                  'minMem': { $min: '$mem' },
                  'maxMem': { $max: '$mem' },
                  'avgMem': { $avg: '$mem' }
                }
              },
              {
                $sort: { '_id': -1 }
              },
              {
                $project: {
                  _id: 0,
                  'interval': '$_id',
                  'cpu.min': '$minCpu',
                  'cpu.max': '$maxCpu',
                  'cpu.avg': {
                    $divide: [
                      {
                        $subtract: [
                          { $multiply: ['$avgCpu', 10] },
                          { $mod:[{ $multiply:['$avgCpu',10] }, 1]}
                        ]
                      }, 10
                    ]
                  },
                  'memory.min': '$minMem',
                  'memory.max': '$maxMem',
                  'memory.avg': {
                    $divide: [
                      {
                        $subtract: [
                          { $multiply: ['$avgMem', 10] },
                          { $mod:[{ $multiply:['$avgMem',10] }, 1]}
                        ]
                      }, 10
                    ]
                  }
                }
              }
            ], function (err, result) {
              assert.equal(null, err);
              next(err, result);
              db.close();
            });
          });
        });
      },
      save: function (data, next) {
        this._connect(data, next);
      }
    };