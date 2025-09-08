const Assessment = require("../../models/assessment.model");
const Content = require("../../models/content.model");
const LearningPath = require("../../models/learningPath.model");
const Module = require("../../models/moduleOrganization.model");

const addLearningPath = async (req, res) => {
    try {
        const { title, description, schedule, status, organization_id } = req.body;
        const learningPath = new LearningPath({
            title,
            description,
            schedule,
            status,
            organization_id,
            //Change when authentication is added
            created_by: req.user?._id
        });
        await learningPath.save();
        return res.status(201).json({
            success: true,
            message: 'Learning path added successfully.',
            data: learningPath
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to add learning path.',
            error: error.message
        });
    }
}
////Need changes//////
const getLearningPaths = async (req, res) => {
    try {
        // const orgId = req.user.orgId || "68bc0898fdb4a64d5a727a60";
        const learningPath = await LearningPath.find({organization_id: "68bc0898fdb4a64d5a727a60"}).lean();
        return res.status(200).json({
            success: true,
            message: 'Learning paths fetched successfully.',
            data: learningPath
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch learning paths.',
            error: error.message
        })
    }
}

const getContentsOfLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ uuid: req.params.id })
      .populate({
        path: "schedule",
        populate: [
          { path: "modules" },
          { path: "assessments" }
        ]
      });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Learning path fetched successfully",
      data: learningPath,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch learning path contents",
      error: error.message,
    });
  }
};

const editLearningPath = async (req, res) => {
    try {
        const { title, description, schedule, status, organization_id } = req.body;
        const learningPath = await LearningPath.findOneAndUpdate({ uuid: req.params.id }, { title, description, schedule, status, organization_id }, { new: true });
        if(!learningPath){
          return res.status(404).json({
            success:false,
            message:"Learning path not found"
          })
        }
        return res.status(200).json({
            success: true,
            message: 'Learning path updated successfully.',
            data: learningPath
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update learning path.',
            error: error.message
        });
    }
}

const deleteLearningPath = async(req,res)=>{
  const deletedLearningPath = await LearningPath.findOneAndDelete({uuid:req.params.id}) 
  if(!deletedLearningPath){
    return res.status(404).json({
      success:false,
      message:"Learning path not found"
    })
  }
  return res.status(200).json({
    success:true,
    message:"Learning path deleted successfully",
    data:deletedLearningPath
  })
}
module.exports = {
    addLearningPath,
    getLearningPaths,
    getContentsOfLearningPath,
    editLearningPath,
    deleteLearningPath
}