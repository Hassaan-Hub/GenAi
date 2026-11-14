const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const { generateInterviewController } = require("../controllers/interviewController");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description, resume pdf and job description.
 * @access privat
 */
interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewController);

module.exports = interviewRouter;
