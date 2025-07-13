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
    format: async (req, file) => {
      const ext = file.originalname.split(".").pop();
      return ext || "bin";
    },
    public_id: (req, file) => {
      const timestamp = Date.now();
      const cleanName = file.originalname.replace(/\.[^/.]+$/, "");
      return `${cleanName}_${timestamp}`;
    },
  },
});

const parser = multer({ storage });
module.exports = parser;
