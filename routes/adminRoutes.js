import express from "express";
import {
  blockUser,
  createAdmin,
  deleteUser,
  getAllAdmins,
  getAllBlockedUsers,
  getAllUsers,
  getUser,
  unBlockUser,
} from "../controllers/adminController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/admin/create").post(createAdmin);
router.route("/delete/:id").delete(isAuthenticated, authorizeAdmin, deleteUser);
router.route("/users").get(isAuthenticated, authorizeAdmin, getAllUsers);
router.route("/admins").get(isAuthenticated, authorizeAdmin, getAllAdmins);
router.route("/user/:id").get(isAuthenticated, authorizeAdmin, getUser);
router.route("/user/block/:id").put(isAuthenticated, authorizeAdmin, blockUser);
router
  .route("/user/unblock/:id")
  .put(isAuthenticated, authorizeAdmin, unBlockUser);
router
  .route("/blockedusers")
  .get(isAuthenticated, authorizeAdmin, getAllBlockedUsers);

export default router;
