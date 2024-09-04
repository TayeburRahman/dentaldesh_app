const sendResponse = require('../../../shared/sendResponse');
const catchAsync = require('../../../shared/catchasync');
const config = require('../../../config');
const {DriverService}= require('./driver.service');

const registerDriver = catchAsync(async (req, res) => { 
  await DriverService.registerDriver(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Please check your email to activate your account`,
  });
});

const activateDriver = catchAsync(async (req, res) => {
  const result = await DriverService.activateDriver(req.body);
  const { refreshToken } = result;
  // Set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Driver activated successfully',
    data: result,
  });
});

const getAllDriver = catchAsync(async (req, res) => {
  const result = await DriverService.getAllDriver(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Drivers retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleDriver = catchAsync(async (req, res) => {
  const result = await DriverService.getSingleDriver(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Driver retrieved successfully',
    data: result,
  });
});

const deleteDriver = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await DriverService.deleteDriver(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Driver deleted successfully',
    data: result,
  });
});

const loginDriver = catchAsync(async (req, res) => {
  const loginData = req.body;
  const result = await DriverService.loginDriver(loginData);
  const { refreshToken } = result;

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Driver logged in successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const passwordData = req.body;
  const driver = req.user;
  await DriverService.changePassword(driver, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully!',
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await DriverService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const forgotPass = catchAsync(async (req, res) => {
  await DriverService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check your email!',
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req, res) => {
  const result = await DriverService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Success!',
    data: result,
  });
});

const resendActivationCode = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await DriverService.resendActivationCode(data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Resent successfully',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await DriverService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account recovered!',
  });
});

const deleteMyAccount = catchAsync(async (req, res) => {
  await DriverService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Account deleted!',
  });
});

const blockDriver = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await DriverService.blockDriver(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Driver blocked successfully',
    data: result,
  });
});
 
 
 

const DriverController = {
  getAllDriver,
  getSingleDriver,
  deleteDriver,
  registerDriver,
  loginDriver,
  changePassword,
  updateProfile,
  forgotPass,
  resetPassword,
  activateDriver,
  deleteMyAccount,
  checkIsValidForgetActivationCode,
  resendActivationCode,
  blockDriver, 
};

module.exports = { DriverController };
