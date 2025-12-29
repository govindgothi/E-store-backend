import { Router } from "express";
import { createCategory } from "../controllers/category.controller";
import { allowedRole, verifyJwt } from "../middlewares/verifyJwt.middlewares";
import { uploadFields } from "../utils/multer.util";

const router = Router()

router.post("/create", verifyJwt, allowedRole("CUSTOMER","ADMIN"), uploadFields,createCategory)

export default router
