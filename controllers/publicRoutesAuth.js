const jwt = require("jsonwebtoken");

const publicRoutesAuth = (req, res) => {
  const cookies = req.cookies;

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
