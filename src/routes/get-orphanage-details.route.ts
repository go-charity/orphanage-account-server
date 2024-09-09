import { Router } from "express";
import { getOrphanageDetails } from "../controllers/get-orphanage-details.controller";
import { validateTokenWithoutError } from "../utils/utils";

const getOrphanageDetailsRouter = Router();

getOrphanageDetailsRouter.get(
  "/:id",
  validateTokenWithoutError,
  getOrphanageDetails
);

export default getOrphanageDetailsRouter;
