/* global module */

module.exports = function(app){
    app.use(function(req, res) {
        res.status(404);
        res.render('error.html', {
            statusCode: 404,
            statusMessage: 'Page not found'
        });
    });
};
