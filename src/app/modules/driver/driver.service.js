const bcrypt = require('bcrypt');
const ApiError = require('../../../errors/ApiError');
const cron = require('node-cron');
const {jwtHelpers} = require('../../../helpers/jwtHelpers');
const config = require('../../../config');
const Driver = require('./driver.model');
const httpStatus = require('http-status');
const sendEmail = require('../../../utils/sendEmail');
const { registrationSuccessEmailBody } = require('../../../mails/email.register'); 
const sendResetEmail = require('../../../utils/sendResetMails');
const logger = require('../../../shared/logger'); 

//!
const registerDriver = async (req) => {
  const { files } = req;
  const payload = req.body;
  const { name, email, password, confirmPassword } = payload;

  payload.expirationTime = Date.now() + 2 * 60 * 1000;

  const isEmailExist = await Driver.findOne({ email });

  if (isEmailExist) {
    throw new ApiError(400, 'Email already exists');
  }

  if (confirmPassword !== password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
  }

  if (files) {
    if (files.licenseFrontImage) {
      payload.licenseFrontImage = `/images/licenses/${files.licenseFrontImage[0].filename}`;
    }
    if (files.licenseBackImage) {
      payload.licenseBackImage = `/images/licenses/${files.licenseBackImage[0].filename}`;
    }
    if (files.truckDocumentImage) {
      payload.truckDocumentImage = `/images/trucks/${files.truckDocumentImage[0].filename}`;
    }
    if (files.truckImage) {
      payload.truckImage = `/images/trucks/${files.truckImage[0].filename}`;
    }
  }

  const activationToken = createActivationToken();
  const activationCode = activationToken.activationCode;
  const data = { user: { name: name }, activationCode };

  try {
    sendEmail({
      email: email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(data),
    });
  } catch (error) {
    throw new ApiError(500, `${error.message}`);
  }
  payload.activationCode = activationCode;
  return await Driver.create(payload);
};

//!
const updateProfile = async (req) => {
  const { files } = req;
  const { userId } = req.user;
  const data = req.body;

  const checkValidDriver = await Driver.findById(userId);
  if (!checkValidDriver) {
    throw new ApiError(404, 'You are not authorized');
  }

  if (files) {
    if (files.licenseFrontImage) {
      data.licenseFrontImage = `/images/licenses/${files.licenseFrontImage[0].filename}`;
    }
    if (files.licenseBackImage) {
      data.licenseBackImage = `/images/licenses/${files.licenseBackImage[0].filename}`;
    }
    if (files.truckDocumentImage) {
      data.truckDocumentImage = `/images/trucks/${files.truckDocumentImage[0].filename}`;
    }
    if (files.truckImage) {
      data.truckImage = `/images/trucks/${files.truckImage[0].filename}`;
    }
    if (files.profile_image) {
      data.profile_image = `/images/image/${files.profile_image[0].filename}`;
    }
  }

  const updatedUserData = { ...data };

  const result = await Driver.findOneAndUpdate(
    { _id: userId },
    { ...updatedUserData },
    {
      new: true,
    }
  );
  return result;
};

//!
const createActivationToken = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return { activationCode };
};

//!
const activateDriver = async (payload) => {
  const { code, email } = payload;

  const existUser = await Driver.findOne({ email: email });
  if (!existUser) {
    throw new ApiError(400, 'Driver not found!');
  }
  if (existUser.activationCode !== code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match");
  }
  const driver = await Driver.findOneAndUpdate(
    { email: email },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  );

  const accessToken = jwtHelpers.createToken(
    {
      userId: existUser._id,
      role: existUser.role,
    },
    config.jwt.secret,
    config.jwt.expires_in
  );
  //Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId: existUser._id, role: existUser.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );
  return {
    accessToken,
    refreshToken,
    driver,
  };
};

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Driver.deleteMany({
      isActive: false,
      expirationTime: { $lte: now },
    });
    if (result.deletedCount > 0) {
      logger.info(`Deleted ${result.deletedCount} expired inactive users`);
    }
  } catch (error) {
    logger.error('Error deleting expired users:', error);
  }
});

//!
const getAllDriver = async (query) => {
  const driverQuery = new  Driver.find() 
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await driverQuery.modelQuery;
  const meta = await driverQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

//!
const getSingleDriver = async (user) => {
  const result = await Driver.findById(user?.userId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found');
  }

  return result;
};

//!
const deleteDriver = async (id) => {
  const result = await Driver.findByIdAndDelete(id);

  return result;
};

//!
const loginDriver = async (payload) => {
  const { email, password } = payload;

  const isDriverExist = await Driver.isDriverExist(email);
  const checkDriver = await Driver.findOne({ email });
  if (!isDriverExist) {
    throw new ApiError(404, 'Driver does not exist');
  }

  if (
    isDriverExist.password &&
    !(await Driver.isPasswordMatched(password, isDriverExist.password))
  ) {
    throw new ApiError(402, 'Wrong credentials');
  }
  if (isDriverExist.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please activate your account then try to login');
  }

  const { _id: userId, role } = isDriverExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret,
    config.jwt.expires_in
  );
  //Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    id: checkDriver?._id,
    driver: checkDriver,
    accessToken,
    refreshToken,
  };
};

//!
const deleteMyAccount = async (payload) => {
  const { email, password } = payload;

  const isDriverExist = await Driver.isDriverExist(email);
  if (!isDriverExist) {
    throw new ApiError(404, 'Driver does not exist');
  }

  if (
    isDriverExist.password &&
    !(await Driver.isPasswordMatched(password, isDriverExist.password))
  ) {
    throw new ApiError(402, 'Password is incorrect');
  }
  return await Driver.findOneAndDelete({ email });
};

//!
const changePassword = async (user, payload) => {
  const { userId } = user;
  const { oldPassword, newPassword, confirmPassword } = payload;
  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password and Confirm password do not match');
  }
  const isDriverExist = await Driver.findOne({ _id: userId }).select('+password');
  if (!isDriverExist) {
    throw new ApiError(404, 'Driver does not exist');
  }
  if (
    isDriverExist.password &&
    !(await Driver.isPasswordMatched(oldPassword, isDriverExist.password))
  ) {
    throw new ApiError(402, 'Old password is incorrect');
  }
  isDriverExist.password = newPassword;
  await isDriverExist.save();
};

const forgotPass = async (payload) => {
    const user = await Driver.findOne({ email: payload.email }, { _id: 1, role: 1 });
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Driver does not exist!');
    }
  
    let profile = null;
    if (user.role === 'DRIVER') {
      profile = await Driver.findOne({ _id: user._id });
    }
  
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile not found!');
    }
  
    if (!profile.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found!');
    }
  
    const activationCode = forgetActivationCode();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    user.verifyCode = activationCode;
    user.verifyExpire = expiryTime;
    await user.save();
  
    sendResetEmail(
      profile.email,
      `
        <div>
          <p>Hi, ${profile.name}</p>
          <p>Your password reset Code: ${activationCode}</p>
          <p>Thank you</p>
        </div>
      `
    );
  };
  
  //!
  const resendActivationCode = async (payload) => {
    const email = payload.email;
    const user = await Driver.findOne({ email });
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Driver does not exist!');
    }
  
    let profile = null;
    if (user.role === 'DRIVER') {
      profile = await Driver.findOne({ _id: user._id });
    }
  
    if (!profile) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile not found!');
    }
  
    if (!profile.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found!');
    }
  
    const activationCode = forgetActivationCode();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    user.verifyCode = activationCode;
    user.verifyExpire = expiryTime;
    await user.save();
  
    sendResetEmail(
      profile.email,
      `
        <div>
          <p>Hi, ${profile.name}</p>
          <p>Your password reset Code: ${activationCode}</p>
          <p>Thank you</p>
        </div>
      `
    );
  };
  
  //!
  const forgetActivationCode = () => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return activationCode;
  };
  
  //!
  const checkIsValidForgetActivationCode = async (payload) => {
    const user = await Driver.findOne({ email: payload.email });
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Driver does not exist!');
    }
  
    if (user.verifyCode !== payload.code) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid reset code!');
    }
  
    const currentTime = new Date();
    if (currentTime > user.verifyExpire) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Reset code has expired!');
    }
  
    return { valid: true };
  };
  
  //!
  const resetPassword = async (payload) => {
    const { email, newPassword, confirmPassword } = payload;
    if (newPassword !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password didn't match");
    }
    const user = await Driver.findOne({ email }, { _id: 1 });
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
    }
  
    const password = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
  
    await Driver.updateOne({ email }, { password }, { new: true });
    user.verifyCode = null;
    user.verifyExpire = null;
    await user.save();
  };
  
  //!
  const blockDriver = async (id) => {
    const isDriverExist = await Driver.findById(id);
    if (!isDriverExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Driver Found');
    }
    const result = await Driver.findByIdAndUpdate(
      { _id: id },
      { is_block: !isDriverExist.is_block },
      { new: true }
    );
  
    return result;
  };
  
  


  const DriverService = {
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
  
  module.exports = { DriverService };