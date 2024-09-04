const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const Job = require("./job.modal");

const createJobIntoDB = async (userId, payload) => {
  payload.user = userId;
  const result = await Job.create(payload);
  return result;
};
// get all jobs
const getAllJobFromDB = async () => {
  const result = await Job.find();
  return result;
};

// update job
const updateJobStatusIntoDB = async (user, jobId, status) => {
  console.log("user", user);
  let result;
  if (status === "accepted") {
    if (user?.role !== "DOCTOR") {
      throw new ApiError(httpStatus.BAD_REQUEST, "You are not authorized");
    }
    result = await Job.updateOne(
      { _id: jobId },
      {
        status: "accepted",
        $push: { potentialDrivers: { driverId: user?.userId } },
      }
    );
  }
  return result;
};

const jobService = {
  createJobIntoDB,
  updateJobStatusIntoDB,
  getAllJobFromDB,
};

module.exports = { jobService };
