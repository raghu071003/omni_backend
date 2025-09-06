const { addGlobalAdmin } = require("../controllers/dev.controller");

const router = require("express").Router();

router.post("/addGlobalAdmin",addGlobalAdmin)

module.exports = router
