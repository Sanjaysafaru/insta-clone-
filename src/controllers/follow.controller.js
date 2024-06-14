const { asyncHandler } = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const User = require("../models/user.model.js");
const Follow = require("../models/follow.model.js");

const follower = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.body.otherUserId;
  let follow;
  const alreadyFollowed = await Follow.find({
    follower: userId,
    following: otherUserId,
  });
  if (alreadyFollowed.length === 0) {
    follow = await Follow.create({
      follower: userId,
      following: otherUserId,
    });
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "followed successfully"));
});
const unfollow = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.body.otherUserId;
  const alreadyFollowed = await Follow.find({
    follower: userId,
    following: otherUserId,
  });
  if (alreadyFollowed.length > 0) {
    try {
      await Follow.deleteOne({ follower: userId, following: otherUserId });
    } catch (error) {
      throw new apiError(400, "not deleted");
    }
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "unfollowed successfully"));
});
const findIfFollowed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.body.otherUserId;
  let followed;
  const response = await Follow.findOne({
    follower: userId,
    following: otherUserId,
  });
  if (response === null) {
    followed = false;
  } else {
    followed = true;
  }

  return res.status(200).json(new apiResponse(200, { followed }, "followed"));
});

const followersCount = asyncHandler(async (req, res) => {
  let userId;
  if (req.body.otherUserId) {
    userId = req.body.otherUserId;
  } else {
    userId = req.user._id;
  }
  const followers = await Follow.find({ following: userId });
  const totalFollowers = followers.length;

  res
    .status(200)
    .json(new apiResponse(200, { totalFollowers }, "counted Successfully"));
});

const followingCount = asyncHandler(async (req, res) => {
  let userId;
  if (req.body.otherUserId) {
    userId = req.body.otherUserId;
  } else {
    userId = req.user._id;
  }
  const following = await Follow.find({ follower: userId });
  totalFollowing = following.length;
  res
    .status(200)
    .json(new apiResponse(200, { totalFollowing }, "counted Successfully"));
});

const followersList = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const followerObjects = await Follow.find({ following: userId });
  let followersList = [];
  for (i = 0; i < followerObjects.length; i++) {
    const followerId = followerObjects[i].follower;
    const followerObject = await User.find({ _id: followerId });
    followersList[i] = followerObject[0];
  }
  res
    .status(200)
    .json(
      new apiResponse(
        200,
        { followersList },
        "followers list loaded successfully"
      )
    );
});
const followingList = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const followingObjects = await Follow.find({ follower: userId });
  let followingList = [];
  for (i = 0; i < followingObjects.length; i++) {
    const followingId = followingObjects[i].following;
    const followingObject = await User.find({ _id: followingId });
    followingList[i] = followingObject[0];
  }
  res
    .status(200)
    .json(
      new apiResponse(
        200,
        { followingList },
        "following list loaded successfully"
      )
    );
});

const searchFollow = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res
    .status(200)
    .json(new apiResponse(200, { user: user }, "User exist"));
});

module.exports = {
  follower,
  unfollow,
  findIfFollowed,
  followersCount,
  followingCount,
  followersList,
  followingList,
  searchFollow,
};
