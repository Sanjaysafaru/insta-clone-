const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs");
const { type } = require("os");
const { upload } = require("../middlewares/multer.middleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log(localFilePath);

  // Check if local file path is provided
  if (!localFilePath) {
    console.log("No local file path provided");
    return null;
  }

  try {
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "profilePics",
    });

    // Log success message and Cloudinary URL
    console.log("File uploaded to Cloudinary successfully");
    // console.log("Cloudinary URL:", response.url);

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Log error message and delete local file
    console.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(localFilePath);

    return null;
  }
};
const deleteOnCloudinary = async (publicId) => {
  // Check if publicId is provided
  if (!publicId) {
    console.log("No id path provided");
    return null;
  }
  // console.log(publicId);
  try {
    const result = await cloudinary.uploader.destroy(`profilePics/${publicId}`);
    if (result.result === "not found") {
      console.log("Image not found on Cloudinary:", publicId);
    } else {
      console.log("Image deleted successfully:", result);
    }
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    return null;
  }
};

module.exports = { uploadOnCloudinary, deleteOnCloudinary };

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result); });
