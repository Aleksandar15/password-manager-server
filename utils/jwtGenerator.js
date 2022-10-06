const jwt = require("jsonwebtoken");

const jwtGenerator = (user_id) => {
  const payload = {
    user_id,
  };

  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1h" });
};

module.exports = jwtGenerator;
