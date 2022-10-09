const jwt = require("jsonwebtoken");

const publicRoutesAuth = (req, res) => {
  const cookies = req.cookies;

  // Handle the `isUserHacked` temporary cookie provided by refreshTokenController
  // Its also handled inside authorization.js WITHOUT removal of the cookie (so it can be received in here)
  if (cookies?.isUserHacked) {
    res.clearCookie("isUserHacked", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.status(403).json("Is user hacked? - publicRoutesAuth");
  }

  if (!cookies?.refreshToken) return res.status(401).json("Missing cookies");

  const refreshToken = cookies.refreshToken;
  // Evaulate refreshToken
  jwt.verify(
    refreshToken,
    process.env.jwtRefreshSecret,
    async (err, decoded) => {
      if (err) return res.status(401).json("Expired refreshToken");
      return res.status(200).json("User is authorized");
    }
  );
};

module.exports = { publicRoutesAuth };
