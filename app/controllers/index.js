/**
 * Module dependencies.
 */
module.exports.index = function(req, res) {
    res.render('index.html');
};

module.exports.gettingStarted = function(req, res) {
    res.render('getting-started.html');
};

module.exports.documentation = function(req, res) {
    res.render('documentation.html');
};

module.exports.support = function(req, res) {
    res.render('support.html');
};

module.exports.termsOfService = function(req, res) {
    res.render('terms-of-service.html');
};

module.exports.privacyPolicy = function(req, res) {
    res.render('privacy-policy.html');
};
