var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    url = 'mongodb://localhost:27017/zubarets-org-ua',
    worker = module.exports = {
      _connect: function (data, next) {
        var that = this;
        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          that._insert(data, db, function (err, result) { 
            next(err ? false : true);
            db.close();
          });
        });
      },
      _insert: function (data, db, next) {
        var collection = db.collection('usage');
        collection.insert([{ date: new Date(), cpu: data.cpu, mem: data.mem }], function (err, result) {
          assert.equal(err, null);
          assert.equal(1, result.result.n);
          assert.equal(1, result.ops.length);
          next(err, result);
        });

        // TODO: Get full list of saved data
      },
      save: function (data, next) {
        this._connect(data, next);
      }
    };