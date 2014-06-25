/**
* Dependencies
*/

var Minifier = require('html-minifier');

/**
 * Render with minified HTML (express + nunjucks)
 * 		Works as a response.method that minifies html string
 * 		after nunjucks.render compiles and callback
 * @param {String} view
 * @param {Object} options
 */

exports.htmlMinify = function(req, res, next) {
	return function(req, res, next) {
		res.renderMinified  = function(view, options) {
			this.render(view, options, function(err, html) {
				if (err) throw err;
		        html = Minifier.minify(html, {
		            removeComments: true,
		            removeCommentsFromCDATA: true,
		            collapseWhitespace: true,
		            collapseBooleanAttributes: true,
		            removeAttributeQuotes: true,
		            removeEmptyAttributes: true
		        });
		        // send response with minified html
		    	res.send(html);
		    });
		}
		next();
	}
}