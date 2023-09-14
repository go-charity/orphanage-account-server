import request from "supertest";
import {
  UserDetailsClass,
  apiKey,
  convertTobase64,
  waitFor,
} from "../utils/utils";
import app from "../app";
import connect from "../models/db-config";
import UserDetailsModel from "../models/UserDetails";
import jwt from "jsonwebtoken";
import axios from "axios";

jest.mock("axios");

let testApiKey: string = convertTobase64(apiKey);
const authData = {
  user_ID: "650106e8961c0cbcc4d2f01f",
  user_role: "orphanage",
};
let access_token: string;
const dummyUserDetails = new UserDetailsClass(
  "650106e8961c0cbcc4d2f01f",
  "Ayomide K. Daniel",
  "07070707070",
  {
    lat: 5.8976,
    lng: 3.7972,
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
    const res = await request(app).get("/v1/");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if invalid API key is passed", async () => {
    const res = await request(app).get("/v1/").set("Api-key", "nbhikm");

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/invalid.*api.*key/i);
  });
  test("Should return 401 error if no API access token is passed", async () => {
    (axios as any).post.mockResolvedValue({
      status: 401,
      data: "Unauthorized",
    });

    const res = await request(app).get("/v1/").set("Api-key", testApiKey);

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatch(/unauthorized/i);
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
    expect(res.body).toMatch(/unauthorized/i);
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
    expect(res.body).toMatch(/unauthorized/i);
  });
  test("Should return 200 status code and user details from database", async () => {
    await UserDetailsModel.deleteMany({ user_id: dummyUserDetails.user_id });
    await waitFor(2);
    await UserDetailsModel.create(dummyUserDetails);

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

    const user = res.body as UserDetailsClass;

    expect(res.statusCode).toBe(200);
    expect(user.fullname).toEqual(dummyUserDetails.fullname);
    expect(user.phone_number).toEqual(dummyUserDetails.phone_number);
    expect(user.location?.lat).toEqual(dummyUserDetails.location?.lat);
    expect(user.location?.lng).toEqual(dummyUserDetails.location?.lng);
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
    expect(res.body).toMatch(/user.*doesn't.*exist/i);
  });
});
