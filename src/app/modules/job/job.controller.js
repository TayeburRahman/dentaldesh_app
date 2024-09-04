const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const { jobService } = require("./job.service");

const createJob = catchAsync(async (req, res) => {
  const result = await jobService.createJobIntoDB(req?.user?.userId, req?.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

// get all jobs
const getAllJobs = catchAsync(async (req, res) => {
  const result = await jobService.getAllJobFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job retrieved successfully",
    data: result,
  });
});

// update the job status
const updateJobSatus = catchAsync(async (req, res) => {
  const jobId = req?.params?.jobId;
  console.log(req.body);
  const result = await jobService.updateJobStatusIntoDB(
    req?.user,
    jobId,
    req?.body?.status
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job status updated successfully",
    data: result,
  });
});

const jobControler = {
  createJob,
  getAllJobs,
  updateJobSatus,
};

module.exports = { jobControler };
