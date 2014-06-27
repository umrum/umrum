/**
* Dependencies
*/

var Minifier = require('html-minifier');

/**
* Render with minified HTML (express + nunjucks)
*   Works as a response.method that minifies html string
*   after nunjucks.render compiles and callback
* @param {String} view
* @param {Object} options
*/

module.exports = exports = function(req, res, next) {
    var render = res.render;
    res.render = function(view, options) {
        render.call(this, view, options, function(err, html) {
            if (err) throw err;
            html = Minifier.minify(html, {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeEmptyAttributes: true
            });
            res.send(html);
        });
    };
    next();
};