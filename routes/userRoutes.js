import express from "express";

import {
  deleteImage,
  getAllImages,
  getDecryptedImage,
  uploadImage,
} from "../controllers/imageController.js";

import {
  addNote,
  deleteNote,
  extractedNotes,
  getMyNotes,
} from "../controllers/notesController.js";

import {
  // addToPlaylist,
  changePassword,
  extractImage,
  forgotPassword,
  getMyProfile,
  login,
  logout,
  register,
  // removefromplaylist,
  resetPassword,
  updateProfile,
  updateProfilePhoto,
  verify,
} from "../controllers/userController.js";

import { isAuthenticated, isVerified } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(singleUpload, register);
router.route("/verify").post(isAuthenticated, verify);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMyProfile);
router
  .route("/changepassword")
  .put(isAuthenticated, isVerified, changePassword);
router.route("/updateprofile").put(isAuthenticated, isVerified, updateProfile);
router
  .route("/updateprofilephoto")
  .put(isAuthenticated, isVerified, updateProfilePhoto);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/extract/image").post(isAuthenticated, isVerified, extractImage);

//notes
router.route("/note/add").post(isAuthenticated, isVerified, addNote);
router.route("/note/delete").delete(isAuthenticated, isVerified, deleteNote);
router.route("/getmynotes").get(isAuthenticated, isVerified, getMyNotes);
router
  .route("/getextractednotes")
  .post(isAuthenticated, isVerified, extractedNotes);

//images
router.route("/my/images").get(isAuthenticated, isVerified, getAllImages);
router
  .route("/image/decrypt")
  .post(isAuthenticated, isVerified, getDecryptedImage);
router
  .route("/image/upload")
  .post(isAuthenticated, isVerified, singleUpload, uploadImage);
router
  .route("/image/upload")
  .post(isAuthenticated, isVerified, singleUpload, uploadImage);
router.route("/image/delete").delete(isAuthenticated, isVerified, deleteImage);

export default router;
