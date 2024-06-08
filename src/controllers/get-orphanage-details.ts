import { Request, Response, NextFunction } from "express";
import { UserDetailsClass, convertFrombase64 } from "../utils/utils";
import UserDetails from "../models/UserDetails";
import { UserDetailsType, UserType } from "../types";
import UserSocialMediaHandlesModel from "../models/UserSocialMediaHandles";
import UserLocationModel from "../models/UserLocation";

export const getOrphanageDetails = async (
  req: Request<any, UserDetailsClass>,
  res: Response
) => {
  try {
    // const userID = req.headers.user_ID;
    const userID = convertFrombase64(req.params.id);
    let user: UserType | Record<string, any> = {};
    // Get user details from the database
    const userDetails = await UserDetails.findOne({
      user_id: userID,
    }).catch((err) => {
      // If error getting user
      throw new Error(
        `Something went wrong. Couldn't find user with ID: ${userID}, ${
          err.message || err
        }`
      );
    });
    // If user doesn't exist
    if (!userDetails) return res.status(404).json("User doesn't exist");
    else {
      user = { ...(userDetails as any)?._doc };
    }

    // Get the user social media handles
    const userSocialMediaHandles = await UserSocialMediaHandlesModel.findOne({
      user_id: userID,
    }).catch((err) => {
      // If error getting user
      throw new Error(
        `Something went wrong while fetching the user's social media handles: ${err.message}`
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
    }).catch((err) => {
      // If error getting user
      throw new Error(
        `Something went wrong while fetching the user's location: ${err.message}`
      );
    });
    // If the user social media handles were fetched successfully
    if (userLocation) {
      user.location = { ...(userLocation as any)?.location?._doc };
    }

    // Check if the user id passed to the id parameter is same as that in the access token
    if (userID === req.headers.user_ID) {
      // Indicate that the user who sent the request is the same user who is logged in
      res.setHeader("Is-user", "true");
    } else {
      // Indicate that the user who sent the request is NOT the same user who is logged in
      res.setHeader("Is-user", "false");
    }

    // Delete the field id
    delete (user as any)._id;
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
