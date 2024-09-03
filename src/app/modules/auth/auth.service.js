const bcrypt = require('bcrypt');
const ApiError = require('../../../errors/ApiError');
const cron = require('node-cron');
const User = require('./auth.model');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const { jwtHelpers } = require('../../../helpers/jwtHelpers'); 
const httpStatus = require('http-status');
const sendEmail = require('../../../utils/sendEmail');
const { registrationSuccessEmailBody } = require('../../../mails/email.register');
const { ENUM_USER_ROLE } = require('../../../utils/enums');
const { sendResetEmail } = require('../../../utils/sendResetMails'); 
const { logger } = require('../../../shared/logger');

// Registration user
const registrationUser = async (payload) => {
    const { name, email, password, confirmPassword, role } = payload;
    const user = {
        name,
        email,
        password,
        confirmPassword,
        expirationTime: Date.now() + 2 * 60 * 1000,
    }; 

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        throw new ApiError(400, 'Email already exists');
    }
    if (password !== confirmPassword) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Password and Confirm Password didn't match"
        );
    }
    const activationToken = createActivationToken();
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };

    try {
        sendEmail({
            email: user.email,
            subject: 'Activate Your Account',
            html: registrationSuccessEmailBody(data),
        });
    } catch (error) {
        throw new ApiError(500, error.message);
    }
    user.activationCode = activationCode;
   const dataU = await User.create(user);
//    console.log("dataU", dataU)
    return user;
};

// Create activation token
const createActivationToken = () => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return { activationCode };
};

// Activate user
const activateUser = async (payload) => {
    const { activation_code, userEmail } = payload;

    const existUser = await User.findOne({ email: userEmail });
    if (!existUser) {
        throw new ApiError(400, 'User not found');
    }
    if (existUser.activationCode !== activation_code) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match");
    }
    const user = await User.findOneAndUpdate(
        { email: userEmail },
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

    // Create refresh token
    const refreshToken = jwtHelpers.createToken(
        { userId: existUser._id, role: existUser.role },
        config.jwt.refresh_secret,
        config.jwt.refresh_expires_in
    );
    return {
        accessToken,
        refreshToken,
        user,
    };
};

// Scheduled task to delete expired inactive users
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const result = await User.deleteMany({
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

// Get all users
const getAllUsers = async (query) => {
    const userQuery = new User.find()
        .search()
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    return {
        meta,
        data: result,
    };
};

// Get single user
const getSingleUser = async (user) => {
    const result = await User.findById(user.userId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    return result;
};

// Update profile
const updateProfile = async (req) => {
    const { files } = req;
    const { userId } = req.user;
    const checkValidUser = await User.findById(userId);
    if (!checkValidUser) {
        throw new ApiError(404, 'You are not authorized');
    }

    let profile_image = undefined;
    if (files && files.profile_image) {
        profile_image = `/images/image/${files.profile_image[0].filename}`;
    }

    const data = req.body;
    if (!data) {
        throw new Error('Data is missing in the request body!');
    }

    const isExist = await User.findOne({ _id: userId });

    if (!isExist) {
        throw new ApiError(404, 'User not found!');
    }

    const updatedUserData = { ...data };

    const result = await User.findOneAndUpdate(
        { _id: userId },
        { profile_image, ...updatedUserData },
        {
            new: true,
        }
    );
    return result;
};

// Delete user
const deleteUser = async (id) => {
    const result = await User.findByIdAndDelete(id);
    return result;
};

// Login user
const loginUser = async (payload) => {
    const { email, password } = payload;

    const isUserExist = await User.isUserExist(email);
    const checkUser = await User.findOne({ email });
    if (!isUserExist) {
        throw new ApiError(404, 'User does not exist');
    }

    if (isUserExist.password && !(await User.isPasswordMatched(password, isUserExist.password))) {
        throw new ApiError(402, 'Password is incorrect');
    }
    if (isUserExist.isActive === false) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            'Please activate your account then try to login'
        );
    }

    const { _id: userId, role } = isUserExist;
    const accessToken = jwtHelpers.createToken(
        { userId, role, conversationId: checkUser?.conversationId },
        config.jwt.secret,
        config.jwt.expires_in
    );
    // Create refresh token
    const refreshToken = jwtHelpers.createToken(
        { userId, role },
        config.jwt.refresh_secret,
        config.jwt.refresh_expires_in
    );

    return {
        id: checkUser?._id,
        conversationId: checkUser?.conversationId,
        isPaid: checkUser?.isPaid,
        accessToken,
        refreshToken,
    };
};

// Delete my account
const deleteMyAccount = async (payload) => {
    const { email, password } = payload;

    const isUserExist = await User.isUserExist(email);
    if (!isUserExist) {
        throw new ApiError(404, 'User does not exist');
    }

    if (isUserExist.password && !(await User.isPasswordMatched(password, isUserExist.password))) {
        throw new ApiError(402, 'Password is incorrect');
    }
    return await User.findOneAndDelete({ email });
};

// Change password
const changePassword = async (user, payload) => {
    const { userId } = user;
    const { oldPassword, newPassword, confirmPassword } = payload;
    if (newPassword !== confirmPassword) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Password and Confirm password do not match'
        );
    }
    const isUserExist = await User.findOne({ _id: userId }).select('+password');
    if (!isUserExist) {
        throw new ApiError(404, 'User does not exist');
    }
    if (isUserExist.password && !(await User.isPasswordMatched(oldPassword, isUserExist.password))) {
        throw new ApiError(402, 'Old password is incorrect');
    }
    isUserExist.password = newPassword;
    await isUserExist.save();
};

// Forgot password
const forgotPass = async (payload) => {
    const user = await User.findOne(
        { email: payload.email },
        { _id: 1, role: 1 }
    );

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
    }

    let profile = null;
    if (user.role === ENUM_USER_ROLE.USER) {
        profile = await User.findOne({ _id: user._id });
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

const resendActivationCode = async (payload) => {
    const email = payload.email;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
    }

    let profile = null;
    if (user.role === ENUM_USER_ROLE.USER) {
        profile = await User.findOne({ _id: user._id });
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

const forgetActivationCode = () => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    return activationCode;
};

const checkIsValidForgetActivationCode = async (payload) => {
    const user = await User.findOne({ email: payload.email });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User does not exist!');
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

const resetPassword = async (req) => {
    const { userId } = req.user;
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Password didn't match");
    }
    const user = await User.findOne({ _id: userId }, { _id: 1 });

    if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User not found!');
    }

    const password = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    await User.updateOne({ _id: userId }, { password }, { new: true });
    user.verifyCode = null;
    user.verifyExpire = null;
    await user.save();
};

const blockUser = async (id) => {
    const isUserExist = await User.findById(id);
    if (!isUserExist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No User Found');
    }
    const result = await User.findByIdAndUpdate(
        { _id: id },
        { is_block: !isUserExist.is_block },
        { new: true }
    );

    return result;
};


const UserService = {
    getAllUsers,
    getSingleUser,
    deleteUser,
    registrationUser,
    loginUser,
    changePassword,
    updateProfile,
    forgotPass,
    resetPassword,
    activateUser,
    deleteMyAccount,
    checkIsValidForgetActivationCode,
    resendActivationCode,
    blockUser,
};

module.exports = {UserService};

