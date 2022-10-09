const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // 1 - get authorization headers data
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log("~~~~~1 authHeader INSIDE Authorization.js: ", authHeader);

    // #Case 1: user refreshToken has been used maliciously (handled in refreshTokenController)
    const cookies = req.cookies;
    if (cookies?.isUserHacked) return res.status(403).json("Is user hacked?");

    // #Case 2: user session is expired (handled by refreshTokenController)
    if (cookies?.expiredRefreshToken) {
      res.clearCookie("expiredRefreshToken", {
        httpOnly: true,
        // sameSite: "None",
        secure: true,
        // Clear new types of cookies:
        sameSite: "Strict",
        // 3:since #2 doesnt work/doesnt remove cookies refreshToken:
        path: "/",
        domain: "alek-password-manager.netlify.app",
      });
      return res.status(401).json("Session expired");
    }

    console.log(
      "!cookies?.refreshToken INSIDE authorization: ",
      !cookies?.refreshToken,
      "!cookies.refreshToken INSIDE authorization: ",
      !cookies.refreshToken,
      "cookies INSIDE authorization: ",
      cookies
    );
    // // Case 3: user has removed cookies
    if (!cookies?.refreshToken) {
      return res.status(401).json("User has removed cookies");
    } //WHEN THIS IS REMOVED: ON iPhone it ONLY works for Login and 5seconds pass (accessToken) is GONE: Bcuz Cookies cant be stored :/

    // 2 - check if headers are correct
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json("Error Authorizing");
    }

    const accessToken = authHeader.split(" ")[1];
    console.log("~~~~~2 accessToken INSIDE Authorization.js: ", accessToken);

    // 3- set the user_id to the req.user
    const payload = jwt.verify(accessToken, process.env.jwtSecret);
    console.log("~~~~~3 payload authorization.js ~> ", payload);

    req.user = payload.user_id;

    next();
  } catch (err) {
    console.log("Authorization error: ", err.message);
    res.status(403).json("Authorization error");
  }
};
