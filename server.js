/* global require */

// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('jMRluCJSxECo879y');

var routes = ['index', 'counter'];
for (var i = routes.length - 1; i >= 0; i--) {
    require('./routes/' + routes[i]);
}
