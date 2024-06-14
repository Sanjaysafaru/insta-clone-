const { Router } = require("express");
const { likePost, findIfLiked, likeCount } = require("../controllers/like.controller.js");
const { upload } = require("../middlewares/multer.middleware.js");
const verifyJWT = require("../middlewares/authorize.middleware.js");

const router = Router();

router.route("/likePost").post(verifyJWT, likePost);
router.route("/findIfLiked").post(verifyJWT, findIfLiked)
router.route("/likeCount").post(likeCount)

module.exports = router;
