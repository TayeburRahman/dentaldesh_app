const express = require('express');
const router = express.Router(); 
const AuthRoutes = require('../modules/auth/auth.routes');
const AdminRoutes = require('../modules/admin/admin.routes');
const DriverRoutes = require('../modules/driver/driver.router');
const ManageRoutes = require('../modules/manage-web/manage.routes');  
const jobRoutes = require("../modules/job/job.route");

// Define routes
const moduleRoutes = [
  {
    path: "/user",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes, // Adjusted for admin routes
  },
  {
    path: "/driver",
    route: DriverRoutes,
  },
  {
    path: "/job",
    route: jobRoutes,
  },
  // {
  //   path: '/message',
  //   route: require('./messageRoutes'),
  // },
  // {
  //   path: '/notification',
  //   route: require('./notificationRoutes'),
  // },
  {
    path: '/manage',
    route: ManageRoutes,
  },
];

// Apply routes to the router
moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
