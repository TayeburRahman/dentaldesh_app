const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../../../config');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: false,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: 'DRIVER',
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    drivingLicenseNumber: {
      type: String,
      required: false,
    },
    drivingLicenseExpireDate: {
      type: Date,
      required: false,
    },
    profile_image: {
      type: String,
      default:
        'https://res.cloudinary.com/arafatleo/image/upload/v1720600946/images_1_dz5srb.png',
    },
    licenseFrontImage: {
      type: String,
      required: false,
    },
    licenseBackImage: {
      type: String,
      required: false,
    },
    truckRegistrationNumber: {
      type: String,
      required: false,
    },
    truckDocumentImage: {
      type: String,
      required: false,
    },
    truckImage: {
      type: String,
      required: false,
    },
    truckSize: {
      type: String,
      // required: false,
    },
    truckType: {
      type: String,
      // required: false,
    },
    cargoCapacity: {
      type: String,
      // required: false,
    },
    services: {
      type: [String],
      required: false,
    },
    kmForPrice: {
      type: String,
      required: false,
    },
    bankAccountNumber: {
      type: String,
      required: false,
    },
    bankName: {
      type: String,
      required: false,
    },
    routingNumber: {
      type: String,
      required: false,
    },
    accountHolderName: {
      type: String,
      required: false,
    },
    verifyCode: {
      type: String,
    },
    activationCode: {
      type: String,
    },
    verifyExpire: {
      type: Date,
    },
    expirationTime: { type: Date, default: () => Date.now() + 2 * 60 * 1000 },
    isActive: {
      type: Boolean,
      default: false,
    },
    is_block: {
      type: Boolean,
      default: false,
    },
    location: {
      type: locationSchema,
    },
  },
  {
    timestamps: false,
  },
);

driverSchema.statics.isDriverExist = async function (email) {
  return await this.findOne(
    { email },
    {
      _id: 1,
      email: 1,
      password: 1,
      role: 1,
      phoneNumber: 1,
    },
  );
};

driverSchema.statics.isPasswordMatched = async function (givenPassword, savedPassword) {
  return await bcrypt.compare(givenPassword, savedPassword);
};

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
