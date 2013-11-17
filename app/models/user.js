/* global require */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

/**
 * User Schema
 */
var UserSchema = new Schema({
    oauthID: String,
    name: String,
    email: String,
    username: {
        type: String,
        unique: true
    },
    provider: String,
    salt: String,
    created: Date,
    github: {}
});

module.exports = mongoose.model('User', UserSchema);
