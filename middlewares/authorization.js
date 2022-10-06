const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    //1- get token from req headers
    const token = req.header("token");

    //2- check if token is missing
    if (!token) {
      console.log("Token is Missing!");
      return res.status(403).json("Error Authorizing");
    }

    //3- set the payload using "verify" method
    const payload = jwt.verify(token, process.env.jwtSecret);
    console.log("payload ~> ", payload);

    req.user = payload.user_id;

    next();
  } catch (err) {
    console.log("Authorization error: ", err.message);
    res.status(403).json("Authorization error");
  }
};
