const Assessment = require("../../models/assessment.model");
const Content = require("../../models/content.model");
const LearningPath = require("../../models/learningPath.model");

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
        const learningPath = await LearningPath.findOne({ organization_id: req.params.id }).lean();
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
      const learningPath = await LearningPath.findOne({ uuid:req.params.id }).lean();
  
      if (!learningPath) {
        return res.status(404).json({
          success: false,
          message: "Learning path not found",
        });
      }
  
      const { schedule } = learningPath;
      // Assuming schedule is an array in LearningPath
      const populatedSchedule = await Promise.all(
        schedule.map(async (day) => {
          // Populate modules
          const populatedModules = await Promise.all(
            day.modules.map(async (moduleId) => {
              console.log(moduleId)
              const module = await Content.findById(moduleId);
              return module ? module : null; // Return module or null if not found
            })
          );
    
          // Populate assessments
          const populatedAssessments = await Promise.all(
            day.assessments.map(async (assessmentId) => {
              const assessment = await Assessment.findById(assessmentId);
              return assessment ? assessment : null; // Return assessment or null if not found
            })
          );
          return {
            ...day,
            modules: populatedModules,
            assessments: populatedAssessments,
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        message: "Learning path fetched successfully",
        data: {
          ...learningPath,
          schedule: populatedSchedule,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch learning path contents",
        error: error.message,
      });
    }
  };
  
module.exports = {
    addLearningPath,
    getLearningPaths,
    getContentsOfLearningPath
}