import { Schema, model, models } from "mongoose";

const userDetails = new Schema({
  user_id: {
    required: true,
    type: Schema.Types.ObjectId,
    unique: true,
  },
  fullname: {
    type: String,
  },
  tagline: String,
  phone_number: {
    type: String,
  },
  image: String,
  website: String,
  about: {
    text: String,
    raw: String,
  },
  metadata: {
    cover_image: String,
  },
  projects: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
});

const UserDetailsModel = model("User_Detail", userDetails);

export default UserDetailsModel;
