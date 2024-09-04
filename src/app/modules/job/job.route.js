const express = require("express");
const { jobControler } = require("./job.controller");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const router = express.Router();

router.get("/", jobControler.getAllJobs);
router.post("/create-job", auth(ENUM_USER_ROLE.USER), jobControler.createJob);

module.exports = router;
