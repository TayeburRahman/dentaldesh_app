const { UserService } = require("./auth.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync");
const config = require("../../../config");

const registrationUser = catchAsync(async (req, res) => {
  console.log("add", req.body);
  await UserService.registrationUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Please check your email to activate your account",
  });
});

const activateUser = catchAsync(async (req, res) => {
  const result = await UserService.activateUser(req.body);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User activated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserService.getSingleUser(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await UserService.deleteUser(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const loginData = req.body;
  const result = await UserService.loginUser(loginData);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const passwordData = req.body;
  const user = req.user;
  await UserService.changePassword(user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await UserService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const forgotPass = catchAsync(async (req, res) => {
  await UserService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req, res) => {
  const result = await UserService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Success!",
    data: result,
  });
});

const resendActivationCode = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await UserService.resendActivationCode(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await UserService.resetPassword(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account recovered!",
  });
});

const deleteMyAccount = catchAsync(async (req, res) => {
  await UserService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
});

const blockUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await UserService.blockUser(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

const UserController = {
  registrationUser,
  activateUser,
  login,
  deleteMyAccount,
  changePassword,
  forgotPass,
  resetPassword,
  resendActivationCode,
  checkIsValidForgetActivationCode,
  getAllUsers,
  getSingleUser,
  blockUser,
  updateProfile,
  deleteUser,
};

module.exports = { UserController };
