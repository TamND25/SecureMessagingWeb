const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "secure-messages",
    resource_type: "auto",
    public_id: (req, file) =>
      file.originalname.split(".")[0] + "_" + Date.now(),
  },
});

const parser = multer({ storage });
module.exports = parser;
