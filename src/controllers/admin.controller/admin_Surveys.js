const { default: mongoose } = require("mongoose");
const OrganizationSurveyQuestion = require("../../models/organizationSurveyQuestions.model");
const OrganizationSurvey = require("../../models/organizationSurveys.model");

const createSurvey = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const organization_id = "68bc0898fdb4a64d5a727a60";
      const { name, status, description, questions } = req.body;
  
      if (!name || !status || !description || !questions) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const errors = [];
      const validQuestions = [];
  
      // Step 1: validate questions
      questions.forEach((q, index) => {
        try {
          if (!q.type || !q.questionText) {
            errors.push({ index, reason: "Missing type or question text" });
            return;
          }
          validQuestions.push({
            question_text: q.questionText.trim(),
            question_type: q.type.trim(),
            options: q.options || null,
            position: index + 1,
          });
        } catch (err) {
          errors.push({ index, reason: `Invalid question: ${err.message}` });
        }
      });
  
      if (validQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid questions found",
          errors,
        });
      }
  
      // Step 2: Insert questions within the transaction
      const savedQuestions = await OrganizationSurveyQuestion.insertMany(validQuestions, { session, ordered: false });
  
      // Step 3: Create survey with question IDs within the transaction
      const survey = await OrganizationSurvey.create([{
        name,
        status,
        description,
        organization_id,
        questions: savedQuestions.map((q) => q._id),
      }], { session });
  
      // Step 4: Commit transaction
      await session.commitTransaction();
      session.endSession();
  
      return res.status(201).json({
        success: true,
        message: "Survey created successfully",
        data: survey[0],
        errors: errors.length ? errors : undefined,
      });
  
    } catch (error) {
      // Abort transaction if any error occurs
      await session.abortTransaction();
      session.endSession();
  
      return res.status(500).json({
        success: false,
        message: "Failed to create survey",
        error: error.message,
      });
    }
  };
  

const deleteSurvey = async(req,res)=>{
    try {
        const {id} = req.params;
        const survey = await OrganizationSurvey.findOneAndDelete({uuid:id});
        const questions = await OrganizationSurveyQuestion.deleteMany({_id:{$in:survey.questions}});
        if(!questions){
            return res.status(404).json({
                success:false,
                message:"Questions not found"
            })
        }
        if(!survey){
            return res.status(404).json({
                success:false,
                message:"Survey not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Survey deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to delete survey",
            error:error.message
        })
    }
}

const getSurveys = async(req,res)=>{
    try {
        const organization_id = "68bc0898fdb4a64d5a727a60";
        const surveys = await OrganizationSurvey.find({organization_id})
        if(!surveys){
            return res.status(400).json({
                success:false,
                message:"No surveys found",
            })
        }   
        return res.status(200).json({
            success:true,
            message:"Surveys fetched successfully",
            data:surveys
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to fetch surveys",
            error:error.message
        })
    }
}

const editSurvey = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { name, status, description, questions } = req.body;
  
      if (!name || !status || !description || !questions) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const errors = [];
      const validQuestions = [];
  
      // Step 1: validate questions
      questions.forEach((q, index) => {
        try {
          if (!q.type || !q.questionText) {
            errors.push({ index, reason: "Missing type or question text" });
            return;
          }
          validQuestions.push({
            question_text: q.questionText.trim(),
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
  
      // Step 2: Find survey
      const survey = await OrganizationSurvey.findOne({ uuid: req.params.id }).session(session);
      if (!survey) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }
  
      // Step 3: Delete old questions
      if (survey.questions && survey.questions.length > 0) {
        await OrganizationSurveyQuestion.deleteMany({ _id: { $in: survey.questions } }).session(session);
      }
  
      // Step 4: Insert new questions
      const savedQuestions = await OrganizationSurveyQuestion.insertMany(validQuestions, { session, ordered: true });
  
      // Step 5: Update survey
      survey.name = name;
      survey.status = status;
      survey.description = description;
      survey.questions = savedQuestions.map((q) => q._id);
  
      await survey.save({ session });
  
      // Step 6: Commit transaction
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
  
module.exports = {
    createSurvey,
    deleteSurvey,
    getSurveys,
    editSurvey
}