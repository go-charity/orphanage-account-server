import { Request, Response, NextFunction } from "express";
import {
  UserDetailsClass,
  UserLocationClass,
  UserSocialMediaHandlesClass,
  uploadFileToCloudinary,
  validateAboutDescriptionObject,
  validateLocationObject,
  validateSocialMediaHandlesList,
} from "../utils/utils";
import UserDetailsModel from "../models/UserDetails";
import UserSocialMediaHandlesModel from "../models/UserSocialMediaHandles";
import UserLocationModel from "../models/UserLocation";
import { UserAboutDescriptionType, UserDetailsType } from "../types";

export const editOrphanageDetails = async (
  req: Request<any, any, UserDetailsType>,
  res: Response
) => {
  try {
    const { body } = req;
    // Delete the user_id and image properties from the request body
    delete (body as any).user_id;
    delete (body as any).image;
    const userID = req.headers.user_ID;

    // TODO: Search for the user details
    const userDetails = await UserDetailsModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user: ${e.message}`
      );
    });
    // TODO: If the user details doesn't exist create a new user
    if (!userDetails) {
      const createdUser = await UserDetailsModel.create({
        user_id: userID,
        fullname: body.fullname,
        tagline: body.tagline,
        phone_number: body.phone_number,
        website: body.website,
      }).catch((e) => {
        throw new Error(
          `Something went wrong while creating the user: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(`Something went wrong while creating the user: `);
    }
    // If user details exists
    else {
      // TODO: If the user details exist, update the existing user
      const createdUser = await UserDetailsModel.updateOne(
        { user_id: userID },
        {
          ...body,
        }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(`Something went wrong while updating the user: `);
    }

    return res.status(201).send("User details updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
export const updateOrphanageSocialMediaHandles = async (
  req: Request<any, any, UserSocialMediaHandlesClass[]>,
  res: Response
) => {
  try {
    // Validate the request body and check for duplicate 'name' properties in the social media handles list
    const { body } = req;
    const result = validateSocialMediaHandlesList(body);
    if (!result.valid)
      throw new Error(`Invalid request body: ${result.format()}`);

    const userID = req.headers.user_ID;

    // TODO: Check if user with that account exists
    const userSocialMediaHandles = await UserSocialMediaHandlesModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user social media handles: ${e.message}`
      );
    });

    // TODO: If the account doesn't exist
    if (!userSocialMediaHandles) {
      // TODO: Create a new User and push to the list of the user's social media handles
      const createdUserSocialmediaHandles =
        await UserSocialMediaHandlesModel.create({
          user_id: userID,
          social_media_handles: body,
        }).catch((e) => {
          throw new Error(
            `Something went wrong while creating the user social media handles: ${e.message}`
          );
        });
      // If error creating the user
      if (!createdUserSocialmediaHandles) {
        throw new Error(
          `Something went wrong while creating the user social media handles`
        );
      }
    }
    // If user account exists
    else {
      // TODO: Check for duplicate 'name' properties in a combined list consisting of the existing social media handles and handles to be added
      const existingSocialmediaHandles =
        userSocialMediaHandles?.social_media_handles.map(
          (handle) => (handle as any)?._doc
        ) as UserSocialMediaHandlesClass[];
      const bodyAndExistingResult = validateSocialMediaHandlesList([
        ...body,
        ...existingSocialmediaHandles,
      ]);
      // If yser is not valid
      if (!bodyAndExistingResult.valid)
        throw new Error(
          `Invalid request body: ${bodyAndExistingResult.format()}`
        );
      // TODO: Update existing user and push to the list of the user's social media handles
      const updatedUserSocialMediaHandles =
        await UserSocialMediaHandlesModel.updateOne(
          {
            user_id: userID,
          },
          {
            $push: {
              social_media_handles: {
                $each: body,
              },
            },
          }
        ).catch((e) => {
          throw new Error(
            `Something went wrong while updating the user social media handles: ${e.message}`
          );
        });
      // If error updating the user
      if (!updatedUserSocialMediaHandles) {
        throw new Error(
          `Something went wrong while updating the user social media handles`
        );
      }
    }

    return res
      .status(201)
      .send("User social media handles updated successfully");
  } catch (error: any) {
    console.error("Internal server error", error.message);
    return res.status(500).send(error.message);
  }
};
export const editOrphanageSocialMediaHandles = async (
  req: Request<any, any, UserSocialMediaHandlesClass[]>,
  res: Response
) => {
  try {
    // TODO: Validate the request body
    const { body } = req;
    const result = validateSocialMediaHandlesList(body);
    if (!result.valid)
      throw new Error(`Invalid request body: ${result.format()}`);

    const userID = req.headers.user_ID;

    // TODO: Check if the user exists
    const userSocialMediaHandles = await UserSocialMediaHandlesModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user social media handles: ${e.message}`
      );
    });

    // TODO: if the user doesn't exist
    if (!userSocialMediaHandles) {
      // TODO: return error 404
      return res.status(404).send("User doesn't exist");
    }

    // TODO: Transform the user social media handles from a mongodb list to a javascript array
    const allSocialMediaHandles: UserSocialMediaHandlesClass[] =
      userSocialMediaHandles.social_media_handles.map(
        (obj) => (obj as any)?._doc
      );

    // TODO: Loop through each social media handle in both the edited handles list and all existing handles (from the db), apply the changes made to each handle in the request handles to each handle in all the existing handles
    for (const socialMediaHandle of body) {
      const prevSocialMediaHandle = allSocialMediaHandles.find(
        (handle) => handle.name === socialMediaHandle.name
      );
      if (!prevSocialMediaHandle) continue;
      prevSocialMediaHandle.link = socialMediaHandle.link;
    }

    // TODO: Update the user's social media handles in the database
    const updatedUserSocialMediaHandles =
      await UserSocialMediaHandlesModel.updateOne(
        { user_id: userID },
        { $set: { social_media_handles: allSocialMediaHandles } }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user social media handles: ${e.message}`
        );
      });
    // TODO: If error while updating the user's social media handles
    if (!updatedUserSocialMediaHandles) {
      throw new Error(
        `Something went wrong while updating the user social media handles`
      );
    }

    return res
      .status(200)
      .send("User social media handles updated successfully");
  } catch (error: any) {
    console.error("Internal server error", error.message);
    return res.status(500).send(error.message);
  }
};
export const editOrphanageLocation = async (
  req: Request<any, any, UserLocationClass>,
  res: Response
) => {
  try {
    // Validate the request body
    const { body } = req;
    const result = validateLocationObject(body);
    if (!result.valid)
      throw new Error(`Invalid request body: ${result.format()}`);

    const userID = req.headers.user_ID;

    // TODO: Check if user with that account exists
    const userLocation = await UserLocationModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user location: ${e.message}`
      );
    });

    // TODO: If the account doesn't exist
    if (!userLocation) {
      // TODO: Create a new User and his/her location
      const createdUserLocation = await UserLocationModel.create({
        user_id: userID,
        location: body,
      }).catch((e) => {
        throw new Error(
          `Something went wrong while creating the user location: ${e.message}`
        );
      });
      // If error creating the user
      if (!createdUserLocation) {
        throw new Error(
          `Something went wrong while creating the user location`
        );
      }
    }
    // If the account exists
    else {
      // TODO: Update existing user and push to the list of the user's location
      const updatedUserLocation: any = await UserLocationModel.updateOne(
        { user_id: userID },
        { $set: { location: body } }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user location: ${e.message}`
        );
      });
      // If error updating the user
      if (!updatedUserLocation) {
        throw new Error(
          `Something went wrong while updating the user location`
        );
      }
    }

    return res.status(201).send("user location updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
export const editOrphanageImage = async (
  req: Request<any, any, { image: string }>,
  res: Response
) => {
  try {
    const { body } = req;
    // Delete the user_id properties from the request body
    delete (body as any)?.user_id;
    const userID = req.headers.user_ID;

    // TODO: Validate the uploaded file
    if (!req.file) {
      return res.status(415).send("Upload a valid image");
    }

    // TODO: Search for the user details
    const userDetails = await UserDetailsModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user image: ${e.message}`
      );
    });
    // TODO: If the user details doesn't exist create a new user with ONLY the image property
    if (!userDetails) {
      // TODO: Upload image to cloudinary
      const uploadedImage = await uploadFileToCloudinary(req.file, {
        folder: "orphanage_profile_images",
      }).catch((e) => {
        throw new Error(
          `Something went wrong: couldn't upload file to object storage due to: ${
            e.message || e
          }`
        );
      });

      const createdUser = await UserDetailsModel.create({
        user_id: userID,
        image: uploadedImage.url,
      }).catch((e) => {
        throw new Error(
          `Something went wrong while creating the user image: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(`Something went wrong while creating the user image`);
    }
    // If user details exists update the image property of the existing user
    else {
      // TODO: Upload image to cloudinary
      const uploadedImage = await uploadFileToCloudinary(req.file, {
        folder: "orphanage_profile_images",
      }).catch((e) => {
        throw new Error(
          `Something went wrong: couldn't upload file to object storage due to: ${
            e.message || e
          }`
        );
      });

      // TODO: If the user details exist, update the existing user's image
      const createdUser = await UserDetailsModel.updateOne(
        { user_id: userID },
        {
          $set: {
            image: uploadedImage.url,
          },
        }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user image: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(`Something went wrong while updating the user image: `);
    }

    return res.status(201).send("User image updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
export const editOrphanageAboutDescription = async (
  req: Request<any, any, UserAboutDescriptionType>,
  res: Response
) => {
  try {
    // VALIDATE REQUEST BODY
    const { body } = req;
    const userID = req.headers.user_ID;
    const result = validateAboutDescriptionObject(body);
    if (!result.valid) {
      throw new Error(`Invalid request body: ${result.format()}`);
    }
    // CHECK IF USER DETAILS EXIST
    const userDetails = await UserDetailsModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user: ${e.message}`
      );
    });
    // IF USER DETAILS DOESN'T EXIST
    if (!userDetails) {
      // CREATE THE USER DETAIL WITH THE ABOUT SECTION ONLY
      const createdUser = await UserDetailsModel.create({
        user_id: userID,
        about: body,
      }).catch((e) => {
        throw new Error(
          `Something went wrong while creating the user: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(`Something went wrong while creating the user`);
    }
    // IF USER DETAILS EXISTS
    else {
      // UPDATE THE EXISTING DETAILS ABPUT SECTION
      const updatedUser = await UserDetailsModel.updateOne(
        {
          user_id: userID,
        },
        { $set: { about: body } }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user: ${e.message}`
        );
      });
      if (!updatedUser) {
        throw new Error(`Something went wrong while updating the user`);
      }
    }
    return res.status(201).send("User details updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
export const editOrphanageCoverImage = async (
  req: Request<any, any, { image: string }>,
  res: Response
) => {
  try {
    const { body } = req;
    // Delete the user_id properties from the request body
    delete (body as any)?.user_id;
    const userID = req.headers.user_ID;

    // Validate the uploaded file
    if (!req.file) {
      return res.status(415).send("Upload a valid image");
    }

    // Search for the user details
    const userDetails = await UserDetailsModel.findOne({
      user_id: userID,
    }).catch((e) => {
      throw new Error(
        `Something went wrong while editing the user cover image: ${e.message}`
      );
    });
    // If the user details doesn't exist create a new user with ONLY the cover image property
    if (!userDetails) {
      // Upload cover image to cloudinary
      const uploadedImage = await uploadFileToCloudinary(req.file, {
        folder: "orphanage_profile_images",
      }).catch((e) => {
        throw new Error(
          `Something went wrong: couldn't upload file to object storage due to: ${
            e.message || e
          }`
        );
      });

      const createdUser = await UserDetailsModel.create({
        user_id: userID,
        "metadata.cover_image": uploadedImage.url,
      }).catch((e) => {
        throw new Error(
          `Something went wrong while creating the user cover image: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(
          `Something went wrong while creating the user cover image`
        );
    }
    // If user details exists update the cover image property of the existing user
    else {
      // Upload image to cloudinary
      const uploadedImage = await uploadFileToCloudinary(req.file, {
        folder: "orphanage_profile_images",
      }).catch((e) => {
        throw new Error(
          `Something went wrong: couldn't upload file to object storage due to: ${
            e.message || e
          }`
        );
      });

      // If the user details exist, update the existing user's cover image
      const createdUser = await UserDetailsModel.updateOne(
        { user_id: userID },
        {
          $set: {
            "metadata.cover_image": uploadedImage.url,
          },
        }
      ).catch((e) => {
        throw new Error(
          `Something went wrong while updating the user cover image: ${e.message}`
        );
      });
      if (!createdUser)
        throw new Error(
          `Something went wrong while updating the user cover image: `
        );
    }

    return res.status(201).send("User cover image updated successfully");
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
