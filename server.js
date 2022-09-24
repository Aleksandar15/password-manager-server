const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const app = express();

const routes = require("./routes/routes");

const passwordManager = require("./routes/passwordManager");

// middlewares
app.use(cors());
app.use(express.json());

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
