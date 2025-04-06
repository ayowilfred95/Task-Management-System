const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        const uploadPath = "images/";
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: function (req, file, cb) {
      try {
        const ext = path.extname(file.originalname);
        // remove extension
        const baseName = path.basename(file.originalname, ext); 
        const uniqueSuffix = Date.now() + "-" + baseName;
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
      } catch (error) {
        cb(error);
      }
    },
  });

const fileFilter = (req, file, cb) => {
  try {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  } catch (error) {
    cb(error);
  }
};

exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
  fileFilter: fileFilter,
});
