"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userDetails = new mongoose_1.Schema({
    user_id: {
        required: true,
        type: mongoose_1.Schema.Types.ObjectId,
        unique: true,
    },
    fullname: {
        // required: true,
        type: String,
    },
    phone_number: {
        // required: true,
        type: String,
    },
    location: {
        lat: {
            type: Number,
            // required: true,
        },
        lng: {
            type: Number,
            // required: true,
        },
    },
    social_media_handles: {
        type: [
            {
                type: { type: String, required: true },
                link: { type: String, required: true },
            },
        ],
    },
    image: String,
});
const UserDetailsModel = (0, mongoose_1.model)("UserDetail", userDetails);
exports.default = mongoose_1.models.UserDetails || UserDetailsModel;
