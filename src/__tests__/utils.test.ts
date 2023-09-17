import { NextFunction, Response } from "express";
import {
  UserLocationClass,
  UserSocialMediaHandlesClass,
  parseObjToString,
  parseStringToObj,
  validateLocationObject,
  validateSocialMediaHandlesList,
  validateToken,
} from "../utils/utils";
import axios, { AxiosRequestConfig } from "axios";

jest.mock("axios");

describe("Test cases for the utils functions/module", () => {
  describe("Test cases for the 'validateSocialMediaHandlesList' function", () => {
    test("Should return invalid if a non array value passed to the 'socialMediaHandles' parameter", async () => {
      const objParamReturnValue = validateSocialMediaHandlesList({} as any);
      const intParamReturnValue = validateSocialMediaHandlesList(90 as any);
      const strParamReturnValue = validateSocialMediaHandlesList(
        "Hello" as any
      );
      const boolParamReturnValue = validateSocialMediaHandlesList(true as any);

      expect(objParamReturnValue.valid).toBe(false);
      expect(objParamReturnValue.format()).toMatch(
        /expected.*'socialMediaHandles'.*array.*'object'/i
      );
      expect(intParamReturnValue.valid).toBe(false);
      expect(intParamReturnValue.format()).toMatch(
        /expected.*'socialMediaHandles'.*array.*'number'/i
      );
      expect(strParamReturnValue.valid).toBe(false);
      expect(strParamReturnValue.format()).toMatch(
        /expected.*'socialMediaHandles'.*array.*'string'/i
      );
      expect(boolParamReturnValue.valid).toBe(false);
      expect(boolParamReturnValue.format()).toMatch(
        /expected.*'socialMediaHandles'.*array.*'boolean'/i
      );
    });
    test("Should return invalid if an invalid schema list is passed to the 'socialMediaHandles' parameter", () => {
      const returnValue = validateSocialMediaHandlesList([
        { test: "bikjn" } as any,
        { link: "bikjn" } as any,
        { type: "bikjn" } as any,
        { type: "bikjn", kol: "kknn" } as any,
        { link: "bikjn", pol: "uunn" } as any,
        { goat: "bikjn", cow: "uunn" } as any,
        { link: "https://jongle.com", type: "twitter" } as any,
      ]);

      expect(returnValue.valid).toBe(false);
    });
    test("Should return invalid if the 'type' attribute is repeated across various schema in the list passed into the 'socialMediaHandles' parameter", () => {
      const obj = [
        new UserSocialMediaHandlesClass("whatsapp", "https://whatsapp.com"),
        new UserSocialMediaHandlesClass("facebook", "https://facebook.com"),
        new UserSocialMediaHandlesClass("twitter", "https://twitter.com"),
        new UserSocialMediaHandlesClass("whatsapp", "https://zee.com"),
      ];

      const returnValue = validateSocialMediaHandlesList(obj);
      expect(returnValue.valid).toBe(false);
      expect(returnValue.format()).toMatch(
        /type.*not.*unique.*duplicates.*whatsapp/i
      );
    });
    test("Should return valid if an valid schema list is passed to the 'socialMediaHandles' parameter", () => {
      const returnValue = validateSocialMediaHandlesList([
        { link: "https://jongle.com", type: "twitter" },
        { link: "https://kmngle.com", type: "big" },
        { link: "https://jjngle.com", type: "goal" },
      ]);

      expect(returnValue.valid).toBe(true);
    });
  });
  describe("Test cases for the 'parseObjToString' method", () => {
    test("Should throw error if a non object value is passed to the 'obj' parameter", () => {
      expect(() => parseObjToString("Bobo mi" as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'obj' parameter to be an object, instead got a 'string'"
        )
      );
      expect(() => parseObjToString(1356 as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'obj' parameter to be an object, instead got a 'number'"
        )
      );
      expect(() => parseObjToString(true as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'obj' parameter to be an object, instead got a 'boolean'"
        )
      );
      expect(() => parseObjToString([])).toThrowError(
        new Error(
          "Expected the value passed into the 'obj' parameter to be an object, instead got an 'array'"
        )
      );
    });
    test("Should return stringified object in its correct form", () => {
      const obj = {
        name: "Lenovo",
        model: "Thinkpad",
        ram: "16Gb",
        rom: "500Gb SSD",
      };
      const defaultObjToString = parseObjToString(obj);
      const customObjToString1 = parseObjToString(obj, "-->");
      const customObjToString2 = parseObjToString(obj, "=>>", " | ");

      expect(defaultObjToString).toEqual(
        `name=${obj.name}, model=${obj.model}, ram=${obj.ram}, rom=${obj.rom}, `
      );
      expect(customObjToString1).toEqual(
        `name-->${obj.name}, model-->${obj.model}, ram-->${obj.ram}, rom-->${obj.rom}, `
      );
      expect(customObjToString2).toEqual(
        `name=>>${obj.name} | model=>>${obj.model} | ram=>>${obj.ram} | rom=>>${obj.rom} | `
      );
    });
  });
  describe("Test cases for the 'parseStringToObj' method", () => {
    test("Should throw error if a non string value is passed to the 'str' parameter", () => {
      expect(() => parseStringToObj({ king: "dummy" } as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'str' parameter to be a string, instead got a 'object'"
        )
      );
      expect(() => parseStringToObj(1356 as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'str' parameter to be a string, instead got a 'number'"
        )
      );
      expect(() => parseStringToObj(true as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'str' parameter to be a string, instead got a 'boolean'"
        )
      );
      expect(() => parseStringToObj([] as any)).toThrowError(
        new Error(
          "Expected the value passed into the 'str' parameter to be a string, instead got a 'object'"
        )
      );
    });
    test("Should return string in its correct object form", () => {
      const objToReturn = {
        name: "Lenovo",
        model: "Thinkpad",
        ram: "16Gb",
        rom: "500Gb SSD",
      };
      const defaultStringToObj = parseStringToObj(
        `name=${objToReturn.name}, model=${objToReturn.model}, ram=${objToReturn.ram}, rom=${objToReturn.rom}, `
      );
      const customStringToObj1 = parseStringToObj(
        `name-->${objToReturn.name}, model-->${objToReturn.model}, ram-->${objToReturn.ram}, rom-->${objToReturn.rom}, `,
        "-->"
      );
      const customStringToObj2 = parseStringToObj(
        `name=>>${objToReturn.name} | model=>>${objToReturn.model} | ram=>>${objToReturn.ram} | rom=>>${objToReturn.rom} | `,
        "=>>",
        " | "
      );

      expect(defaultStringToObj.name).toEqual(objToReturn.name);
      expect(defaultStringToObj.model).toEqual(objToReturn.model);
      expect(defaultStringToObj.ram).toEqual(objToReturn.ram);
      expect(defaultStringToObj.rom).toEqual(objToReturn.rom);

      expect(customStringToObj1.name).toEqual(objToReturn.name);
      expect(customStringToObj1.model).toEqual(objToReturn.model);
      expect(customStringToObj1.ram).toEqual(objToReturn.ram);
      expect(customStringToObj1.rom).toEqual(objToReturn.rom);

      expect(customStringToObj2.name).toEqual(objToReturn.name);
      expect(customStringToObj2.model).toEqual(objToReturn.model);
      expect(customStringToObj2.ram).toEqual(objToReturn.ram);
      expect(customStringToObj2.rom).toEqual(objToReturn.rom);
    });
  });
  describe("Test cases for the 'validateLocationObject' method", () => {
    test("Should return invalid if a non array value passed to the 'location' parameter", async () => {
      const objParamReturnValue = validateLocationObject([] as any);
      const intParamReturnValue = validateLocationObject(90 as any);
      const strParamReturnValue = validateLocationObject("Hello" as any);
      const boolParamReturnValue = validateLocationObject(true as any);

      expect(objParamReturnValue.valid).toBe(false);
      expect(objParamReturnValue.format()).toMatch(
        /expected.*'location'.*object.*'array'/i
      );
      expect(intParamReturnValue.valid).toBe(false);
      expect(intParamReturnValue.format()).toMatch(
        /expected.*'location'.*object.*'number'/i
      );
      expect(strParamReturnValue.valid).toBe(false);
      expect(strParamReturnValue.format()).toMatch(
        /expected.*'location'.*object.*'string'/i
      );
      expect(boolParamReturnValue.valid).toBe(false);
      expect(boolParamReturnValue.format()).toMatch(
        /expected.*'location'.*object.*'boolean'/i
      );
    });
    test("Should return invalid if an invalid schema is passed to the 'location' parameter", () => {
      const returnValue1 = validateLocationObject({ lat: 890 } as any);
      const returnValue2 = validateLocationObject({ lng: 890 } as any);
      const returnValue3 = validateLocationObject({} as any);
      const returnValue4 = validateLocationObject({ kin: 908 } as any);

      expect(returnValue1.valid).toBe(false);
      expect(returnValue2.valid).toBe(false);
      expect(returnValue3.valid).toBe(false);
      expect(returnValue4.valid).toBe(false);
    });
    test("Should return valid if an valid schema list is passed to the 'location' parameter", () => {
      const returnValue = validateLocationObject(
        new UserLocationClass(789, 908)
      );

      expect(returnValue.valid).toBe(true);
    });
  });
  describe("Test cases for the 'validateToken' method", () => {
    const authData = {
      user_ID: "650106e8961c0cbcc4d2f01f",
      user_role: "orphanage",
    };
    const postMockImplementation = (
      url: string,
      data: Record<string, any>,
      config: AxiosRequestConfig,
      returnType?: "refreshed_token" | "verified_token"
    ) => {
      if (returnType === "refreshed_token") {
        if (
          config?.headers?.Cookie &&
          parseStringToObj(config?.headers?.Cookie, "=", "; ").refresh_token
        ) {
          const refresh_token = parseStringToObj(
            config?.headers?.Cookie,
            "=",
            "; "
          ).refresh_token;

          if (typeof refresh_token !== "string") {
            throw new Error("Unauthorized: No refresh_token cookie");
          }

          return {
            status: 200,
            data: {
              user_ID: authData.user_ID,
              user_role: authData.user_role,
              tokens: {
                access_token: "abc",
                refresh_token: "efg",
              },
            },
          };
        } else {
          if (!Object.keys(config?.headers as any)?.includes("Refresh-token"))
            throw new Error("Unauthorized: No Refresh-token header");
          const refresh_token = config?.headers?.["Refresh-token"];
          if (typeof refresh_token !== "string")
            throw new Error("Unauthorized: Invalid Refresh-token");
        }

        return {
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
            tokens: {
              access_token: "abc",
              refresh_token: "efg",
            },
          },
        };
      } else {
        if (
          config?.headers?.Cookie &&
          parseStringToObj(config?.headers?.Cookie, "=", "; ").access_token
        ) {
          const access_token = parseStringToObj(
            config?.headers?.Cookie,
            "=",
            "; "
          ).access_token;

          if (typeof access_token !== "string") {
            throw new Error("Unauthorized: No aaccess_token cookie");
          }

          // return returnType === "refreshed_token"
          //   ? {
          //       status: 200,
          //       data: {
          //         user_ID: authData.user_ID,
          //         user_role: authData.user_role,
          //         tokens: {
          //           access_token: "abc",
          //           refresh_token: "efg",
          //         },
          //       },
          //     }
          //   : {
          //       status: 200,
          //       data: {
          //         user_ID: authData.user_ID,
          //         user_role: authData.user_role,
          //       },
          //     };
          return {
            status: 200,
            data: {
              user_ID: authData.user_ID,
              user_role: authData.user_role,
            },
          };
        } else {
          if (!Object.keys(config?.headers as any)?.includes("Authorization"))
            throw new Error("Unauthorized: no Authorization");
          const auth = config?.headers?.Authorization;
          if (auth?.split(" ")[0] !== "Bearer")
            throw new Error("Unauthorized: No Bearer");
          if (typeof auth?.split(" ")[1] !== "string")
            throw new Error("Unauthorized: No token");
        }

        return {
          status: 200,
          data: {
            user_ID: authData.user_ID,
            user_role: authData.user_role,
          },
        };
      }
    };
    (axios as any).post.mockImplementation(postMockImplementation);

    test("Should mock remote endpoint and return 200 if a valid token is passed in the request via the 'Authorization' header", async () => {
      const req = {
        headers: {
          authorization: "Bearer abc",
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(200);
      expect(returnValue.message).toMatch(/authorized/i);
    });
    test("Should mock remote endpoint and return 200 if a valid token is passed in the request via the request Cookie", async () => {
      const req = {
        headers: {
          authorization: null,
          cookie: "access_token=abc;",
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(200);
      expect(returnValue.message).toMatch(/authorized/i);
    });
    test("Should mock remote endpoint and return 401 if no token is passed in the request via the 'Authorization' header", async () => {
      const req = {
        headers: {
          // authorization: "Bearer abc",
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(401);
      expect(returnValue.message).toMatch(/unauthorized/i);
    });
    test("Should mock remote endpoint and return 401 if an invalid token is passed in the request via the 'Authorization' header", async () => {
      const req = {
        headers: {
          authorization: null,
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(401);
      expect(returnValue.message).toMatch(/unauthorized/i);
    });
    test("Should mock remote endpoint and return 401 if no token is passed in the request via the request Cookie", async () => {
      const req = {
        headers: {
          authorization: null,
          cookie: "access_tok=abc",
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(401);
      expect(returnValue.message).toMatch(/unauthorized/i);
    });
    test("Should mock remote endpoint and return 401 if no token is passed in the request via the request Cookie nor request 'Authorization' header", async () => {
      const req = {
        headers: {} as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(401);
      expect(returnValue.message).toMatch(/unauthorized/i);
    });
    test("Should mock remote endpoint, return 200 and update the request header with the appropriate parameters if a valid token is passed in the request", async () => {
      const req = {
        headers: {
          cookie: "access_token=abc;",
        } as any,
      } as Request;
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(200);
      expect((req as any).headers?.user_ID).toBe(authData.user_ID);
      expect((req as any).headers?.user_role).toBe(authData.user_role);
    });
    test("Should mock remote endpoint, return 401 if no refresh token is passed in the request", async () => {
      (axios as any).post.mockImplementation(
        (url: string, data: Record<string, any>, config: AxiosRequestConfig) =>
          postMockImplementation(url, data, config, "refreshed_token")
      );

      const req = {
        headers: {
          cookie: "access_token=abc;",
          authorization: "Bearer abc",
        } as any,
      } as Request;
      const resHeaders: Record<string, any> = {
        cookie: [],
      };
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
        headers: resHeaders,
        ...({
          cookie: (key: string, value: string) => {
            resHeaders.cookie?.push(`${key}=${value}` as never);
          },
        } as any),
        setHeader: (key, value) => {
          resHeaders[key] = value;
        },
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(401);
      expect(returnValue.message).toMatch(/unauthorized/i);
      expect((res as any).headers.cookie?.length).toBe(0);
    });
    test("Should mock remote endpoint, return 200 and update the request header cookies with the tokens if a valid refresh token is passed in the request via Cookie", async () => {
      (axios as any).post.mockImplementation(
        (url: string, data: Record<string, any>, config: AxiosRequestConfig) =>
          postMockImplementation(url, data, config, "refreshed_token")
      );

      const req = {
        headers: {
          cookie: "refresh_token=efg;",
        } as any,
      } as Request;
      const resHeaders: Record<string, any> = {
        cookie: [],
      };
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
        headers: resHeaders,
        ...({
          cookie: (key: string, value: string) => {
            resHeaders.cookie?.push(`${key}=${value}` as never);
          },
        } as any),
        setHeader: (key, value) => {
          resHeaders[key] = value;
        },
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(200);
      expect((res as any).headers.cookie?.[0]).toBe("access_token=abc");
      expect((res as any).headers.cookie?.[1]).toBe("refresh_token=efg");
      expect((res as any).headers?.["Access-token"]).toBe("abc");
      expect((res as any).headers?.["Refresh-token"]).toBe("efg");
    });
    test("Should mock remote endpoint, return 200 and update the request header cookies with the tokens if a valid refresh token is passed in the request via the 'Refresh-token' header", async () => {
      (axios as any).post.mockImplementation(
        (url: string, data: Record<string, any>, config: AxiosRequestConfig) =>
          postMockImplementation(url, data, config, "refreshed_token")
      );

      const req = {
        headers: {
          ["refresh-token"]: "efg",
        } as any,
      } as Request;
      const resHeaders: Record<string, any> = {
        cookie: [],
      };
      const res = {
        status: (() => {
          return { json: () => {}, text: () => {} };
        }) as any,
        headers: resHeaders,
        ...({
          cookie: (key: string, value: string) => {
            resHeaders.cookie?.push(`${key}=${value}` as never);
          },
        } as any),
        setHeader: (key, value) => {
          resHeaders[key] = value;
        },
      } as Response;
      const next = (() => {
        return null;
      }) as NextFunction;

      const returnValue = await validateToken(req as any, res, next);
      expect(returnValue.code).toBe(200);
      expect((res as any).headers.cookie?.[0]).toBe("access_token=abc");
      expect((res as any).headers.cookie?.[1]).toBe("refresh_token=efg");
      expect((res as any).headers?.["Access-token"]).toBe("abc");
      expect((res as any).headers?.["Refresh-token"]).toBe("efg");
    });
  });
});
