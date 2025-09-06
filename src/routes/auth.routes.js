const router = require("express").Router();
const { login } = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.route('/login').post(login)

module.exports = router;