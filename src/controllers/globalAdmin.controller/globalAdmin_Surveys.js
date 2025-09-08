const { default: mongoose } = require("mongoose");
const SurveyResponses = require("../../models/global_surveyResponses.model");
const Surveys = require("../../models/global_surveys.model");
const GlobalSurveyQuestion = require("../../models/global_surveys_Questions.model");

const createSurvey = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // start transaction
  try {
    const errors = [];
    const validQuestions = [];
    const { title, description, questions, survey_type, start_date, end_date, is_active } = req.body;

    // Step 1: validate questions
    questions.forEach((q, index) => {
      try {
        if (!q.type || !q.question) {
          errors.push({ index, reason: "Missing type or question text" });
          return;
        }
        validQuestions.push({
          question_text: q.question.trim(),
          question_type: q.type.trim(),
          options: q.options || null,
          position: index + 1,
        });
      } catch (err) {
        errors.push({ index, reason: `Invalid question: ${err.message}` });
      }
    });

    if (validQuestions.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No valid questions found",
        errors,
      });
    }
    // Step 2: Insert questions within the transaction
    const savedQuestions = await GlobalSurveyQuestion.insertMany(validQuestions, { session, ordered: true });  

    // Step 3: Create survey within the transaction
    const survey = await Surveys.create([{
      title,
      description,
      survey_type,
      start_date,
      end_date,
      is_active,
      questions: savedQuestions.map((q) => q._id),
    }], { session });

    // Step 4: Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: survey,
      errors: errors.length ? errors : undefined,
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: 'Failed to create survey',
      error: error.message,
    });
  }
};

  
const editSurvey = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, questions, survey_type, start_date, end_date, is_active } = req.body;
    const errors = [];
    const validQuestions = [];

    // Step 1: Validate questions
    questions.forEach((q, index) => {
      try {
        if (!q.type || !q.question) {
          errors.push({ index, reason: "Missing type or question text" });
          return;
        }
        validQuestions.push({
          question_text: q.question.trim(),
          question_type: q.type.trim(),
          options: q.options || null,
          position: index + 1,
        });
      } catch (err) {
        errors.push({ index, reason: `Invalid question: ${err.message}` });
      }
    });

    if (validQuestions.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No valid questions found",
        errors,
      });
    }

    // Step 2: Remove old questions associated with this survey (optional)
    const survey = await Surveys.findOne({ uuid: req.params.id }).session(session);
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    if (survey.questions && survey.questions.length > 0) {
      await GlobalSurveyQuestion.deleteMany({ _id: { $in: survey.questions } }).session(session);
    }

    // Step 3: Insert new questions
    const savedQuestions = await GlobalSurveyQuestion.insertMany(validQuestions, { session, ordered: true });

    // Step 4: Update survey with new details and question IDs
    survey.title = title;
    survey.description = description;
    survey.survey_type = survey_type;
    survey.start_date = start_date;
    survey.end_date = end_date;
    survey.is_active = is_active;
    survey.questions = savedQuestions.map(q => q._id);

    await survey.save({ session });

    // Step 5: Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: survey,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: "Failed to update survey",
      error: error.message,
    });
  }
};

  
const deleteSurvey = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the survey
    const survey = await Surveys.findOne({ uuid: req.params.id }).session(session);
    if (!survey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    // Step 2: Delete all associated questions
    if (survey.questions && survey.questions.length > 0) {
      await GlobalSurveyQuestion.deleteMany({ _id: { $in: survey.questions } }).session(session);
    }

    // Step 3: Delete the survey
    await Surveys.deleteOne({ _id: survey._id }).session(session);

    // Step 4: Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
      data: survey,
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: "Failed to delete survey",
      error: error.message,
    });
  }
};

  
  const getSurveys = async(req,res)=>{
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      const surveys = await Surveys.find().skip(skip).limit(limit)
      const total = await Surveys.countDocuments()
      return res.status(200).json({
        success: true,
        message: 'Surveys fetched successfully',
        data: surveys,
        pagination:{
          total,
          page,
          limit,
          totalPages:Math.ceil(total/limit),
          hasNextPage:page*limit<total
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch surveys',
        error: error.message,
      });
    }
  }

  const getSurvey = async(req,res)=>{
    try {
      const survey = await Surveys.findOne({uuid:req.params.id}).populate("questions")
      if(!survey){
        return res.status(404).json({
          success:false,
          message:"Survey not found"
        })
      }
      return res.status(200).json({
        success:true,
        message:"Survey fetched successfully",
        data:survey
      })
    } catch (error) {
      return res.status(500).json({
        success:false,
        message:"Failed to fetch survey",
        error:error.message
      })
    }
  }
  
  const viewResponse = async(req,res)=>{
      try {
          const response = await SurveyResponses.findById(req.params.id)
          return res.status(200).json({
              success:true,
              message:"Response fetched successfully",
              data:response
          })
      } catch (error) {
          return res.status(500).json({
              success:false,
              message:"Failed to fetch response",
              error:error.message
          })
      }
  }
  const viewResponses = async(req,res)=>{
      try {
          const responses = await SurveyResponses.find()
          return res.status(200).json({
              success:true,
              message:"Responses fetched successfully",
              data:responses
          })
      } catch (error) {
          return res.status(500).json({
              success:false,
              message:"Failed to fetch responses",
              error:error.message
          })
      }
  }

  module.exports={
    createSurvey,
    editSurvey,
    deleteSurvey,
    getSurveys,
    getSurvey,
    viewResponse,
    viewResponses
  }