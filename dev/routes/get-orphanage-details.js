"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_orphanage_details_1 = require("../controllers/get-orphanage-details");
const getOrphanageDetailsRouter = (0, express_1.Router)();
getOrphanageDetailsRouter.get("/", get_orphanage_details_1.getOrphanageDetails);
exports.default = getOrphanageDetailsRouter;
