import { Router } from "express";
import multer from "multer";
import { create_project } from "../controllers/project.controller";
import { validateToken } from "../utils/utils";

const project_router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

project_router.post("/", validateToken, upload.array("images"), create_project);

export default project_router;
