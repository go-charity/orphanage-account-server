import { Schema, model } from "mongoose";

const userSocialMediaHandles = new Schema({
  user_id: {
    required: true,
    type: Schema.Types.ObjectId,
    unique: true,
  },
  social_media_handles: {
    type: [
      {
        name: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
    required: true,
  },
});

const UserSocialMediaHandlesModel = model(
  "User_social_media_handles",
  userSocialMediaHandles
);

export default UserSocialMediaHandlesModel;
