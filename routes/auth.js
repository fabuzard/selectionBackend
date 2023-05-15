import express from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verify,
} from "../controllers/auth.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("logout", logout);
router.post("/verify", verify);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

export default router;
