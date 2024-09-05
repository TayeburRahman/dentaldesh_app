const express = require("express");
const { jobController } = require("./job.controller");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const router = express.Router();

router.get("/", jobController.getAllJobs);
router.post("/create-job", auth(ENUM_USER_ROLE.USER), jobController.createJob);
router.patch(
  "/update-job-status/:jobId",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DRIVER),
  jobController.updateJobStatus
);
router.patch(
  "/confirm-job/:jobId",
  auth(ENUM_USER_ROLE.USER),
  jobController.confirmJobByUser
);
router.post("/start-trip/:jobId", jobController.startTrip);
router.post("/complete-destination/:jobId");
module.exports = router;
