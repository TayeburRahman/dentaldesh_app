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

// update job---------------------------------
const updateJobStatusIntoDB = async (user, jobId, status) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job not found");
  }
  let result;
  // when try to accept the job ------------------------------------
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
  // when try to cancel the job --------------------------------------
  if (status === "canceled") {
    console.log("if condition in cancel");
    if (
      job?.status === "in-progress" ||
      job?.status === "completed" ||
      job?.status === "confirmed"
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You cannot cancel the job when the job is confirmed, in-progress, or completed."
      );
    }
    if (user?.role === "USER") {
      result = await job.updateOne({ _id: jobId }, { status: "canceled" });
    }
    if (user?.role === "DRIVER") {
      result = await Job.updateOne(
        { _id: jobId },
        { $pull: { potentialDrivers: { driverId: user?.userId } } },
        { runValidators: true }
      );
    }
    const updatedJob = await Job.findById(jobId);
    if (updatedJob?.potentialDrivers?.length === 0) {
      await Job.updateOne({ _id: jobId }, { status: "pending" });
    }
  }
  return result;
};

//
const confirmJobByUser = async (jobId, doctorId) => {
  const job = await Job.findById(jobId);
  if (job?.status !== "accepted") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can not confirm the job before driver accept the job"
    );
  }
  const result = await Job.updateOne(
    { _id: jobId },
    { status: "confirmed", confirmedDriver: doctorId }
  );
  return result;
};

// start trip service --------------------------------------------------------------
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

// complete destination-------------------------------------------------------------------
const completedDestination = async (jobId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).send({ message: "Job not found" });
  }

  const currentIndex = job.currentDestinationIndex;

  // Check if the current destination is already completed
  if (job.dropOffDestination[currentIndex].completed) {
    return res.status(400).send({ message: "Destination already completed" });
  }

  // Mark the current destination as completed and set the end time
  job.dropOffDestination[currentIndex].completed = true;
  job.dropOffDestination[currentIndex].endTime = new Date();

  // Increment the currentDestinationIndex to move to the next destination, if any
  if (currentIndex + 1 < job.dropOffDestination.length) {
    job.currentDestinationIndex += 1;
  } else {
    // If no more destinations, mark the job as completed
    job.status = "completed";
  }

  await job.save();

  res.send({ message: "Destination marked as completed", job });
};
// some changes
const jobService = {
  createJobIntoDB,
  updateJobStatusIntoDB,
  getAllJobFromDB,
  startTrip,
  completedDestination,
  confirmJobByUser,
};

module.exports = { jobService };
