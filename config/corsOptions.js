const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // optionsSuccessStatus: 200, //He is wrong => its options is FOR Legacy Browser IE v11 -> That CHOKE on 200 === meaning they NEED 204 Success Status CODES!->HIS GITHUB: https://github.com/gitdagray/mongo_async_crud/blob/main/config/corsOptions.js
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;
