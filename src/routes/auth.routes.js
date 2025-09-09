const router = require("express").Router();
const { login } = require("../controllers/auth_controller");
const { authenticate, authorize } = require("../middleware/auth_middleware");

router.route('/login').post(login)

module.exports = router;