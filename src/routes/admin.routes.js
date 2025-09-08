const {createAssessment, uploadAssessmentCSV, getQuestions, getAssessmentById, getAssessments, editAssessment, deleteAssessment, editQuestion, deleteQuestion, searchAssessment, getQuestionsRandom } = require("../controllers/admin.controller/admin_Assessment");
const {addUser,editUser,deleteUser,getUsers,getUserbyId, bulkDeleteUsers, bulkEditUsers, exportUsers,} = require("../controllers/admin.controller/admin_User");
const {addModule,editModule,deleteModule,previewModule,searchModules} = require("../controllers/admin.controller/admin_Module");
const { addOrgRole, editOrgRole, deleteOrgRole, getOrgRoles } = require("../controllers/admin.controller/admin_Role");
const { uploadAssessment, uploadContent } = require("../middleware/multer.middleware");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../utils/uploadOnCloud");
const Department = require("../models/departments.model");
const { addGroup, getGroups, editGroup, deleteGroup } = require("../controllers/admin.controller/admin_Groups");
const { addLearningPath, getLearningPaths, getContentsOfLearningPath, editLearningPath, deleteLearningPath } = require("../controllers/admin.controller/admin_LearningPath");
const { createSurvey, deleteSurvey, getSurveys, editSurvey } = require("../controllers/admin.controller/admin_Surveys");
const { setMessage, editMessage, deleteMessage } = require("../controllers/admin.controller/admin_message");

const router = require("express").Router();

router.route('/addUser').post(addUser)
router.route('/editUser/:id').put(editUser)
router.route('/deleteUser/:id').delete(deleteUser)
router.route('/getUsers').get(getUsers)
router.route('/getUser/:id').get(getUserbyId)
router.route('/bulkDeleteUsers').delete(bulkDeleteUsers)
router.route('/bulkEditUsers').put(bulkEditUsers)
router.route('/exportUsers').get(exportUsers)


/////ROLES////////

router.route('/addOrgRole').post(addOrgRole)
router.route('/editOrgRole/:id').put(editOrgRole)
router.route('/deleteOrgRole/:id').delete(deleteOrgRole)
router.route('/getOrgRoles').get(getOrgRoles)

//////Assessment////////

router.route('/createAssessment').post(createAssessment)
router.route('/createAssessmentCSV').post(uploadAssessment.single('file'),uploadAssessmentCSV)
router.route('/getAssessments').get(getAssessments)
router.route('/getQuestions/:id').get(getQuestions)
router.route('/getQuestionsRandom/:id').get(getQuestionsRandom)
router.route('/getAssessmentById/:id').get(getAssessmentById)
router.route('/editAssessment/:id').put(editAssessment)
router.route('/deleteAssessment/:id').delete(deleteAssessment)
router.route('/editQuestion/:id').put(editQuestion)
router.route('/deleteQuestion/:id').delete(deleteQuestion)
router.route('/searchAssessment').get(searchAssessment)

//////Module////////

router.route('/createModule').post(uploadContent.single('file'),uploadToCloudinary("modules"),addModule)
router.route('/editModule/:id').put(uploadContent.single('file'),uploadToCloudinary("modules"),editModule)
router.route('/deleteModule/:id').delete(deleteModule)
router.route('/previewModule/:id').get(previewModule)
router.route('/searchModules').get(searchModules)   

//////Groups////////

router.route('/addGroup').post(addGroup)
router.route('/getGroups').get(getGroups)
router.route('/editGroup/:id').put(editGroup)
router.route('/deleteGroup/:id').delete(deleteGroup)

//////Learning Path////////

router.route('/addLearningPath').post(addLearningPath)
router.route('/getLearningPaths').get(getLearningPaths)
router.route('/getLearningPathContents/:id').get(getContentsOfLearningPath)
router.route('/editLearningPath/:id').put(editLearningPath)
router.route('/deleteLearningPath/:id').delete(deleteLearningPath)


//////Surveys////////
router.route('/createSurvey').post(createSurvey)
router.route('/deleteSurvey/:id').delete(deleteSurvey)
router.route('/getSurveys').get(getSurveys)
router.route('/editSurvey/:id').put(editSurvey)


////////MessageForUser////
router.route('/setMessage').post(setMessage)
router.route('/editMessage/:id').put(editMessage)
router.route('/deleteMessage/:id').delete(deleteMessage)

module.exports = router;