import { Schema } from "mongoose";

export type UserDetailsType = {
  user_id: string;
  fullname: string;
  tagline: string;
  phone_number: string;
  website: string;
  image: string;
  _id: string;
};
export type UserType = {
  user_id: string;
  fullname: string;
  phone_number: string;
  location: { lat: number; lng: number };
  social_media_handles: SocialMediaHandleType[];
  website: string;
  image: string;
  _id: string;
};

export type SocialMediaHandleType = { type: string; link: string };

export type UserAboutDescriptionType = { text: string; raw: string };

export type TProjectModel = {
  user_id: Schema.Types.ObjectId;
  images: string[];
  name: string;
  description: { text: string; raw: string };
  goal: number;
};
