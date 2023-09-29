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
});

const UserDetailsModel = model("User_Detail", userDetails);

export default UserDetailsModel;
