/* global require, console, describe, it, before, after */

var assert = require('assert'),
    User = require('../app/models/user')
;

describe('Test the authentication module', function() {

  before(function(done) {
      done();
  });

  after(function(done) {
      User.remove({oauthID: 12345, name: 'testy'}).exec();
      done();
  });

  it('Save user credentials', function(done) {

    var user = new User({
      oauthID: 12345,
      name: 'testy',
      created: Date.now()
    });

    user.save(function(error) {
      if (error) {
        console.log('error' + error.message);
      }else{
        console.log('no error');
      }
      done();
    });

  });

  it('Find a user by username', function(done) {
      User.findOne({ oauthID: 12345, name: "testy" }, function(err, user) {
        assert.equal(user.name, 'testy');
        assert.equal(user.oauthID, 12345);
        done();
      });
  });

});
