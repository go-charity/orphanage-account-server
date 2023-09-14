"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrphanageDetails = void 0;
const UserDetails_1 = __importDefault(require("../models/UserDetails"));
const getOrphanageDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user details from the database
        const userDetails = yield UserDetails_1.default.findOne({
            user_id: req.headers.user_ID,
        }).catch((_) => {
            // If error getting user
            throw new Error("Something went wrong");
        });
        // If user doesn't exist
        if (!userDetails)
            return res.status(404).json("User doesn't exist");
        // Delete the field id
        delete userDetails._id;
        return res.status(200).json(userDetails);
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.getOrphanageDetails = getOrphanageDetails;
