var Server = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    moment = require('moment'),
    url = 'mongodb://nick:nick@localhost:27017/terra',
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
        collection.insert([{ date: new Date(), cpu: data.cpu, mem: data.mem }], function (err, result) {
          assert.equal(err, null);
          assert.equal(1, result.result.n);
          assert.equal(1, result.ops.length);
          next(err, collection);
        });
      },
      _removeOldDoc: function (db, next) {
        db.collection('usage', function (err, collection) {
          collection.find({}, { sort: {_id: 1}, limit: 1}).toArray(function (err, doc) {
            var moments = {
              current: moment(),
              last_date: moment(doc[0].date)
            };
            var diff = moments.current.diff(moments.last_date, 'hours');
            // console.log('The diff is ', diff);
            if (diff >= 24) { // Older than 24 hours
              collection.remove({ date: doc[0].date }, function(err, response) {
                assert.equal(null, err);
                assert.equal(1, response.result.n);
                // console.log('%s document has been removed!', response.result.n);
                next(err);
              });
            } else { next(); }
          });
        });
      },
      save: function (data, next) {
        this._connect(data, next);
      }
    };