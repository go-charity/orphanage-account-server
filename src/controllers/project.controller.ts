import { Request, Response } from "express";
import { TProjectModel } from "../types";
import UserDetailsModel from "../models/UserDetails";
import { uploadFileToCloudinary } from "../utils/utils";
import project_model from "../models/Project.model";

/**
 * * Function responsible for creating a new project in the project collection
 * @param req The Ecpress Js request object
 * @param res The Express Js response object
 * @returns void
 */
export const create_project = async (
  req: Request<
    any,
    any,
    Omit<TProjectModel, "description"> & { description: string }
  >,
  res: Response
) => {
  try {
    const { user_ID } = req.headers;
    // * Check if the user exists in the database
    const user = UserDetailsModel.find({ user_id: user_ID }).catch((e) =>
      console.error("Couldn't retrieve Account", e)
    );

    // * If user doesn't exist return 404
    if (!user) {
      console.error("Account doesn't exist");
      return res.status(404).json("Couldn't find project account");
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const uploaded_files_urls: string[] = [];

    // * Loop though all the uploaded files, and upload each to Cloudinary
    for (const file of files) {
      // * Upload file to cloudinary
      const uploaded_file = await uploadFileToCloudinary(file, {
        folder: "post_images",
      }).catch((e) => console.error("Could not upload file", file.filename, e));
      // * If file couldn't get uploaded, skip this loop
      if (!uploaded_file) {
        console.error("Couldn't upload file to cloudinary");
        continue;
      }
      // * Add the uploaded file to the list of uploaded files
      uploaded_files_urls.push(uploaded_file.url);
    }
    console.log("USER ID", user_ID);
    // * Create the project in the Project collection
    const created_project = await project_model
      .create({
        ...req.body,
        user_id: user_ID,
        images: uploaded_files_urls,
        description: JSON.parse(req.body.description),
      })
      .catch((e) => console.error("Couldn't create project", e));

    // * If project couldn't be created return 500
    if (!created_project) {
      console.error("Error creating the project");
      return res.status(500).json("Internal server error");
    }

    const update_user_projects = await UserDetailsModel.updateOne(
      { user_id: user_ID },
      { $push: { projects: { $each: [created_project._id] } } }
    ).catch((e) => console.error("Couldn't update user projects", e));

    // * If error adding the project to the list of the user projects, return 500
    if (!update_user_projects) {
      console.error("Couldn't update user projects");
      // * Delete the newly created project
      await project_model.findByIdAndDelete(created_project._id);
      console.error("Error creating the project");
      return res.status(500).json("Internal server error");
    }

    return res.status(201).json("Project created successfully");
  } catch (error: any) {
    console.error("Internal server error", error);
    return res.status(500).json("Internal server error");
  }
};
