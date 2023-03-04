import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";

export const createAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  let admin = await User.findOne({ email });
  if (admin) return next(new ErrorHandler("Email already exist", 409));

  admin = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "tempid",
      url: "tempurl",
    },
    role: "admin",
  });
  sendToken(res, admin, "Created Successfully", 200);
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Enter the id"), 401);

  let user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found!", 404));

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "User deleted Successfully",
    user,
  });
});
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  let users = await User.find({ role: "user" });
  if (!users) return next(new ErrorHandler("No User found!", 404));

  res.status(200).json({
    success: true,
    users,
  });
});

export const getAllAdmins = catchAsyncError(async (req, res, next) => {
  "here1";
  let admins = await User.find({ role: "admin" });
  if (!admins) return next(new ErrorHandler("No Admin found!", 404));

  res.status(200).json({
    success: true,
    admins,
  });
});
export const getUser = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("Enter the id", 403));

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("No User found!", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

export const blockUser = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Enter the id", 403));

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("No User found!", 404));

  await User.findByIdAndUpdate(id, { blocked: true });

  res.status(200).json({
    success: true,
    message: "User Blocked",
    user,
  });
});
export const unBlockUser = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Enter the id", 403));

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("No User found!", 404));

  await User.findByIdAndUpdate(id, { blocked: false });

  res.status(200).json({
    success: true,
    message: "User UnBlocked",
    user,
  });
});

export const getAllBlockedUsers = catchAsyncError(async (req, res, next) => {
  let blockedUsers = await User.find({ blocked: true });

  res.status(200).json({
    success: true,
    blockedUsers,
  });
});
