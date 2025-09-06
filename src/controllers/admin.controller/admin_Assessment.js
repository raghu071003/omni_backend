const Assessment = require("../../models/assessment.model")
const Question = require("../../models/question.model")
const createAssessment = async (req, res) => {
    try {
        const { title, description, questions, status, classification } = req.body;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ success: false, message: "Title and questions are required" });
        }

        // Save all questions first
        const savedQuestions = await Question.insertMany(questions);

        // Create assessment
        const assessment = new Assessment({
            title,
            description,
            questions: savedQuestions.map(q => q._id),
            created_by: req.user?._id,
            status,
            classification
        });

        await assessment.save();

        res.status(201).json({
            success: true,
            message: "Assessment created successfully",
            data: assessment,
        });

    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const csv = require("csv-parser");
const OrganizationContent = require("../../models/contentOrganization.model");
const fs = require("fs");

// Upload and create assessment from CSV
const uploadAssessmentCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const file = req.file;
        const questions = [];

        // Map letter answers to index
        const letterToIndex = { A: 0, B: 1, C: 2, D: 3, E: 4 };

        fs.createReadStream(file.path)
            .pipe(csv())
            .on("data", (row) => {
                // console.log(row)
                const options = [
                    row["Option A"],
                    row["Option B"],
                    row["Option C"],
                    row["Option D"],
                    row["Option E"]
                ].filter(Boolean);
                const answer = row["Answer"]?.trim().toUpperCase();

                let correct_option = null;
                if (answer) {
                    // If multiple answers separated by commas
                    if (answer.includes(",")) {
                        correct_option = answer.split(",").map(a => letterToIndex[a.trim()] ?? null).filter(a => a !== null);
                    } else {
                        // Single answer
                        correct_option = letterToIndex[answer] ?? null;
                    }
                }

                questions.push({
                    type_of_question: row["Type of Question"],
                    level_of_question: row["Level of Question"],
                    question_text: row["Question"],
                    file_url: row["File URL"] || null,
                    options,
                    correct_option,
                });
            })
            .on("end", async () => {
                // Save questions
                const savedQuestions = await Question.insertMany(questions);

                // Create assessment
                const assessment = new Assessment({
                    title: req.body.title || "Untitled Assessment",
                    description: req.body.description || "",
                    questions: savedQuestions.map((q) => q._id),
                    created_by: req.user?._id,
                    status: req.body.status,
                    classification: req.body.classification,
                });
                await assessment.save();

                fs.unlinkSync(file.path);

                return res.status(201).json({
                    success: true,
                    message: "Assessment created from CSV",
                    data: assessment,
                });
            });
    } catch (error) {
        console.error("CSV upload error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAssessments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const assessments = await Assessment.find().skip((page - 1) * limit).limit(limit)
        return res.status(200).json({
            success: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                page,
                limit,
                total: await Assessment.countDocuments()
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assessments",
            error: error.message
        })
    }
}
const getQuestions = async (req, res) => {
    try {
        const questions = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        const {page = 1, limit = 50} = req.query
        const paginatedQuestions = questions.questions.slice((page - 1) * limit, page * limit)
        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            data: paginatedQuestions,
            pagination: {
                page,
                limit,
                total: questions.questions.length
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
            error: error.message
        })
    }
}
const getQuestionsRandom = async (req, res) => {
    try {
        const { noOfQuestions } = req.query
        const questions = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        const randomQuestions = questions.questions.sort(() => 0.5 - Math.random()).slice(0, noOfQuestions);
        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            data: randomQuestions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch questions",
            error: error.message
        })
    }
}
const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        return res.status(200).json({
            success: true,
            message: "Assessment fetched successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assessment",
            error: error.message
        })
    }
}
const editAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findOneAndUpdate({uuid:req.params.id}, {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            classification: req.body.classification
        })
        return res.status(200).json({
            success: true,
            message: "Assessment updated successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update assessment",
            error: error.message
        })
    }
}
const deleteAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findOneAndDelete({uuid:req.params.id})
        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete assessment",
            error: error.message
        })
    }
}
const editQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate({uuid:req.params.id}, {
            question_text: req.body.question_text,
            options: req.body.options,
            correct_option: req.body.correct_option
        })
        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: question
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update question",
            error: error.message
        })
    }
}
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({uuid:req.params.id})
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
            data: question
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete question",
            error: error.message
        })
    }
}

const searchAssessment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { status, search = "" } = req.query;

        const filter = {
            title: { $regex: search, $options: "i" },
            ...(status && { status }),
        };

        const total = await Assessment.countDocuments(filter);
        const assessments = await Assessment.find(filter)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assessments",
            error: error.message,
        });
    }
};


module.exports = {
    createAssessment,
    uploadAssessmentCSV,
    getAssessments,
    getQuestions,
    getAssessmentById,
    editAssessment,
    deleteAssessment,
    editQuestion,
    deleteQuestion,
    searchAssessment,
    getQuestionsRandom
}