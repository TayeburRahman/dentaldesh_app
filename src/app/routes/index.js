const express = require('express');
const router = express.Router(); 
const AuthRoutes = require('../modules/auth/auth.routes');
const AdminRoutes = require('../modules/admin/admin.routes');
const DriverRoutes = require('../modules/driver/driver.router');

// Define routes
const moduleRoutes = [ 
  {
    path: '/user',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes , // Adjusted for admin routes
  },
  {
    path: '/driver',
    route: DriverRoutes,
  },
  // {
  //   path: '/message',
  //   route: require('./messageRoutes'),
  // },
  // {
  //   path: '/notification',
  //   route: require('./notificationRoutes'),
  // },
];

// Apply routes to the router
moduleRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
