const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // 1 - get authorization headers data
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log("~~~~~1 authHeader INSIDE Authorization.js: ", authHeader);

    // #Case 1: is user possible hacked
    const cookies = req.cookies;
    if (cookies?.isUserHacked) {
      res.clearCookie("isUserHacked", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.status(401).json("Is user hacked?");
    }

    // #Case 2: is user session expired
    if (cookies?.expiredRefreshToken) {
      res.clearCookie("expiredRefreshToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.status(401).json("Session expired");
    }

    // Case 3: user has removed cookies
    if (!cookies?.refreshToken) {
      return res.status(401).json("User has removed cookies");
    }

    // 2 - check if headers are correct
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json("Error Authorizing"); //NEW: I was wrong saying this wont run: it run ALWAYS when TOKEN IS MISSING (Great!) ON Frontend I keep having 'You are not authorized to view this page.'. //OLD~>//Now(that I have temporary cookies on expired refresh token) its Error Authorizing CODE-WISE, this will almost never be run on FRONTEND
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
