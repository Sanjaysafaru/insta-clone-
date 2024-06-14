const { asyncHandler } = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const User = require("../models/user.model.js");
const {
  uploadOnCloudinary,
  deleteOnCloudinary,
} = require("../utils/cloudinary.js");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error); // Log the error for debugging
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields is Required!");
  }

  const existedUser = await User.findOne({
    userName: userName,
  });
  if (existedUser) {
    throw new apiError(409, "User already exists");
  }

  // const profilePicPath = req.files?.profilePic?.[0]?.path;

  // let profilePic = {};
  // if (profilePicPath) {
  //   profilePic = await uploadOnCloudinary(profilePicPath);
  // } else if (!profilePicPath) {
  const profilePic =
    "http://res.cloudinary.com/dokestzxr/image/upload/v1717326952/profilePics/rwjxwnynh45zfljnkpbo.jpg";
  // }

  const user = await User.create({
    fullName,
    userName: userName,
    email,
    password,
    profilePic: profilePic,
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        200,
        { redirectUrl: "/signIn" },
        "User Registered Successfully"
      )
    );
});

const signInUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName) {
    throw new apiError(400, "username  is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { password }],
  });

  if (!user) {
    throw new apiError(404, "User not exist");
  }

  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new apiError(401, "Password incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const signedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: signedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const signOutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new apiResponse(
        200,
        { redirectUrl: "/signUp" },
        "User logged out Successfully"
      )
    );
});

const searchUser = asyncHandler(async (req, res) => {
  const userName = req.body.userName;
  const user = await User.findOne({ userName: userName });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res
    .status(200)
    .json(new apiResponse(200, { user: user }, "User exist"));
});

const searchUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.body.userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res
    .status(200)
    .json(new apiResponse(200, { user: user }, "User exist"));
});

const changePhoto = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new apiResponse(404, null, "User not found"));
    }
    const publicId = user.profilePic;
    console.log(publicId);

    const defaultProfilePic =
      "http://res.cloudinary.com/dokestzxr/image/upload/v1717326952/profilePics/rwjxwnynh45zfljnkpbo.jpg";
    if (publicId != defaultProfilePic) {
      console.log("trying to delete image form cloudinary");
      try {
        await deleteOnCloudinary(extractPublicId(publicId));
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res
          .status(500)
          .json(
            new apiResponse(500, null, "Failed to delete old profile picture")
          );
      }
    }
    const profilePicPath = req.files?.profilePic?.[0]?.path;
    console.log(req.files);
    if (!profilePicPath) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "No profile picture uploaded"));
    }
    let profilePic;
    try {
      profilePic = await uploadOnCloudinary(profilePicPath);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return res
        .status(500)
        .json(
          new apiResponse(500, null, "Failed to upload new profile picture")
        );
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: profilePic.url },
        { new: true } // Option to return the updated document
      );

      return res
        .status(200)
        .json(
          new apiResponse(200, { user: updatedUser }, "Profile photo updated")
        );
    } catch (error) {
      console.error("Error updating user's profile picture:", error);
      return res
        .status(500)
        .json(
          new apiResponse(500, null, "Failed to update user's profile picture")
        );
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json(new apiResponse(500, null, "Internal server error"));
  }
});

const removePhoto = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const profilePic =
    "http://res.cloudinary.com/dokestzxr/image/upload/v1717326952/profilePics/rwjxwnynh45zfljnkpbo.jpg";
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new apiResponse(404, null, "User not found"));
    }
    const publicId = user.profilePic;
    console.log(user.profilePic, publicId);
    if (publicId !== profilePic) {
      try {
        await deleteOnCloudinary(extractPublicId(publicId));
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res
          .status(500)
          .json(
            new apiResponse(500, null, "Failed to delete old profile picture")
          );
      }
      try {
        await User.findByIdAndUpdate(
          userId,
          { profilePic: profilePic },
          { new: true } // Option to return the updated document
        );
      } catch (error) {
        console.log("photo not removed");
        return res
          .status(200)
          .json(new apiResponse(200, null, "removed photo successfully"));
      }
    } else {
      console.log("no need to update");
      return res
        .status(200)
        .json(new apiResponse(200, null, "no need to update"));
    }
    {
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json(new apiResponse(500, null, "Internal server error"));
  }
});
const extractPublicId = (url) => {
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  const [publicId] = lastPart.split(".");
  return publicId;
};

const changeUserName = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user._id);
  const userName = req.body.userName;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName: userName },
      { new: true } // Option to return the updated document
    );

    return res
      .status(200)
      .json(new apiResponse(200, { user: updatedUser }, "user name updated"));
  } catch (error) {
    console.error("Error updating user name:", error);
    return res
      .status(500)
      .json(new apiResponse(500, null, "Failed to update user name"));
  }
});
const changeFullName = asyncHandler(async (req, res) => {
  const userId = await User.findById(req.user._id);
  const fullName = req.body.fullName;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName: fullName },
      { new: true } // Option to return the updated document
    );

    return res
      .status(200)
      .json(new apiResponse(200, { user: updatedUser }, "full name updated"));
  } catch (error) {
    console.error("Error updating full name:", error);
    return res
      .status(500)
      .json(new apiResponse(500, null, "Failed to update full name"));
  }
});

module.exports = {
  registerUser,
  signInUser,
  signOutUser,
  searchUser,
  searchUserById,
  changePhoto,
  removePhoto,
  changeUserName,
  changeFullName,
};
