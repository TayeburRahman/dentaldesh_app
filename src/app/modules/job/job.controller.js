const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const { jobService } = require("./job.service");

const createJob = catchAsync(async (req, res) => {
  const result = await jobService.createJobIntoDB(req?.user?.userId, req?.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Job created successfully",
    data: result,
  });
});

const jobControler = {
  createJob,
};

module.exports = { jobControler };
