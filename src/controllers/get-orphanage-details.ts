import { Request, Response, NextFunction } from "express";
import { UserDetailsClass } from "../utils/utils";
import UserDetails from "../models/UserDetails";
import { UserDetailsType, UserType } from "../types";
import UserSocialMediaHandlesModel from "../models/UserSocialMediaHandles";
import UserLocationModel from "../models/UserLocation";

export const getOrphanageDetails = async (
  req: Request<any, UserDetailsClass>,
  res: Response
) => {
  try {
    const userID = req.headers.user_ID;
    let user: UserType | Record<string, any> = {};
    // Get user details from the database
    const userDetails = await UserDetails.findOne({
      user_id: userID,
    }).catch((_) => {
      // If error getting user
      throw new Error("Something went wrong");
    });
    // If user doesn't exist
    if (!userDetails) return res.status(404).json("User doesn't exist");
    else {
      user = { ...(userDetails as any)?._doc };
    }

    // Get the user social media handles
    const userSocialMediaHandles = await UserSocialMediaHandlesModel.findOne({
      user_id: userID,
    }).catch((_) => {
      // If error getting user
      throw new Error(
        `Something went wrong while fetching the user's social media handles: ${_.message}`
      );
    });
    // If the user social media handles were fetched successfully
    if (userSocialMediaHandles) {
      user.social_media_handles =
        userSocialMediaHandles.social_media_handles.map(
          (doc) => (doc as any)?._doc
        );
    }

    // Get the user location
    const userLocation = await UserLocationModel.findOne({
      user_id: userID,
    }).catch((_) => {
      // If error getting user
      throw new Error(
        `Something went wrong while fetching the user's location: ${_.message}`
      );
    });
    // If the user social media handles were fetched successfully
    if (userLocation) {
      user.location = { ...(userLocation as any)?.location?._doc };
    }

    // Delete the field id
    delete (user as any)._id;
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
