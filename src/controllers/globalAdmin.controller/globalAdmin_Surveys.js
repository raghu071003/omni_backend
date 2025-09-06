const SurveyResponses = require("../../models/global_surveyResponses.model");
const Surveys = require("../../models/global_surveys.model");

const createSurvey = async(req,res)=>{
    try {
      //add Createdby
      const {title,description,questions,survey_type,start_date,end_date,is_active,created_by} = req.body;
      const survey = await Surveys.create({
        title,
        description,
        questions,
        survey_type,
        start_date,
        end_date,
        is_active,
        created_by
      });
      return res.status(201).json({
        success: true,
        message: 'Survey created successfully',
        data: survey,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create survey',
        error: error.message,
      });
    }
  }
  
  const editSurvey = async(req,res)=>{
    try {
      const {title,description,questions,survey_type,start_date,end_date,is_active,created_by} = req.body;
      const updatedSurvey = await Surveys.findOneAndUpdate({uuid:req.params.id},{
        title,
        description,
        questions,
        survey_type,
        start_date,
        end_date,
        is_active,
        created_by
      });
      if(!updatedSurvey){
        return res.status(404).json({
          success:false,
          message:"Survey not found"
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Survey updated successfully',
        data: updatedSurvey,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update survey',
        error: error.message,
      });
    }
  }
  
  const deleteSurvey = async(req,res)=>{
    try {
      const deletedSurvey = await Surveys.findOneAndDelete({uuid:req.params.id});
      if(!deletedSurvey){
        return res.status(404).json({
          success:false,
          message:"Survey not found"
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Survey deleted successfully',
        data: deletedSurvey,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete survey',
        error: error.message,
      });
    }
  }
  
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
    viewResponse,
    viewResponses
  }