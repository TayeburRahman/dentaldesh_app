const express = require('express');
const { DriverController } = require('./driver.controller'); 
const auth = require('../../middlewares/auth');
const { ENUM_USER_ROLE } = require('../../../utils/enums');
const { uploadFile } = require('../../middlewares/fileUploader'); 

const router = express.Router();

router.post(
  '/auth/register',
  uploadFile(), 
  DriverController.registerDriver
);

router.post('/auth/activate-driver', DriverController.activateDriver);

router.post(
  '/auth/login', 
  DriverController.loginDriver
);

router.post(
  '/auth/delete-account',
  auth(ENUM_USER_ROLE.DRIVER),
  DriverController.deleteMyAccount
);

router.patch(
  '/auth/change-password',
  auth(ENUM_USER_ROLE.DRIVER),
  DriverController.changePassword
);

router.post('/auth/forgot-password', DriverController.forgotPass);
router.post('/auth/reset-password', DriverController.resetPassword);
router.post('/auth/resend', DriverController.resendActivationCode);
router.post('/auth/verify-otp', DriverController.checkIsValidForgetActivationCode);

router.get(
  '/auth/admin/drivers',
  auth(ENUM_USER_ROLE.ADMIN),
  DriverController.getAllDriver
);

router.get(
  '/auth/profile',
  auth(
    ENUM_USER_ROLE.DRIVER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  DriverController.getSingleDriver
);

router.patch(
  '/auth/edit-profile',
  auth(ENUM_USER_ROLE.DRIVER),
  uploadFile(),
  DriverController.updateProfile
); 

module.exports = router;
