const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb-callback
    cb(null, "D:\\FULL STACK\\BACK END\\Learning\\insta\\public\\temp");
    console.log("uploading");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

module.exports = { upload };
