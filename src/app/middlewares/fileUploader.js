const multer = require("multer");
const fs = require("fs");

const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = "";

      if (file.fieldname === "image") {
        uploadPath = "uploads/images/image";
      } else if (file.fieldname === "profile_image") {
        uploadPath = "uploads/images/image";
      } else if (file.fieldname === "video") {
        uploadPath = "uploads/video";
      } else if (file.fieldname === "product_img") {
        uploadPath = "uploads/images/product";
      } else {
        uploadPath = "uploads";
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4"
      ) {
        cb(null, uploadPath);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedFieldnames = [
      "image",
      "product_img",
      "profile_image",
      "video",
    ];

    if (file.fieldname === undefined) {
      // Allow requests without any files
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "video/mp4"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: "image", maxCount: 1 },
    { name: "product_img", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "profile_image", maxCount: 1 },
  ]);

  return upload;
};

module.exports = { uploadFile };
