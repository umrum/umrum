var index = require('../controllers/index');

module.exports = function(app){
    app.get('/', index.index);
    app.get('/getting-started', index.gettingStarted);
    app.get('/documentation', index.documentation);
    app.get('/support', index.support);
    app.get('/terms-of-service', index.termsOfService);
    app.get('/privacy-policy', index.privacyPolicy);
};
