import { Router } from "express";
import RoleController from "../controllers/role.controller.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../shared/middlewares/asyncHandler.js";


const router = Router();

router.post("/",auth(),requireRole("ROLE-00001") ,asyncHandler(RoleController.create));
router.get("/", asyncHandler(RoleController.getAll));
router.get("/:id", asyncHandler(RoleController.getOne));

export default router;
