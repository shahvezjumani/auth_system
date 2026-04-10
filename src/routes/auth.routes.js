import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register",authController.registerUser)

router.get("/get-me",authController.getMe)

router.get("/refresh-token",authController.refreshToken)

router.get("/logout",authController.logout)

export default router;