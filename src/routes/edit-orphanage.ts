import { Router } from "express";
import {
  editOrphanageAboutDescription,
  editOrphanageCoverImage,
  editOrphanageDetails,
  editOrphanageImage,
  editOrphanageLocation,
  editOrphanageSocialMediaHandles,
  updateOrphanageSocialMediaHandles,
} from "../controllers/edit-orphanage-details";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const editOrphanageRouter = Router();

editOrphanageRouter.patch("/details", editOrphanageDetails);
editOrphanageRouter.patch("/about", editOrphanageAboutDescription);
editOrphanageRouter.put(
  "/social-media-handles",
  updateOrphanageSocialMediaHandles
);
editOrphanageRouter.patch(
  "/social-media-handles",
  editOrphanageSocialMediaHandles
);
editOrphanageRouter.patch("/location", editOrphanageLocation);
editOrphanageRouter.patch("/image", upload.single("image"), editOrphanageImage);
editOrphanageRouter.patch(
  "/bg_image",
  upload.single("image"),
  editOrphanageCoverImage
);

export default editOrphanageRouter;
