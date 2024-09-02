const express = require('express');
const router = express.Router();

// Define routes
const moduleRoutes = [
  // Uncomment and define your routes here
  // {
  //   path: '/auth',
  //   route: require('./authRoutes'),
  // },
  // {
  //   path: '/auth/driver',
  //   route: require('./driverRoutes'),
  // },
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
