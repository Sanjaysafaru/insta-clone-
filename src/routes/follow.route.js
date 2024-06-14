const { Router } = require("express");
const {
  follower,
  unfollow,
  findIfFollowed,
  followersCount,
  followingCount,
  followersList,
  followingList,
  searchFollow,
} = require("../controllers/follow.controller.js");
const verifyJWT = require("../middlewares/authorize.middleware.js");

const router = Router();

router.route("/follower").post(verifyJWT, follower);
router.route("/unfollow").post(verifyJWT, unfollow);
router.route("/findIfFollowed").post(verifyJWT, findIfFollowed);
router.route("/followersCount").post(verifyJWT, followersCount);
router.route("/followingCount").post(verifyJWT, followingCount);
router.route("/followersList").post( followersList);
router.route("/followingList").post( followingList)
router.route("/search").post(verifyJWT,searchFollow)

module.exports = router;
