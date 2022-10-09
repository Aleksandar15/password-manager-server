const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // 1 - get authorization headers data
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // #Case 1: user refreshToken has been used maliciously (handled in refreshTokenController)
    const cookies = req.cookies;
    if (cookies?.isUserHacked) return res.status(403).json("Is user hacked?");

    // #Case 2: user session is expired (handled by refreshTokenController)
    if (cookies?.expiredRefreshToken) {
      res.clearCookie("expiredRefreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
        domain: "alek-password-manager.netlify.app",
      });
      return res.status(401).json("Session expired");
    }

    // Case 3: user has removed cookies
    if (!cookies?.refreshToken) {
      return res.status(401).json("User has removed cookies");
    }

    // 2 - check if headers are correct
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json("Error Authorizing");
    }

    const accessToken = authHeader.split(" ")[1];

    // 3- set the user_id to the req.user
    const payload = jwt.verify(accessToken, process.env.jwtSecret);

    req.user = payload.user_id;

    next();
  } catch (err) {
    res.status(403).json("Authorization error");
  }
};
