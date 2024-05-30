const express = require("express");
router = express.Router();
usersRoute = require("../controllers/usersController");

router.get("/repos/:user", usersRoute.userRepos);

module.exports = router;
