import { Schema, model, models } from "mongoose";

const socialMediaHandle = new Schema({
  type: { type: String, unique: true, required: true },
  link: { type: String, required: true },
});
const userSocialMediaHandles = new Schema({
  user_id: {
    required: true,
    type: Schema.Types.ObjectId,
    unique: true,
  },
  social_media_handles: {
    type: [socialMediaHandle],
    required: true,
  },
});

const UserSocialMediaHandlesModel = model(
  "User_social_media_handles",
  userSocialMediaHandles
);


export default UserSocialMediaHandlesModel;
