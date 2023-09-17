import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
config();

cloudinary.config({
  api_key: process.env.CLOUDIARY_API_KEY,
  api_secret: process.env.CLOUDIARY_API_SECRET,
  cloud_name: process.env.CLOUDIARY_CLOUD_NAME,
});

export default cloudinary;
