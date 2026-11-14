const pdfParse = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

const { interviewReportSchema } = generateInterviewReport;

const generateInterviewController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required",
            });
        }

        const { selfDescription, jobDescription } = req.body;

        if (!selfDescription || !selfDescription.trim()) {
            return res.status(400).json({
                message: "Self description is required",
            });
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required",
            });
        }

        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const resume = resumeContent.text;

        if (!resume || !resume.trim()) {
            return res.status(400).json({
                message: "Could not extract text from the resume PDF",
            });
        }

        const interviewReportByAi = await generateInterviewReport({
            resume,
            selfDescription,
            jobDescription
        });

        const validation = interviewReportSchema.safeParse(interviewReportByAi);

        if (!validation.success) {
            return res.status(502).json({
                message: "AI returned an incomplete interview report",
            });
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume,
            selfDescription,
            jobDescription,
            ...validation.data
        });

        return res.status(201).json({
            message: "interview report created successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Interview report generation failed:", error);

        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            message: statusCode === 502
                ? "Failed to generate a valid interview report from the AI service"
                : "Failed to create the interview report",
            error: error.message
        });
    }
};

module.exports = { generateInterviewController };
