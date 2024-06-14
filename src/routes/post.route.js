const { Router } = require("express");
const {
  addPost,
  postsCount,
  showPosts,
  showPost,
  fetchPosts,
  deletePost,
} = require("../controllers/post.controller.js");
const { upload } = require("../middlewares/multer.middleware.js");
const verifyJWT = require("../middlewares/authorize.middleware.js");

const router = Router();

router.route("/addPost").post(
  upload.fields([
    {
      name: "post",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  addPost
);
router.route("/postsCount").post(postsCount);
router.route("/showPosts").post(showPosts);
router.route("/showPost").post(showPost);
router.route("/fetchPosts").post(fetchPosts);
router.route("/deletePost").post(deletePost);
module.exports = router;
