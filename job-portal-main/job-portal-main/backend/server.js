const express = require("express");
const mongoose = require("mongoose");
const passportConfig = require("./lib/passportConfig");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 4444;

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/jobPortal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error(err));

// Initialize directories
["./public", "./public/resume", "./public/profile"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passportConfig.initialize());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/apiRoutes"));
app.use("/upload", require("./routes/uploadRoutes"));
app.use("/host", require("./routes/downloadRoutes"));

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
