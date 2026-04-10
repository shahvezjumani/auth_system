import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register",authController.registerUser)

router.get("/get-me",authController.getMe)

export default router;