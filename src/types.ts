export type UserDetailsType = {
  user_id: string;
  fullname: string;
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
