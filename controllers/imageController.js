import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "cloudinary";
import crypto from "crypto-js";

export const uploadImage = catchAsyncError(async (req, res, next) => {
  const { title } = req.body;
  const file = req.file;

  if (!title) return next(new ErrorHandler("Please enter the title", 400));

  if (!file) return next(new ErrorHandler("No File Found", 404));

  if (file.size > 10e6)
    return next(new ErrorHandler("File should be less than 10MB", 403));

  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  let cipherUrl = crypto.AES.encrypt(
    mycloud.secure_url,
    process.env.CRYPTO_KEY
  );

  const newImage = {
    title: title,
    image: {
      public_id: mycloud.public_id,
      url: cipherUrl,
    },
  };

  let imageArray = user.images;
  imageArray.push(newImage);
  //   imageArray = [...imageArray, newImage];

  await User.findByIdAndUpdate(req.user._id, { images: imageArray });

  res.status(200).json({
    success: true,
    user,
  });
});

export const getAllImages = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const images = user.images;

  res.status(200).json({
    success: true,
    images,
  });
});
export const getDecryptedImage = catchAsyncError(async (req, res, next) => {
  const cipherUrl = req.body.cipherUrl;

  if (!cipherUrl)
    return next(new ErrorHandler("Please provide the image cipher", 404));

  const url = crypto.AES.decrypt(cipherUrl, process.env.CRYPTO_KEY).toString(
    crypto.enc.Utf8
  );

  res.status(200).json({
    success: true,
    url,
  });
});

export const deleteImage = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const newImageArray = user.images.filter((item) => {
    if (item._id.toString() !== req.query.id.toString()) return item;
  });

  user.images = newImageArray;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Image Deleted Successfully",
  });
});
