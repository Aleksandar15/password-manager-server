const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const app = express();

const routes = require("./routes/routes");

const passwordManager = require("./routes/passwordManager");
//
const corsOptions = require("./config/corsOptions");
const credentialsCORS = require("./middlewares/credentialsCORS");
const cookieParser = require("cookie-parser");

// middlewares
// app.use(cors()); //OROGINAL (OLD).
// Handle options credentials check -> before CORS!
// and fetch cookies credentials requirement
app.use(credentialsCORS);
app.use(cors(corsOptions));

app.use(express.json());

// middleware for cookies
app.use(cookieParser());

//routes
app.get("/", async (req, res) => {
  res.json("Express is working");
});

app.use("/auth", routes);

app.use("/", passwordManager);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
