import { Router } from "express";
import RoleController from "../controllers/role.controller.js";

const router = Router();

router.post("/", RoleController.create);
router.get("/", RoleController.getAll);
router.get("/:id", RoleController.getOne);

export default router;
