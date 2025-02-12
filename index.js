const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute")
const userRoute = require("./routes/userRoute");
const goalRoute = require("./routes/goalRoute");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleWare/errorMiddleware");
const session = require("express-session");
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "",
    ],
    credentials: true,
  })
);

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);


app.get("/", (req, res) => {
  res.send("Progressly, Streakify Your Goals");
});

// Routes Middleware
app.use("/api/v1/auth", authRoute);

//Error Middleware
app.use(errorHandler);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
