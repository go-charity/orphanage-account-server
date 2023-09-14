import { Router } from "express";
import { editOrphanageDetails } from "../controllers/edit-orphanage-details";

const editOrphanageDetailsRouter = Router();

editOrphanageDetailsRouter.patch("/", editOrphanageDetails);

export default editOrphanageDetailsRouter;
