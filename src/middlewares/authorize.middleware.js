const { asyncHandler } = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const jwt = require("jsonwebtoken")
const User = require("../models/user.model.js");

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id).select("-password, -refreshToken");
  
    if(!user) {
      throw new apiError(401, "Invalied Access Token")
    }
  
    req.user = user;
    next()
  } catch (error) {
     throw new apiError(401, error?.message || "Invalid access token")
  }
});

module.exports = verifyJWT