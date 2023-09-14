import { Schema, model, models } from "mongoose";

const userDetails = new Schema({
  user_id: {
    required: true,
    type: Schema.Types.ObjectId,
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

const UserDetailsModel = model("UserDetail", userDetails);

export default models.UserDetails || UserDetailsModel;
