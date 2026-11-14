const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  httpOptions: {
    apiVersion: "v1beta",
  },
});

const interviewQuestionSchema = z.object({
  question: z.string().min(1).describe("An interview question relevant to the candidate and the job"),
  intention: z.string().min(1).describe("What the interviewer intends to assess with this question"),
  answer: z.string().min(1).describe("How to answer this question, including the points and approach to cover"),
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Realistic match score between the candidate and the job description, from 0 to 100"),
  technicalQuestions: z
    .array(interviewQuestionSchema)
    .min(8)
    .describe("At least 8 technical questions based on the candidate's skills and the job requirements"),
  behavioralQuestions: z
    .array(interviewQuestionSchema)
    .min(5)
    .describe("At least 5 behavioral questions relevant to the role"),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().min(1).describe("A skill required by the job that the candidate lacks evidence for"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity of the skill gap"),
      })
    )
    .min(3)
    .describe("At least 3 skill gaps supported by comparing the resume/self-description with the job description"),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7).describe("Day number from 1 to 7"),
        focus: z.string().min(1).describe("The main focus of that day"),
        tasks: z.array(z.string().min(1)).min(1).describe("Actionable tasks for that day"),
      })
    )
    .length(7)
    .describe("A practical 7-day interview preparation plan"),
});

class InterviewReportGenerationError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "InterviewReportGenerationError";
    this.statusCode = 502;
  }
}

function buildPrompt({ resume, selfDescription, jobDescription }) {
  return `
You are an expert technical interviewer and career coach.

Analyze the candidate's resume, self-description, and the job description below, then generate a complete interview preparation report.

Resume:
${resume}

Self-Description:
${selfDescription}

Job Description:
${jobDescription}

Rules:
- Base every output only on evidence from the provided resume, self-description, and job description. Do not invent skills, experience, or qualifications.
- matchScore must be a realistic integer between 0 and 100 based on the candidate's demonstrated skills versus the job requirements.
- Provide at least 8 technical questions that could be asked for this specific role and candidate. Each question must include question, intention, and answer.
- Provide at least 5 behavioral questions relevant to the role. Each question must include question, intention, and answer.
- Identify at least 3 skill gaps only when they are supported by comparing the candidate's information with the job requirements. Each gap must include skill and severity (low, medium, or high).
- Provide a practical 7-day preparation plan. Each day must include day (1-7), focus, and at least one actionable task.
- Return only JSON that conforms to the provided response schema.
`;
}

function parseInterviewReport(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new InterviewReportGenerationError("Gemini returned an empty response");
  }

  const cleanedText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsedReport;
  try {
    parsedReport = JSON.parse(cleanedText);
  } catch (error) {
    throw new InterviewReportGenerationError(`Gemini returned invalid JSON: ${error.message}`, {
      cause: error,
    });
  }

  const validation = interviewReportSchema.safeParse(parsedReport);
  if (!validation.success) {
    const details = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "report"}: ${issue.message}`)
      .join("; ");
    throw new InterviewReportGenerationError(`Gemini returned an incomplete or invalid report: ${details}`);
  }

  return validation.data;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const prompt = buildPrompt({ resume, selfDescription, jobDescription });

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(interviewReportSchema),
      },
    });
  } catch (error) {
    throw new InterviewReportGenerationError("Failed to generate the interview report with Gemini", {
      cause: error,
    });
  }

  return parseInterviewReport(response.text);
}

module.exports = generateInterviewReport;
module.exports.interviewReportSchema = interviewReportSchema;
module.exports.InterviewReportGenerationError = InterviewReportGenerationError;
