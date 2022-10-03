const jwt = require("jsonwebtoken");

const jwtGenerator = (user_id, expiryTime) => {
  const payload = {
    user_id,
  };

  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: expiryTime });
};

const jwtRefreshGenerator = (user_id, expiryTime) => {
  const payload = {
    user_id,
  };

  return jwt.sign(payload, process.env.jwtRefreshSecret, {
    expiresIn: expiryTime,
  });
};

module.exports = { jwtGenerator, jwtRefreshGenerator };
