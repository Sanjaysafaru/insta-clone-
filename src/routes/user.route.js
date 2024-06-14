const { Router } = require("express");
const { upload } = require("../middlewares/multer.middleware.js");
const {
  registerUser,
  signInUser,
  signOutUser,
  searchUser,
  searchUserById,
  changePhoto,
  removePhoto,
  changeUserName,
  changeFullName,
} = require("../controllers/user.controller.js");
const verifyJWT = require("../middlewares/authorize.middleware.js");

const router = Router();

router.route("/register").post(registerUser);
router.route("/signIn").post(signInUser);
router.route("/signOut").post(verifyJWT, signOutUser);
router.route("/search").post(searchUser);
router.route("/searchUserById").post(searchUserById);
router.route("/changePhoto").post(
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  changePhoto
);
router.route("/removePhoto").post(verifyJWT, removePhoto);
router.route("/changeUserName").post(verifyJWT, changeUserName);
router.route("/changeFullName").post(verifyJWT, changeFullName);

module.exports = router;
