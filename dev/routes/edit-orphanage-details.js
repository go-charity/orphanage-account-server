"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const edit_orphanage_details_1 = require("../controllers/edit-orphanage-details");
const editOrphanageDetailsRouter = (0, express_1.Router)();
editOrphanageDetailsRouter.patch("/", edit_orphanage_details_1.editOrphanageDetails);
exports.default = editOrphanageDetailsRouter;
