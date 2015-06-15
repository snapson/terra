var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    url = 'mongodb://nick:nick@localhost:27017/terra',
    worker = module.exports = {
      _connect: function (data, next) {
        var that = this;
        MongoClient.connect(url, function (err, db) {
          assert.equal(null, err);
          that._insert(data, db, function (err) {
            // TODO: need to send docs variable
            next(err ? false : true);

            db.close();
          });
        });
      },
      _insert: function (data, db, next) {
        var collection = db.collection('usage');

        // Get all data in db
        this._getAll(collection, function (docs) {
          docs.forEach(function (doc) { console.log(doc); });
        });

        collection.insert([{ date: new Date(), cpu: data.cpu, mem: data.mem }], function (err, result) {
          assert.equal(err, null);
          assert.equal(1, result.result.n);
          assert.equal(1, result.ops.length);
          next(err);
        });
      },
      _getAll: function (collection, next) {
        collection.find({}, function (err, docs) {
          if (!err) next(docs);
        });
      },
      save: function (data, next) {
        this._connect(data, next);
      }
    };