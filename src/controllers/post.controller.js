const { asyncHandler } = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const User = require("../models/user.model.js");
const Follow = require("../models/follow.model.js");
const Post = require("../models/post.model.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

const addPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const postPath = req.files?.post?.[0]?.path;
  console.log(postPath);

  let post = {};
  try {
    post = await uploadOnCloudinary(postPath);
  } catch (error) {
    throw new apiError(400, "post not uploaded");
  }
  const { tagLine } = req.body;

  const postAdded = await Post.create({
    userId: userId,
    post: post?.url,
    tagLine: tagLine ? tagLine : "",
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        200,
        { redirectUrl: "/home" },
        "User Registered Successfully"
      )
    );
});
const postsCount = asyncHandler(async (req, res) => {
  let posts
  try {
    posts = await Post.find({ userId: req.body.userId });
  } catch (error) {
    throw new apiError(400, "posts not fetched");
  }
  totalPosts = posts.length;
  res
    .status(200)
    .json(new apiResponse(200, { totalPosts }, "counted Successfully"));
});
const showPosts = asyncHandler(async (req, res) => {
  let posts
  try {
    posts = await Post.find({ userId: req.body.userId });
  } catch (error) {
    throw new apiError(400, "posts not fetched");
  }
  res
    .status(200)
    .json(new apiResponse(200, { posts }, "user posts fetched Successfully"));
});
const showPost = asyncHandler(async (req, res) => {
  let post
  try {
    post = await Post.findById(req.body.postId);
  } catch (error) {
    throw new apiError(400, "post not fetched");
  }
  res
    .status(200)
    .json(new apiResponse(200, { post }, "user posts fetched Successfully"));
});
const fetchPosts = asyncHandler(async (req, res) => {
  let posts
  try {
    posts = await Post.find();
  } catch (error) {
    throw new apiError(400, "posts not fetched");
  }
  res
    .status(200)
    .json(
      new apiResponse(200, { posts }, "home page posts fetched Successfully")
    );
});
const deletePost = asyncHandler(async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.body.postId)
  } catch (error) {
    throw new apiError(400, "post not deleted");
  }
  
  res
    .status(200)
    .json(
      new apiResponse(200,null, "post deleted successfully")
    );
})

module.exports = { addPost, postsCount, showPosts, fetchPosts, showPost, deletePost };
