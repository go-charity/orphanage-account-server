import request from "supertest";
import {
  UserDetailsClass,
  UserLocationClass,
  UserSocialMediaHandlesClass,
  apiKey,
  convertTobase64,
  waitFor,
} from "../utils/utils";
import app from "../app";
import connect from "../models/db-config";
import UserDetailsModel from "../models/UserDetails";
import jwt from "jsonwebtoken";
import axios from "axios";
import UserSocialMediaHandlesModel from "../models/UserSocialMediaHandles";
import UserLocationModel from "../models/UserLocation";
import { UserType } from "../types";

jest.mock("axios");

let testApiKey: string = convertTobase64(apiKey);
const authData = {
  user_ID: "650106e8961c0cbcc4d2f01f",
  user_role: "orphanage",
};
let access_token: string;
const dummyUserDetails = {
  ...new UserDetailsClass(
    "650106e8961c0cbcc4d2f01f",
    "Ayomide K. Daniel",
    "07070707070",
    "https://example.com"
  ),
  image: "https://image.com",
};
const dummyUserLocation = {
  user_id: dummyUserDetails.user_id,
  location: new UserLocationClass(4.789, 6.234),
};
const dummyUserSocialMediaHandlers: {
  user_id: string;
  social_media_handles: UserSocialMediaHandlesClass[];
} = {
  user_id: dummyUserDetails.user_id as string,
  social_media_handles: [
    new UserSocialMediaHandlesClass("twitter", "https://twitter.com"),
    new UserSocialMediaHandlesClass("linkedin", "https://linkedin.com"),
  ],
};
const deleteAllCollectionData = async () => {
  await UserDetailsModel.deleteMany({ user_id: dummyUserDetails.user_id });
  await UserSocialMediaHandlesModel.deleteMany({
    user_id: dummyUserDetails.user_id,
  });
  await UserLocationModel.deleteMany({ user_id: dummyUserDetails.user_id });
};

beforeAll(() => {
  connect();
});

beforeEach(async () => {
  await deleteAllCollectionData();
  // Generates a dummy JWT token
  access_token = jwt.sign(authData, "123456", { expiresIn: 60 });
});

afterAll(async () => {
  await deleteAllCollectionData();
});

describe("Test cases responsible for tesitng the edit account functionalty", () => {
  test("Should return 401 error if no API key is passed", async () => {
    const res = await request(app).get("/v1/");

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if invalid API key is passed", async () => {
    const res = await request(app).get("/v1/").set("Api-key", "nbhikm");

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if no API access token is passed", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app).get("/v1/").set("Api-key", testApiKey);

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/unauthorized/i);
  });
  test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app)
      .get("/v1/")
      .set("Api-key", testApiKey)
      .set("Authorization", "abc");

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/unauthorized/i);
  });
  test("Should return 401 error if invalid API access token is passed (with 'Bearer')", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app)
      .get("/v1/")
      .set("Api-key", testApiKey)
      .set("Authorization", "Bearer abc");

    expect(res.statusCode).toBe(401);
    expect(res.text).toMatch(/unauthorized/i);
  });
  test("Should return 200 status code and user details from database", async () => {
    await deleteAllCollectionData();
    await waitFor(2);
    await UserDetailsModel.create(dummyUserDetails);
    await UserSocialMediaHandlesModel.create(dummyUserSocialMediaHandlers);
    await UserLocationModel.create(dummyUserLocation);

    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const res = await request(app)
      .get("/v1/")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`);

    const user = res.body as UserType;

    expect(res.statusCode).toBe(200);
    expect(user.fullname).toEqual(dummyUserDetails.fullname);
    expect(user.phone_number).toEqual(dummyUserDetails.phone_number);
    expect(user.website).toEqual(dummyUserDetails.website);
    expect(user.image).toEqual(dummyUserDetails.image);
    expect(user.location?.lat).toEqual(dummyUserLocation.location.lat);
    expect(user.location?.lng).toEqual(dummyUserLocation.location.lng);
    expect(user.social_media_handles?.[0]?.type).toEqual(
      dummyUserSocialMediaHandlers.social_media_handles[0].type
    );
    expect(user.social_media_handles?.[0]?.link).toEqual(
      dummyUserSocialMediaHandlers.social_media_handles[0].link
    );
    expect(user.social_media_handles?.[1]?.type).toEqual(
      dummyUserSocialMediaHandlers.social_media_handles[1].type
    );
    expect(user.social_media_handles?.[1]?.link).toEqual(
      dummyUserSocialMediaHandlers.social_media_handles[1].link
    );
  });
  test("Should return 404 error if user details doesn't exist", async () => {
    (axios as any).post.mockResolvedValue({
      status: 200,
      data: {
        user_ID: authData.user_ID,
        user_role: authData.user_role,
      },
    });

    const res = await request(app)
      .get("/v1/")
      .set("Api-key", testApiKey)
      .set("Authorization", `Bearer ${access_token}`);

    expect(res.statusCode).toBe(404);
    expect(res.text).toMatch(/user.*doesn't.*exist/i);
  });
});
