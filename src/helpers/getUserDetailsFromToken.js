const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../errors/ApiError');
const Admin = require('../app/modules/admin/admin.model');

const getUserDetailsFromToken = async (token) => {
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid token');
  }
  
//   console.log(config.jwt_access_secret)
  // Verify and decode the token
  const decode = await jwt.verify(token, config.jwt.secret);
  let user;
 if(decode?.role && decode?.role){
user = await Admin.findById(decode?.userId);
 }
  
  return user;
};

module.exports = getUserDetailsFromToken;
