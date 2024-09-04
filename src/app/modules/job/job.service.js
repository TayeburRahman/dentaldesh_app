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
    if (user?.role !== "DRIVER") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You are not authorized to accept the job"
      );
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

const startTrip = async (jobId, destinationIndex) => {
  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).send({ message: "Job not found" });
  }

  const destination = job.dropOffDestination[destinationIndex];

  // Check if the destination is already started or completed
  if (destination.startTime) {
    return res
      .status(400)
      .send({ message: "Trip for this destination has already started" });
  }

  // Set the start time for this destination
  job.dropOffDestination[destinationIndex].startTime = new Date();

  await job.save();

  res.send({ message: "Trip started for destination", job });
};

const jobService = {
  createJobIntoDB,
  updateJobStatusIntoDB,
  getAllJobFromDB,
};

module.exports = { jobService };
