const { default: mongoose } = require("mongoose");
const { Schema } = require("zod");

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
    type: string,
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
    type: number,
    required: true,
  },
});
const jobSchema = new Schema({
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
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
