var mongoose = require('mongoose'),
    Schema = mongoose.Schema
;

/**
 * User Schema
 */
var SiteSchema = new Schema({
    host: String,
    creator: String,
    created: Date,
    companies: []
});

module.exports = mongoose.model('Site', SiteSchema);
