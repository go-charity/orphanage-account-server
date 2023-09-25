import { Router } from "express";
import { getOrphanageDetails } from "../controllers/get-orphanage-details";

const getOrphanageDetailsRouter = Router();

getOrphanageDetailsRouter.get("/:id", getOrphanageDetails);

export default getOrphanageDetailsRouter;
