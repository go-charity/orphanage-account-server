import { model, Schema } from "mongoose";
import { TProjectModel } from "../types";

const project_schema: Schema<TProjectModel> = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User_Detail" },
  name: { type: String, required: true },
  description: { type: { text: String, raw: String }, required: true },
  images: { type: [String], required: true },
  goal: { type: Number, required: true },
});

const project_model = model("Project", project_schema);

export default project_model;
