import request from "supertest";
import {
  UserDetailsClass,
  UserLocationClass,
  UserSocialMediaHandlesClass,
  apiKey,
  convertTobase64,
} from "../utils/utils";
import UserDetailsModel from "../models/UserDetails";
import app from "../app";
import axios from "axios";
import connect from "../models/db-config";
import jwt from "jsonwebtoken";
import UserSocialMediaHandlesModel from "../models/UserSocialMediaHandles";
import UserLocationModel from "../models/UserLocation";
import * as utils from "../utils/utils";
import path from "path";
import { readFile } from "fs/promises";
import mongoose from "mongoose";

jest.mock("axios");
const uploadFileToCloudinaryMockReturnValue = {
  url: "https://demo.com/image.png",
};
const uploadFileToCloudinarySpy = jest
  .spyOn(utils, "uploadFileToCloudinary")
  .mockResolvedValue(uploadFileToCloudinaryMockReturnValue as any);

let testApiKey: string = convertTobase64(apiKey);
let access_token: string;
let imageBuffer: Buffer;
const authData = {
  user_ID: "650106e8961c0cbcc4d2f01f",
  user_role: "orphanage",
};
const dummyUserDetails = new UserDetailsClass(
  authData.user_ID,
  "Prince C. Onukwili",
  "090909090"
);
const dummyUserLocation = {
  user_id: authData.user_ID,
  location: new UserLocationClass(4.789, 6.234),
};
const dummyUserSocialMediaHandlers: {
  user_id: string;
  social_media_handles: UserSocialMediaHandlesClass[];
} = {
  user_id: authData.user_ID,
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
  mongoose.disconnect();
});

describe("Test cases responsible for testing the '/v1/edit' endpoint", () => {
  describe("Test cases responsible for tesitng the '/v1/edit/details' endpoint", () => {
    test("Should return 401 error if no API key is passed", async () => {
      const res = await request(app).patch("/v1/edit/details");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if invalid API key is passed", async () => {
      const res = await request(app)
        .patch("/v1/edit/details")
        .set("Api-key", "nbhikm");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if no API access token is passed", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/details")
        .set("Api-key", testApiKey);

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
    });
    test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/details")
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
        .patch("/v1/edit/details")
        .set("Api-key", testApiKey)
        .set("Authorization", "Bearer abc");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
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
        .patch("/v1/edit/details")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .send(dummyUserDetails);

      const user = await UserDetailsModel.findOne<UserDetailsClass>({
        user_id: authData.user_ID,
      });

      expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.fullname).toEqual(dummyUserDetails.fullname);
      expect(user?.phone_number).toEqual(dummyUserDetails.phone_number);
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
          "https://image.com"
        )
      );

      const res = await request(app)
        .patch("/v1/edit/details")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .send(dummyUserDetails);

      const user = await UserDetailsModel.findOne<UserDetailsClass>({
        user_id: authData.user_ID,
      });

      expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.fullname).toEqual(dummyUserDetails.fullname);
      expect(user?.phone_number).toEqual(dummyUserDetails.phone_number);
    });
  });
  describe("Test cases responsible for tesitng the '/v1/edit/social-media-handles' endpoint", () => {
    describe("Tesc cases for the PUT method", () => {
      test("Should return 401 error if no API key is passed", async () => {
        const res = await request(app).put("/v1/edit/social-media-handles");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/invalid.*api.*key/i);
      });
      test("Should return 401 error if invalid API key is passed", async () => {
        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", "nbhikm");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/invalid.*api.*key/i);
      });
      test("Should return 401 error if no API access token is passed", async () => {
        (axios as any).post.mockResolvedValue({
          status: 401,
          data: "Unauthorized",
        });

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey);

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/unauthorized/i);
      });
      test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
        (axios as any).post.mockResolvedValue({
          status: 401,
          data: "Unauthorized",
        });

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
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
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", "Bearer abc");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/unauthorized/i);
      });
      test("Should return 201 status code and create user social-media-handles in database if it doesn't exist", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(dummyUserSocialMediaHandlers.social_media_handles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(201);
        expect(res.text).toMatch(/user.*updated.*successfully/i);
        expect(user?.social_media_handles?.[0]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].type
        );
        expect(user?.social_media_handles?.[0]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].link
        );
        expect(user?.social_media_handles?.[1]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].type
        );
        expect(user?.social_media_handles?.[1]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].link
        );
      });
      test("Should return 201 status code and update user social-media-handles in database if it already exists", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        await UserSocialMediaHandlesModel.create({
          user_id: dummyUserSocialMediaHandlers.user_id,
          social_media_handles:
            dummyUserSocialMediaHandlers.social_media_handles,
        });

        const refinedUserSocialMediaHandles = [
          new UserSocialMediaHandlesClass("whatsapp", "https://whatsapp.com"),
          new UserSocialMediaHandlesClass("facebook", "https://facebook.com"),
        ];

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(refinedUserSocialMediaHandles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(201);
        expect(res.text).toMatch(/user.*updated.*successfully/i);
        expect(user?.social_media_handles?.[0]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].type
        );
        expect(user?.social_media_handles?.[0]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].link
        );
        expect(user?.social_media_handles?.[1]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].type
        );
        expect(user?.social_media_handles?.[1]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].link
        );
        expect(user?.social_media_handles?.[2]?.type).toEqual(
          refinedUserSocialMediaHandles[0].type
        );
        expect(user?.social_media_handles?.[2]?.link).toEqual(
          refinedUserSocialMediaHandles[0].link
        );
        expect(user?.social_media_handles?.[3]?.type).toEqual(
          refinedUserSocialMediaHandles[1].type
        );
        expect(user?.social_media_handles?.[3]?.link).toEqual(
          refinedUserSocialMediaHandles[1].link
        );
      });
      test("Should return 500 status code and not create user social-media-handles in database if request body has an incorrect format and user doesn't exist", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        const refinedUserSocialMediaHandles = [
          ...dummyUserSocialMediaHandlers.social_media_handles,
          { tel: "89ij" },
          { tucker: "98ujj", dummy: "k8yjj" },
          { link: "https://demo.com" },
          { type: "pinterest" },
          { type: "pinterest", find: "loij" },
          { link: "https://demo.com", hond: "kiol" },
          { type: "airbnb", link: "https://airbnb.com" },
        ];

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(refinedUserSocialMediaHandles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(500);
        expect(res.text).toMatch(/invalid.*request.*body/i);
        expect(user?.social_media_handles).toEqual(undefined);
      });
      test("Should return 500 status code and not update user social-media-handles in database if request body has an incorrect format and user doesn't exist", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        await UserSocialMediaHandlesModel.create({
          user_id: dummyUserSocialMediaHandlers.user_id,
          social_media_handles: [
            ...dummyUserSocialMediaHandlers.social_media_handles,
            new UserSocialMediaHandlesClass(
              "producthunt",
              "https://producthunt.com"
            ),
          ],
        });

        const refinedUserSocialMediaHandles = [
          ...dummyUserSocialMediaHandlers.social_media_handles,
          { tel: "89ij" },
          { tucker: "98ujj", dummy: "k8yjj" },
          { link: "https://demo.com" },
          { type: "pinterest" },
          { type: "pinterest", find: "loij" },
          { link: "https://demo.com", hond: "kiol" },
          { type: "airbnb", link: "https://airbnb.com" },
        ];

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(refinedUserSocialMediaHandles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(500);
        expect(res.text).toMatch(/invalid.*request.*body/i);
        expect(user?.social_media_handles?.length).toEqual(3);
      });
      test("Should return 500 status code and not update user social-media-handles in database if it a duplicate 'type' property exists in the request body", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        await UserSocialMediaHandlesModel.create({
          user_id: dummyUserSocialMediaHandlers.user_id,
          social_media_handles:
            dummyUserSocialMediaHandlers.social_media_handles,
        });

        const refinedUserSocialMediaHandles = [
          new UserSocialMediaHandlesClass("twitter", "https://twitter.com"),
          new UserSocialMediaHandlesClass("linkedin", "https://twitter.com"),
          new UserSocialMediaHandlesClass("facebook", "https://facebook.com"),
        ];

        const res = await request(app)
          .put("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(refinedUserSocialMediaHandles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(500);
        expect(res.text).toMatch(/type.*duplicates.*twitter.*linkedin/i);
        expect(user?.social_media_handles?.[0]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].type
        );
        expect(user?.social_media_handles?.[0]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].link
        );
        expect(user?.social_media_handles?.[1]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].type
        );
        expect(user?.social_media_handles?.[1]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].link
        );
        expect(user?.social_media_handles?.[2]).toEqual(undefined);
        expect(user?.social_media_handles?.[3]).toEqual(undefined);
        expect(user?.social_media_handles?.[4]).toEqual(undefined);
      });
    });
    describe("Tesc cases for the PATCH method", () => {
      test("Should return 401 error if no API key is passed", async () => {
        const res = await request(app).patch("/v1/edit/social-media-handles");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/invalid.*api.*key/i);
      });
      test("Should return 401 error if invalid API key is passed", async () => {
        const res = await request(app)
          .patch("/v1/edit/social-media-handles")
          .set("Api-key", "nbhikm");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/invalid.*api.*key/i);
      });
      test("Should return 401 error if no API access token is passed", async () => {
        (axios as any).post.mockResolvedValue({
          status: 401,
          data: "Unauthorized",
        });

        const res = await request(app)
          .patch("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey);

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/unauthorized/i);
      });
      test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
        (axios as any).post.mockResolvedValue({
          status: 401,
          data: "Unauthorized",
        });

        const res = await request(app)
          .patch("/v1/edit/social-media-handles")
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
          .patch("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", "Bearer abc");

        expect(res.statusCode).toBe(401);
        expect(res.text).toMatch(/unauthorized/i);
      });
      test("Should return 404 status code if user doesn't exist", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        const res = await request(app)
          .patch("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(dummyUserSocialMediaHandlers.social_media_handles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(404);
        expect(res.text).toMatch(/user.*doesn't.*exist/i);
        expect(user?.social_media_handles?.[0]?.type).toEqual(undefined);
        expect(user?.social_media_handles?.[0]?.link).toEqual(undefined);
        expect(user?.social_media_handles?.[1]?.type).toEqual(undefined);
        expect(user?.social_media_handles?.[1]?.link).toEqual(undefined);
      });
      test("Should return 200 status code and edit user social-media-handles in database if it already exists", async () => {
        (axios as any).post.mockResolvedValue({
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        });

        await UserSocialMediaHandlesModel.create({
          user_id: dummyUserSocialMediaHandlers.user_id,
          social_media_handles:
            dummyUserSocialMediaHandlers.social_media_handles,
        });

        const refinedUserSocialMediaHandles = [
          new UserSocialMediaHandlesClass("twitter", "https://x.com"),
          new UserSocialMediaHandlesClass("facebook", "https://facebook.com"),
        ];

        const res = await request(app)
          .patch("/v1/edit/social-media-handles")
          .set("Api-key", testApiKey)
          .set("Authorization", `Bearer ${access_token}`)
          .send(refinedUserSocialMediaHandles);

        const user = await UserSocialMediaHandlesModel.findOne({
          user_id: authData.user_ID,
        });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/user.*updated.*successfully/i);
        expect(user?.social_media_handles?.[0]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].type
        );
        expect(user?.social_media_handles?.[0]?.link).not.toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[0].link
        );
        expect(user?.social_media_handles?.[0]?.link).toEqual(
          refinedUserSocialMediaHandles[0].link
        );
        expect(user?.social_media_handles?.[1]?.type).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].type
        );
        expect(user?.social_media_handles?.[1]?.link).toEqual(
          dummyUserSocialMediaHandlers.social_media_handles[1].link
        );
      });
    });
  });
  describe("Test cases responsible for testing the '/v1/edit/location'", () => {
    test("Should return 401 error if no API key is passed", async () => {
      const res = await request(app).patch("/v1/edit/location");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if invalid API key is passed", async () => {
      const res = await request(app)
        .patch("/v1/edit/location")
        .set("Api-key", "nbhikm");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if no API access token is passed", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/location")
        .set("Api-key", testApiKey);

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
    });
    test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/location")
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
        .patch("/v1/edit/location")
        .set("Api-key", testApiKey)
        .set("Authorization", "Bearer abc");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
    });
    test("Should return 201 status code and create user location in database if it doesn't exist", async () => {
      (axios as any).post.mockResolvedValue({
        status: 200,
        data: {
          user_ID: authData.user_ID,
          user_role: authData.user_role,
        },
      });

      const res = await request(app)
        .patch("/v1/edit/location")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .send(dummyUserLocation.location);

      const user = await UserLocationModel.findOne({
        user_id: authData.user_ID,
      });

      expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.location.lat).toEqual(dummyUserLocation.location.lat);
      expect(user?.location.lng).toEqual(dummyUserLocation.location.lng);
    });
    test("Should return 201 status code and update user location in database if it already exists", async () => {
      (axios as any).post.mockResolvedValue({
        status: 200,
        data: {
          user_ID: authData.user_ID,
          user_role: authData.user_role,
        },
      });

      await UserLocationModel.create({
        user_id: authData.user_ID,
        location: new UserLocationClass(6.89, 0.987),
      });

      const res = await request(app)
        .patch("/v1/edit/location")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .send(dummyUserLocation.location);

      const user = await UserLocationModel.findOne({
        user_id: authData.user_ID,
      });

      expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.location.lat).toEqual(dummyUserLocation.location.lat);
      expect(user?.location.lng).toEqual(dummyUserLocation.location.lng);
    });
  });
  describe("Test cases responsible for tesitng the '/v1/edit/image' endpoint", () => {
    beforeEach(async () => {
      // Reads the image soc that it can be sent with the mock requests
      imageBuffer = await readFile(
        path.join(__dirname, "../go-charity-logo.png")
      );
    });

    test("Should return 401 error if no API key is passed", async () => {
      const res = await request(app).patch("/v1/edit/image");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if invalid API key is passed", async () => {
      const res = await request(app)
        .patch("/v1/edit/image")
        .set("Api-key", "nbhikm");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/invalid.*api.*key/i);
    });
    test("Should return 401 error if no API access token is passed", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/image")
        .set("Api-key", testApiKey);

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
    });
    test("Should return 401 error if invalid API access token is passed (without 'Bearer')", async () => {
      (axios as any).post.mockResolvedValue({
        status: 401,
        data: "Unauthorized",
      });

      const res = await request(app)
        .patch("/v1/edit/image")
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
        .patch("/v1/edit/image")
        .set("Api-key", testApiKey)
        .set("Authorization", "Bearer abc");

      expect(res.statusCode).toBe(401);
      expect(res.text).toMatch(/unauthorized/i);
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
        .patch("/v1/edit/image")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .attach("image", imageBuffer, "go-charity-logo.png");

      const user = await UserDetailsModel.findOne({
        user_id: authData.user_ID,
      });

      // expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.fullname).toEqual(undefined);
      expect(user?.phone_number).toEqual(undefined);
      expect(user?.image).toEqual(uploadFileToCloudinaryMockReturnValue.url);
    });
    test("Should return 201 status code and update user details in database if it already exists", async () => {
      (axios as any).post.mockResolvedValue({
        status: 200,
        data: {
          user_ID: authData.user_ID,
          user_role: authData.user_role,
        },
      });

      await UserDetailsModel.create({
        user_id: authData.user_ID,
        image: "https://kong.ng/picture.png",
      });

      const res = await request(app)
        .patch("/v1/edit/image")
        .set("Api-key", testApiKey)
        .set("Authorization", `Bearer ${access_token}`)
        .attach("image", imageBuffer, "go-charity-logo.png");

      const user = await UserDetailsModel.findOne({
        user_id: authData.user_ID,
      });

      expect(res.statusCode).toBe(201);
      expect(res.text).toMatch(/user.*updated.*successfully/i);
      expect(user?.fullname).toEqual(undefined);
      expect(user?.phone_number).toEqual(undefined);
      expect(user?.image).toEqual(uploadFileToCloudinaryMockReturnValue.url);
    });
  });
});
