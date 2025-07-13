const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "secure-messaging-files",
    allowed_formats: ["jpg", "png", "pdf", "mp4", "webm"],
    resource_type: "auto",
  },
});

const parser = multer({ storage });

module.exports = parser;
