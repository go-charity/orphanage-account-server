import { Request, Response, NextFunction } from "express";
import {
  UserDetailsClass,
  validateSocialMediaHandlesList,
} from "../utils/utils";
import UserDetails from "../models/UserDetails";
import { UserDetailsType } from "../types";

export const editOrphanageDetails = async (
  req: Request<any, any, UserDetailsClass>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const { body } = req;

    // Search for user
    const userExists = await UserDetails.findOne<UserDetailsType>({
      user_id: req.headers.user_ID,
    })
      // If error updating user
      .catch((_) => {
        throw new Error(
          `Something went wrong, couldn't find user due to ${_.message}`
        );
      });

    // If user doesn't exist, create a record for the user
    if (!userExists) {
      // If the user needs to create his social media handles/links
      if (body.social_media_handles) {
        // Validate the social_media_handles list
        const result = validateSocialMediaHandlesList(
          body.social_media_handles
        );
        if (!result.valid) throw new Error(result.format());
      }

      const userCreated = await UserDetails.create<UserDetailsType>({
        user_id: req.headers.user_ID,
        fullname: body?.fullname,
        phone_number: body.phone_number,
        location: {
          lat: body.location?.lat,
          lng: body.location?.lng,
        },
        image: body.image,
        social_media_handles: body.social_media_handles,
      })
        // If error creating user
        .catch((_) => {
          throw new Error(
            `Something went wrong, couldn't create user due to: ${_.message}`
          );
        });

      if (!userCreated)
        throw new Error(`Something went wrong, couldn't create user`);
    }
    // If user exists, update the user details
    else {
      // If the user needs to update his social media handles/links
      if (body.social_media_handles) {
        // Validate the social_media_handles list
        const result = validateSocialMediaHandlesList(
          body.social_media_handles
        );
        if (!result.valid) throw new Error(result.format());

        // Extract the social_media_handles property if it exists
        const social_media_handles = [...body.social_media_handles];

        await UserDetails.updateOne<UserDetailsType>(
          {
            user_id: req.headers.user_ID,
          },
          {
            $push: {
              social_media_handles: { $each: social_media_handles },
            },
          }
        )
          // If error updating user social media handles
          .catch((_) => {
            throw new Error(
              `Something went wrong, couldn't update user social media handles due to: ${_.message}`
            );
          });
      }

      // Delete the social_media_handles property from the request body object
      delete body.social_media_handles;
      // Update the user's details
      await UserDetails.updateOne<UserDetailsType>(
        {
          user_id: req.headers.user_ID,
        },
        { $set: { ...body, user_id: req.headers.user_ID } }
      )
        // If error updating user
        .catch((_) => {
          throw new Error(
            `Something went wrong, couldn't update user due to: ${_.message}`
          );
        });
    }

    // delete (updatedUserDetails as any)._id;
    return res.status(201).json("User updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
