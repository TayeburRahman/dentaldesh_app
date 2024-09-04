const { default: mongoose, Types, Schema } = require("mongoose");

const destinationSchema = {
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
};

const potentialDriverSchema = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
  },
  acceptedAt: {
    type: Date,
    default: Date.now,
  },
});
const dropOffDestinationSchema = new Schema({
  destination: {
    type: destinationSchema,
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  additionalDetails: {
    type: String,
    required: true,
  },
});
const packageDetailsSchema = new Schema({
  packageName: {
    type: String,
    required: true,
  },
  packageQuantity: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
});
const jobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  picupDestination: {
    type: destinationSchema,
    required: true,
  },
  dropOffDestination: [
    {
      type: dropOffDestinationSchema,
      required: true,
    },
  ],
  packageDetails: {
    type: packageDetailsSchema,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "confirmed", "completed", "canceled"],
  },
  potentialDrivers: [
    {
      type: potentialDriverSchema,
      default: [],
    },
  ],
  confirmedDriver: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
