const auth = require('../../middlewares/auth');
const express = require('express');
const { ENUM_USER_ROLE } = require('../../../utils/enums');
const { uploadFile } = require('../../middlewares/fileUploader');
const { AdminController } = require('../admin/admin.controller');


const router = express.Router();
//! Admin Authentication Start
// router.post(
//     '/auth/register',
//     AdminController.registrationUser,
//   );
  
  
  module.exports = router;