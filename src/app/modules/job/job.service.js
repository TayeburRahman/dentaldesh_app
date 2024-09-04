const Job = require("./job.modal");

const createJobIntoDB = async (userId, payload) => {
  payload.user = userId;
  const result = await Job.create(payload);
  return result;
};

const jobService = {
  createJobIntoDB,
};

module.exports = { jobService };
