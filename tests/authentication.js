/* global describe, it, before, after */

var assert = require('assert'),
    mongoose = require('mongoose'),
    env = require('../app/config/env'),
    User = require('../app/models/user')
;

describe('Test the authentication module', function() {

    before(function(done) {
        mongoose.connection.on('connected', done);
        try{
            this.timeout(3 * 1000);
            mongoose.connect(env.MONGO_URI);
        } catch(err){}
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
            assert.equal(error, null);
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
