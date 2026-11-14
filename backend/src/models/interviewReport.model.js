const mongoose = require('mongoose');



const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
    },
    intention: {
        type: String,
        required: [true, 'Intention is required'],
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
    }
}, { _id: false });


const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
    },
    intention: {
        type: String,
        required: [true, 'Intention is required'],
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
    }
}, { _id: false });

const skillGapsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, 'Skill is required'],
    },
    severity: {
        type: String,
        required: [true, 'Severity is required'],
        enum: ['low', 'medium', 'high'],
    }
}, { _id: false });

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, 'Day is required'],
    },
    focus: {
        type: String,
        required: [true, 'Focus is required'],
    },
    tasks: {
        type: [String],
        required: [true, 'Tasks are required'],
    }
}, { _id: false });

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, 'Job description is required'],
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapsSchema],
    preparationPlan: [preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true });


const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);

module.exports = interviewReportModel;