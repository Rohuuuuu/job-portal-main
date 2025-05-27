const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const jwtAuth = require("../lib/jwtAuth");

const router = express.Router();

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDirIfNotExists(path.join(__dirname, "../public/resume"));
createDirIfNotExists(path.join(__dirname, "../public/profile"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = file.fieldname === "resume" ? "resume" : "profile";
    cb(null, path.join(__dirname, `../public/${type}`));
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF files are allowed."), false);
    }
  } else if (file.fieldname === "profile") {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG/PNG files are allowed."), false);
    }
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post("/resume", jwtAuth, upload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      message: "Resume uploaded successfully",
      url: `/host/resume/${req.file.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

router.post("/profile", jwtAuth, upload.single("profile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      message: "Profile image uploaded successfully",
      url: `/host/profile/${req.file.filename}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

module.exports = router;