const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // 1 - get token from authorization headers
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log("~~~~~1 authHeader INSIDE Authorization.js: ", authHeader);

    // 2 - check if token is missing
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
