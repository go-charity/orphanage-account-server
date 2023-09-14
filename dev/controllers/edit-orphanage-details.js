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
exports.editOrphanageDetails = void 0;
const utils_1 = require("../utils/utils");
const UserDetails_1 = __importDefault(require("../models/UserDetails"));
const editOrphanageDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Validate the request body
        const { body } = req;
        // Search for user
        const userExists = yield UserDetails_1.default.findOne({
            user_id: req.headers.user_ID,
        })
            // If error updating user
            .catch((_) => {
            throw new Error(`Something went wrong, couldn't find user due to ${_.message}`);
        });
        // If user doesn't exist, create a record for the user
        if (!userExists) {
            // If the user needs to create his social media handles/links
            if (body.social_media_handles) {
                // Validate the social_media_handles list
                const result = (0, utils_1.validateSocialMediaHandlesList)(body.social_media_handles);
                if (!result.valid)
                    throw new Error(result.format());
            }
            const userCreated = yield UserDetails_1.default.create({
                user_id: req.headers.user_ID,
                fullname: body === null || body === void 0 ? void 0 : body.fullname,
                phone_number: body.phone_number,
                location: {
                    lat: (_a = body.location) === null || _a === void 0 ? void 0 : _a.lat,
                    lng: (_b = body.location) === null || _b === void 0 ? void 0 : _b.lng,
                },
                image: body.image,
                social_media_handles: body.social_media_handles,
            })
                // If error creating user
                .catch((_) => {
                throw new Error(`Something went wrong, couldn't create user due to: ${_.message}`);
            });
            if (!userCreated)
                throw new Error(`Something went wrong, couldn't create user`);
        }
        // If user exists, update the user details
        else {
            // If the user needs to update his social media handles/links
            if (body.social_media_handles) {
                // Validate the social_media_handles list
                const result = (0, utils_1.validateSocialMediaHandlesList)(body.social_media_handles);
                if (!result.valid)
                    throw new Error(result.format());
                // Extract the social_media_handles property if it exists
                const social_media_handles = [...body.social_media_handles];
                yield UserDetails_1.default.updateOne({
                    user_id: req.headers.user_ID,
                }, {
                    $push: {
                        social_media_handles: { $each: social_media_handles },
                    },
                })
                    // If error updating user social media handles
                    .catch((_) => {
                    throw new Error(`Something went wrong, couldn't update user social media handles due to: ${_.message}`);
                });
            }
            // Delete the social_media_handles property from the request body object
            delete body.social_media_handles;
            // Update the user's details
            yield UserDetails_1.default.updateOne({
                user_id: req.headers.user_ID,
            }, { $set: Object.assign(Object.assign({}, body), { user_id: req.headers.user_ID }) })
                // If error updating user
                .catch((_) => {
                throw new Error(`Something went wrong, couldn't update user due to: ${_.message}`);
            });
        }
        // delete (updatedUserDetails as any)._id;
        return res.status(201).json("User updated successfully");
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.editOrphanageDetails = editOrphanageDetails;
