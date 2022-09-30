const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // //1- get token from req headers
    // const token = req.header("token");
    // 1 - get refreshToken from cookies
    // const { refreshToken } = req.cookies;

    // console.log("refreshToken authorization.js: ", refreshToken);

    // ^ THATS BAD: AS I still NEED to uSe accessToken inside of here I just dont know how to receive it && refreshing it would give meyet another accessToken OMG IM CONFUSED OF WHATS THE POINT OF ALL OF THIS
    //
    // NEW: https://github.com/gitdagray/refresh_token_rotation/blob/main/middleware/verifyJWT.js
    // 1 - get token from authorization headers
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log("authHeader INSIDE Authorization.js: ", authHeader);
    console.log("~~~~~1 authHeader INSIDE Authorization.js: ", authHeader);

    // //2- check if token is missing
    // if (!token) {
    //2- check if refreshToken is missing from cookies
    // if (!refreshToken) {
    //   console.log("Token is Missing!");
    //   return res.status(403).json("Error Authorizing");
    // }

    // 2 - check if token is missing
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json("Error Authorizing");
    }

    const accessToken = authHeader.split(" ")[1];
    // console.log("accessToken INSIDE Authorization.js: ", accessToken);
    console.log("~~~~~~2 accessToken INSIDE Authorization.js: ", accessToken);

    //3- set the payload using "verify" method
    // // const payload = jwt.verify(token, process.env.jwtSecret);
    // const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret);
    // console.log("payload authorization.js ~> ", payload);

    // 3- set the user_id to the req.user
    const payload = jwt.verify(accessToken, process.env.jwtSecret);
    // console.log("payload authorization.js ~> ", payload);
    console.log("~~~~~~~3 payload authorization.js ~> ", payload);

    req.user = payload.user_id;

    next();
  } catch (err) {
    console.log("Authorization error: ", err.message);
    res.status(403).json("Authorization error");
  }
};

// module.exports = async (req, res, next) => {
//   try {
//     // //1- get token from req headers
//     // const token = req.header("token");
//     // 1 - get refreshToken from cookies
//     const { refreshToken } = req.cookies;

//     console.log("refreshToken authorization.js: ", refreshToken);

//     // ^ THATS BAD: AS I still NEED to uSe accessToken inside of here I just dont know how to receive it && refreshing it would give meyet another accessToken OMG IM CONFUSED OF WHATS THE POINT OF ALL OF THIS

//     // //2- check if token is missing
//     // if (!token) {
//     //2- check if refreshToken is missing from cookies
//     if (!refreshToken) {
//       console.log("Token is Missing!");
//       return res.status(403).json("Error Authorizing");
//     }

//     //3- set the payload using "verify" method
//     // const payload = jwt.verify(token, process.env.jwtSecret);
//     const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret);
//     console.log("payload authorization.js ~> ", payload);

//     req.user = payload.user_id;

//     next();
//   } catch (err) {
//     console.log("Authorization error: ", err.message);
//     res.status(403).json("Authorization error");
//   }
// };
