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
const updateJobStatusIntoDB = async (jobId, payload) => {
  console.log("job id", jobId);
  console.log("payload", payload);
};

const jobService = {
  createJobIntoDB,
  updateJobStatusIntoDB,
  getAllJobFromDB,
};

module.exports = { jobService };
