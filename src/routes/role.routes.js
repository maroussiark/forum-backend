import { Router } from "express";
import RoleController from "../controllers/role.controller.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.post("/",auth(),requireRole("ROLE-00001") ,RoleController.create);
router.get("/", RoleController.getAll);
router.get("/:id", RoleController.getOne);

export default router;
