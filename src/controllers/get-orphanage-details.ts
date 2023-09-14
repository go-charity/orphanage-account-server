import { Request, Response, NextFunction } from "express";
import { UserDetailsClass } from "../utils/utils";
import UserDetails from "../models/UserDetails";
import { UserDetailsType } from "../types";

export const getOrphanageDetails = async (
  req: Request<any, UserDetailsClass>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user details from the database
    const userDetails = await UserDetails.findOne<UserDetailsType>({
      user_id: req.headers.user_ID,
    }).catch((_) => {
      // If error getting user
      throw new Error("Something went wrong");
    });

    // If user doesn't exist
    if (!userDetails) return res.status(404).json("User doesn't exist");

    // Delete the field id
    delete (userDetails as any)._id;
    return res.status(200).json(userDetails);
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
