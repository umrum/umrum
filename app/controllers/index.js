/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

module.exports.index = function(req, res) {
    res.renderMinified('index.html');
};

module.exports.tester = function(req, res) {
    res.renderMinified('teste.html');
};

module.exports.gettingStarted = function(req, res) {
    res.renderMinified('getting-started.html');
};

module.exports.documentation = function(req, res) {
    res.renderMinified('documentation.html');
};

module.exports.support = function(req, res) {
    res.renderMinified('support.html');
};

module.exports.termsOfService = function(req, res) {
    res.renderMinified('terms-of-service.html');
};

module.exports.privacyPolicy = function(req, res) {
    res.renderMinified('privacy-policy.html');
};
