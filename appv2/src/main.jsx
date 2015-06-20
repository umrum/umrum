import React from "react";
import Router from "react-router";

import DashboardRouter from "./routers/dashboard";


// ID of the DOM element to mount app on
const DOM_APP_EL_ID = "app-root";

let routes = DashboardRouter.getRoutes();

// Start the router
Router.run(routes, (Handler, state) => {
    React.render(<Handler />, document.getElementById(DOM_APP_EL_ID));
});
