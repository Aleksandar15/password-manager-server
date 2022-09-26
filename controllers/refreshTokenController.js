const database = require("../database");
const jwt = require("jsonwebtoken");
const { jwtRefreshGenerator, jwtGenerator } = require("../utils/jwtGenerator");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    console.log("Cookies INSIDE refreshTokenController: ", cookies);
    if (!cookies?.refreshToken) {
      return res.status(401).json("Missing cookies");
    }
    const refreshToken = cookies.refreshToken;
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    console.log(
      "refreshToken INSIDE refreshTokenController.js: ",
      refreshToken
    );

    const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
      ignoreExpiration: true,
    });
    console.log("payload INSIDE refreshTokenController: ", payload);
    const user = await database.query(
      "SELECT refresh_token, user_id FROM users WHERE user_id = $1",
      [payload.user_id]
    );

    console.log(
      "user.rows[0] INSIDE refreshTokenController.js: ",
      user.rows[0]
    );

    const refreshTokenExistsInDatabase = user.rows[0].refresh_token.filter(
      (allRTinDB) => allRTinDB === refreshToken
    );
    console.log(
      "refreshTokenExistsInDatabase[0]: ",
      refreshTokenExistsInDatabase[0]
    );
    if (refreshTokenExistsInDatabase[0] !== refreshToken) {
      // REUSE Detection attempt by a hacker:
      const hackedUser = await database.query(
        "SELECT user_id FROM users WHERE user_id = $1",
        [payload.user_id]
      );
      console.log(
        "hackedUser.rows[0] INSIDE refreshTokenController: ",
        hackedUser.rows[0]
      );
      // Then, remove ALL oF THE RefreshTokenS from that user`s ID:
      const deleteRefreshToken = await database.query(
        "UPDATE users SET refresh_token='{}' WHERE user_id=$1 RETURNING *",
        [hackedUser.rows[0].user_id]
      );
      console.log(
        "deleteRefreshToken.rows[0] INSIDE refreshTokenController: ",
        deleteRefreshToken.rows[0]
      );
      console.log("User Hacked? ~ Detected refresh token reuse attempt");
      return res.status(403).json("Detected refresh token reuse attempt");
    }
    const newRefreshTokenArray = user.rows[0].refresh_token.filter(
      (allRTinDB) => allRTinDB !== refreshToken
    );
    console.log(
      "newRefreshTokenArray INSIDE refreshTOkenController: ",
      newRefreshTokenArray,
      "+ ...newRefreshTokenArray:",
      ...newRefreshTokenArray
    );

    // Evaluate JWT:
    jwt.verify(
      refreshToken,
      process.env.jwtRefreshSecret,
      async (err, payload) => {
        if (err) {
          //if expired
          const saveRefreshTokenArray = await database.query(
            "UPDATE users SET refresh_token=$1 WHERE user_id=$2 RETURNING *",
            [[...newRefreshTokenArray], user.rows[0].user_id]
          );
          console.log(
            "payload will it loog away to the parent after it undefined? ",
            payload
          );
          console.log(
            "saveRefreshTokenArray.rows[0] INSIDE refreshTokenController: ",
            saveRefreshTokenArray.rows[0]
          );

          return res.status(403).json("Token expired");
        }
        console.log(
          "payload (2nd) INSIDE jwt.verify oF refreshTokenController.js: ",
          payload
        );

        // Refresh token was still valid:
        const accessToken = jwtGenerator(user.rows[0].user_id, "5s");
        console.log("refreshTokenController CONTINUES...");

        const RTexpiryTimeInSeconds = payload.exp - payload.iat;
        console.log("RTexpiryTimeInSeconds: ", RTexpiryTimeInSeconds);
        const currentDate = new Date();
        console.log("currentDate: ", currentDate);
        const currentDateInEpoch = Date.parse(currentDate);
        console.log(
          "currentDateInEpoch: ",
          currentDateInEpoch,
          "payload.exp: ",
          payload.exp
        );
        const newRTexpiryTimeSeconds =
          payload.exp - Date.parse(new Date()) / 1000;

        // Create new refresh token every time we send the new access token (so we can reuse refresh token ONLY 1 time)
        const newRefreshToken = jwtRefreshGenerator(
          user.rows[0].user_id,
          newRTexpiryTimeSeconds
        );
        const newRefreshTokenDatabase = await database.query(
          "UPDATE users SET refresh_token=$1 WHERE user_id = $2 RETURNING user_id, refresh_token",
          [[...newRefreshTokenArray, newRefreshToken], user.rows[0].user_id]
        );
        console.log(
          "refreshTokenDatabase.rows[0] Inside /refresh: ",
          newRefreshTokenDatabase.rows[0]
        );
        res.cookie("refreshToken", newRefreshToken, {
          maxAge: 300000, //5 minutes
          httpOnly: true,
          secure: true, //requires "httpS" -> remove this when running on localhost (with insecure protocol "HTTP" causes errors, but errors IN PRODUCTION means good thing: its NOT Working on insecure Protocol)
          sameSite: "None",
        });

        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    console.log("handleRefreshToken err: ", err);
    res.status(403).json(err.message);
  }
};

module.exports = { handleRefreshToken };
