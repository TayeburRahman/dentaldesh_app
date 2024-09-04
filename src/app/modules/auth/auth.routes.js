const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { uploadFile } = require("../../middlewares/fileUploader");
const { UserController } = require("../auth/auth.controller");

const router = express.Router();

// User routes
router.post("/auth/register", UserController.registrationUser);
router.post("/auth/activate-user", UserController.activateUser);
router.post("/auth/login", UserController.login);
router.delete(
  "/auth/delete-account",
  auth(ENUM_USER_ROLE.USER),
  UserController.deleteMyAccount
);
router.patch(
  "/auth/change-password",
  auth(ENUM_USER_ROLE.USER),
  UserController.changePassword
);
router.post("/auth/forgot-password", UserController.forgotPass);
router.post(
  "/auth/reset-password",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.resetPassword
);
router.post("/auth/resend", UserController.resendActivationCode);
router.post(
  "/auth/verify-otp",
  UserController.checkIsValidForgetActivationCode
);

// IDS Work routes
router.get(
  "/auth/profile",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getSingleUser
);

router.patch(
  "/auth/edit-profile",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  UserController.updateProfile
);

// Admin routes
router.get(
  "/auth/get_all",
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getAllUsers
);

router.patch(
  "//auth/user-block/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.blockUser
);

module.exports = router;
