import request from "supertest";
import { UserDetailsClass, apiKey, convertTobase64 } from "../utils/utils";
import UserDetailsModel from "../models/UserDetails";
import app from "../app";
import axios from "axios";
import connect from "../models/db-config";
import jwt from "jsonwebtoken";
import { SocialMediaHandleType } from "../types";
import mongoose from "mongoose";

jest.mock("axios");

let testApiKey: string = convertTobase64(apiKey);
let access_token: string;
const authData = {
  user_ID: "650106e8961c0cbcc4d2f01f",
  user_role: "orphanage",
};
const dummyUserDetails = new UserDetailsClass(
  "650106e8961c0cbcc4d2f01f",
  "Prince C. Onukwili",
  "090909090",
  {
    lat: 6.8976,
    lng: 4.7972,
  }
);

beforeAll(() => {
  connect();
});

beforeEach(async () => {
  await UserDetailsModel.deleteMany({});
  // Generates a dummy JWT token
  access_token = jwt.sign(authData, "123456", { expiresIn: 60 });
});

afterAll(async () => {
  await UserDetailsModel.deleteMany({});
});

describe("Test cases responsible for tesitng the edit account functionalty", () => {
  test("Should return 401 error if no API key is passed", async () => {
    const res = await request(app).patch("/v1/edit");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if invalid API key is passed", async () => {
    const res = await request(app).patch("/v1/edit").set("Api-key", "nbhikm");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if no API access token is passed", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app).patch("/v1/edit").set("Api-key", testApiKey);

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/unauthorized/i);
  });
  test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", "abc");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/unauthorized/i);
  });
  test("Should return 401 error if invalid API access token is passed (with 'Bearer')", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", "Bearer abc");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/unauthorized/i);
  });
  test("Should return 201 status code and create user details in database if it doesn't exist", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(dummyUserDetails);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: dummyUserDetails.user_id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatch(/user.*updated.*successfully/i);
    expect(user?.fullname).toEqual(dummyUserDetails.fullname);
    expect(user?.phone_number).toEqual(dummyUserDetails.phone_number);
    expect(user?.location?.lat).toEqual(dummyUserDetails.location?.lat);
    expect(user?.location?.lng).toEqual(dummyUserDetails.location?.lng);
  });
  test("Should return 201 status code and update user details in database if it already exists", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    await UserDetailsModel.create(
      new UserDetailsClass(
        "650106e8961c0cbcc4d2f01f",
        "Test User",
        "08080808080",
        {
          lat: 8.8976,
          lng: 2.7972,
        }
      )
    );

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(dummyUserDetails);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: dummyUserDetails.user_id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatch(/user.*updated.*successfully/i);
    expect(user?.fullname).toEqual(dummyUserDetails.fullname);
    expect(user?.phone_number).toEqual(dummyUserDetails.phone_number);
    expect(user?.location?.lat).toEqual(dummyUserDetails.location?.lat);
    expect(user?.location?.lng).toEqual(dummyUserDetails.location?.lng);
  });
  test("Should return 201 status code and create the user details if the specified social media handles are in a correct format and user doesn't exist", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const social_media_handles: SocialMediaHandleType[] = [
      { type: "facebook", link: "https://facebook.com" },
      { type: "instagram", link: "https://instagram.com" },
    ];

    const detailsToCreate: UserDetailsClass = {
      ...dummyUserDetails,
      social_media_handles: social_media_handles,
    };

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(detailsToCreate);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: detailsToCreate.user_id,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatch(/user.*updated.*successfully/i);
    expect(user?.fullname).toEqual(detailsToCreate.fullname);
    expect(user?.phone_number).toEqual(detailsToCreate.phone_number);
    expect(user?.location?.lat).toEqual(detailsToCreate.location?.lat);
    expect(user?.location?.lng).toEqual(detailsToCreate.location?.lng);
    // Validate if the social media handles list was created successfully
    expect(user?.social_media_handles?.[0]?.type).toBe(
      social_media_handles[0].type
    );
    expect(user?.social_media_handles?.[1]?.type).toBe(
      social_media_handles[1].type
    );
    expect(user?.social_media_handles?.[0]?.link).toBe(
      social_media_handles[0].link
    );
    expect(user?.social_media_handles?.[1]?.link).toBe(
      social_media_handles[1].link
    );
  });
  test("Should return 201 status code and update the user details if the specified social media handles are in a correct format and user already exists", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    await UserDetailsModel.create(
      new UserDetailsClass(
        "650106e8961c0cbcc4d2f01f",
        "Test User",
        "08080808080",
        {
          lat: 8.8976,
          lng: 2.7972,
        },
        [
          { type: "twitter", link: "https://twitter.com" },
          { type: "linkedin", link: "https://linkedin.com" },
        ]
      )
    );

    const social_media_handles: SocialMediaHandleType[] = [
      { type: "facebook", link: "https://facebook.com" },
      { type: "instagram", link: "https://instagram.com" },
    ];

    const detailsToUpdate: UserDetailsClass = {
      ...dummyUserDetails,
      social_media_handles: social_media_handles,
    };

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(detailsToUpdate);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: detailsToUpdate.user_id,
    });

    // // EDIT
    // console.log("RES BODY: ", res.text);
    // // STOP

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatch(/user.*updated.*successfully/i);
    expect(user?.fullname).toEqual(detailsToUpdate.fullname);
    expect(user?.phone_number).toEqual(detailsToUpdate.phone_number);
    expect(user?.location?.lat).toEqual(detailsToUpdate.location?.lat);
    expect(user?.location?.lng).toEqual(detailsToUpdate.location?.lng);
    // Validate if the social media handles list was updated successfully
    expect(user?.social_media_handles?.[0]?.type).toBe("twitter");
    expect(user?.social_media_handles?.[1]?.type).toBe("linkedin");
    expect(user?.social_media_handles?.[2]?.type).toBe(
      social_media_handles[0].type
    );
    expect(user?.social_media_handles?.[3]?.type).toBe(
      social_media_handles[1].type
    );
    expect(user?.social_media_handles?.[0]?.link).toBe("https://twitter.com");
    expect(user?.social_media_handles?.[1]?.link).toBe("https://linkedin.com");
    expect(user?.social_media_handles?.[2]?.link).toBe(
      social_media_handles[0].link
    );
    expect(user?.social_media_handles?.[3]?.link).toBe(
      social_media_handles[1].link
    );
  });
  test("Should return 500 status code and NOT update user if the specified social media handles are in an incorrect format and user already exists", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const initialDetail = new UserDetailsClass(
      "650106e8961c0cbcc4d2f01f",
      "Initial test user name",
      "08080808080",
      {
        lat: 8.8976,
        lng: 2.7972,
      },
      [
        { type: "twitter", link: "https://twitter.com" },
        { type: "linkedin", link: "https://linkedin.com" },
      ]
    );

    await UserDetailsModel.create(initialDetail);

    const social_media_handles: SocialMediaHandleType[] = [
      { type: "facebook", link: "https://facebook.com" },
      { type: "instagram", link: "https://instagram.com" },
      { link: "https://dummy.com" } as any,
      { tupe: "dummy" } as any,
      { tjok: "https://fatass.com", lonk: "kll" } as any,
      { type: 12 } as any,
    ];

    const detailsToUpdate: UserDetailsClass = {
      ...dummyUserDetails,
      social_media_handles: social_media_handles,
    };

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(detailsToUpdate);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: detailsToUpdate.user_id,
    });

    // // EDIT
    // console.log("RES BODY: ", res.text);
    // // STOP

    expect(res.statusCode).toBe(500);
    expect(user?.fullname).toEqual(initialDetail.fullname);
    expect(user?.phone_number).toEqual(initialDetail.phone_number);
    expect(user?.location?.lat).toEqual(initialDetail.location?.lat);
    expect(user?.location?.lng).toEqual(initialDetail.location?.lng);
    expect(user?.social_media_handles?.[0]?.type).toBe("twitter");
    expect(user?.social_media_handles?.[1]?.type).toBe("linkedin");
  });
  test("Should return 500 status code and NOT create user if the specified social media handles are in an incorrect format and user doesn't exist", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const social_media_handles: SocialMediaHandleType[] = [
      { type: "facebook", link: "https://facebook.com" },
      { type: "instagram", link: "https://instagram.com" },
      { link: "https://dummy.com" } as any,
      { tupe: "dummy" } as any,
      { tjok: "https://fatass.com", lonk: "kll" } as any,
      { type: 12 } as any,
    ];

    const detailsToUpdate: UserDetailsClass = {
      ...dummyUserDetails,
      social_media_handles: social_media_handles,
    };

    const res = await request(app)
      .patch("/v1/edit")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`)
      .send(detailsToUpdate);

    const user = await UserDetailsModel.findOne<UserDetailsClass>({
      user_id: detailsToUpdate.user_id,
    });

    // // EDIT
    // console.log("RES BODY: ", res.text);
    // // STOP

    // User shouldn't be created if parameters passed to social media handles are incorrect
    expect(res.statusCode).toBe(500);
    expect(user?.fullname).toEqual(undefined);
    expect(user?.phone_number).toEqual(undefined);
    expect(user?.location?.lat).toEqual(undefined);
    expect(user?.location?.lng).toEqual(undefined);
    expect(user?.social_media_handles).toBe(undefined);
  });
});
