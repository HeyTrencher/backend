const express = require("express");
const router = express.Router();
const pingController = require("../controllers/ping.controller");

// GET test
router.get("/", pingController.getPing);

// POST test
router.post("/", pingController.postPing);

module.exports = router;