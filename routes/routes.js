const express = require("express");
const router = express.Router();

const validInfo = require("../middlewares/validinfo");

const authorization = require("../middlewares/authorization");

const { handleRefreshToken } = require("../controllers/refreshTokenController");
const { handleLogout } = require("../controllers/logoutController");
const {
  handleLogoutAllSessions,
} = require("../controllers/logoutAllSessionsController");
const { publicRoutesAuth } = require("../controllers/publicRoutesAuth");
const { login } = require("../controllers/loginController");
const { register } = require("../controllers/registerController");

// ROUTES \\

//Register
router.post("/register", validInfo, register);

//Login
router.post("/login", validInfo, login);

router.get("/is-verify", authorization, async (req, res) => {
  res.status(200).json(true);
});

router.get("/is-user-verified", publicRoutesAuth);

router.get("/refresh", handleRefreshToken);

router.delete("/logout", handleLogout);

router.delete("/logoutallsessions", handleLogoutAllSessions);

module.exports = router;
