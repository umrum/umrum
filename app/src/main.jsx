import React from "react";
import Router from "react-router";

import DashboardRouter from "./routers/dashboard";


// ID of the DOM element to mount app on
const DOM_APP_EL_ID = "app-root";

let routes = DashboardRouter.getRoutes();

let fetchData = function(routes, params) {
  let data = {};

  return Promise.all(routes
    .filter(route => route.handler.fetchData)
    .map(route => {
      return route.handler.fetchData(params).then(resp => {
        data[route.name] = resp;
      })
    })
  ).then(() => data);
}

// Start the router
Router.run(routes, (Handler, state) => {
  fetchData(state.routes, state.params).then((data) => {
    React.render(<Handler data={data} />, document.getElementById(DOM_APP_EL_ID));
  });
});
