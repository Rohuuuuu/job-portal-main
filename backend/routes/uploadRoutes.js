const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const path = require("path");

const pipeline = promisify(require("stream").pipeline);

const router = express.Router();

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDirIfNotExists(path.join(__dirname, "../public/resume"));
createDirIfNotExists(path.join(__dirname, "../public/profile"));

const upload = multer();

router.post("/resume", upload.single("file"), (req, res) => {
  const { file } = req;
  
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  if (file.mimetype !== "application/pdf") {
    res.status(400).json({
      message: "Invalid format. Only PDF files are allowed.",
    });
    return;
  }

  const filename = `${uuidv4()}.pdf`;
  const filepath = path.join(__dirname, `../public/resume/${filename}`);

  pipeline(file.stream, fs.createWriteStream(filepath))
    .then(() => {
      res.json({
        message: "File uploaded successfully",
        url: `/host/resume/${filename}`,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({
        message: "Error while uploading",
      });
    });
});

router.post("/profile", upload.single("file"), (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
    res.status(400).json({
      message: "Invalid format. Only JPG/PNG files are allowed.",
    });
    return;
  }

  const extension = file.mimetype === "image/jpeg" ? ".jpg" : ".png";
  const filename = `${uuidv4()}${extension}`;
  const filepath = path.join(__dirname, `../public/profile/${filename}`);

  pipeline(file.stream, fs.createWriteStream(filepath))
    .then(() => {
      res.json({
        message: "Profile image uploaded successfully",
        url: `/host/profile/${filename}`,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(400).json({
        message: "Error while uploading",
      });
    });
});

module.exports = router;