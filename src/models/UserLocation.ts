import { Schema, model, models } from "mongoose";

const userLocation = new Schema({
  user_id: {
    required: true,
    type: Schema.Types.ObjectId,
    unique: true,
  },
  location: {
    type: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      metadata: {
        address: String,
      },
    },
    required: true,
  },
});

const UserLocationModel = model("User_location", userLocation);

export default UserLocationModel;
