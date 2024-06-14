const { asyncHandler } = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const User = require("../models/user.model.js");
const Follow = require("../models/follow.model.js");
const Post = require("../models/post.model.js");
const Like = require("../models/like.model.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

const likePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.body.postId;
  let liked, alreadyLiked;
  try {
    alreadyLiked = await Like.findOne({ userId: userId, postId: postId });
    if (alreadyLiked === null) {
      await Like.create({
        userId: userId,
        postId: postId,
      });
    } else {
      await Like.findOneAndDelete({ userId: userId, postId: postId });
    }
  } catch (error) {
    throw new apiError(400, "not liked");
  }

  return res
    .status(201)
    .json(new apiResponse(200, { alreadyLiked }, "Liked successfully"));
});

const findIfLiked = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.body.postId;
  let liked, alreadyLiked;
  try {
    alreadyLiked = await Like.findOne({ userId: userId, postId: postId });
    if (alreadyLiked === null) {
      liked = false;
    } else {
      liked = true;
    }
  } catch (error) {
    throw new apiError(400, "error in finding if liked or not");
  }
  return res
    .status(201)
    .json(new apiResponse(200, { liked: liked }, "Liked successfully"));
});
const likeCount = asyncHandler(async (req, res) => {
  const postId = req.body.postId;
  let likes;
  try {
    likes = await Like.find({ postId: postId });
  } catch (error) {
    throw new apiError(400, "like count not fetched");
  }
  return res
    .status(201)
    .json(new apiResponse(200, { likes: likes }, "Liked successfully"));
});

module.exports = { likePost, findIfLiked, likeCount };
