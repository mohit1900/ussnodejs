import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto-js";
import bcrypt from "bcrypt";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "cloudinary";

export const register = catchAsyncError(async (req, res, next) => {
  // console.log("i ran");
  const { name, email, password } = req.body;

  const file = req.file;

  // console.log("file1 : ", file);

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  if (!file) return next(new ErrorHandler("No File Found", 404));
  if (file.size > 10e6)
    return next(new ErrorHandler("File should be less than 10MB", 403));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  // let file = req.file;

  // console.log("file0", file);

  const fileUri = getDataUri(file);

  // Upload file on cloudinary
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  let cipherUrl = crypto.AES.encrypt(
    mycloud.secure_url,
    process.env.CRYPTO_KEY
  );

  const otp = Math.floor(1000 + Math.random() * 9000);
  const hashedOTP = await bcrypt.hash(otp.toString(), 10);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      // public_id: "temp",
      // url: "temp",
      public_id: mycloud.public_id,
      url: cipherUrl,
      // url: mycloud.secure_url,
    },
    otp: hashedOTP,
    otp_expire: new Date(Date.now() + 5 * 60 * 1000),
  });
  // console.log("here1");

  await sendEmail(email, "Verify your account", `Your otp is ${otp}`);

  sendToken(res, user, "Otp send to email please verify account", 200);
});

export const verify = catchAsyncError(async (req, res, next) => {
  let otp = req.body.otp;

  if (!otp) return next(new ErrorHandler("OTP Not Found!"), 404);

  const user = await User.findById(req.user._id);

  let check = await user.compareOTP(otp.toString());
  // console.log("check: ", check, "expire: ", user.otp_expire < Date.now());

  if (!check || user.otp_expire < Date.now()) {
    return next(new ErrorHandler("Invalid OTP or has Expired!", 400));
  }

  user.verified = true;
  user.otp = null;
  user.otp_expire = null;

  await user.save();

  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  await sendEmail(
    user.email,
    "Account Successfully Verified",
    `Congratulations you have been verified now you can use our services.`
  );
  sendToken(res, user, "Account Verified", 200);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // const file = req.file

  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("User Doesn't Exist", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 401));

  if (user.blocked)
    return next(
      new ErrorHandler("You are blocked by the admin wait to unblock", 401)
    );

  sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter both the fields", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully!",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully!",
  });
});

export const updateProfilePhoto = catchAsyncError(async (req, res, next) => {
  const { file } = req.body;

  if (!file) return next(new ErrorHandler("No Image Found", 404));

  const user = await User.findById(req.user._id);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Photo Updated Successfully!",
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User Not Found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset the password. ${url} If you have not requested then please ignore.`;

  //send token via email
  await sendEmail(user.email, "Your Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been send to ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return new ErrorHandler("Reset Token is invalid or has expired!", 401);

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Photo Updated Successfully!",
    token,
  });
});

export const extractImage = catchAsyncError((req, res, next) => {
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
