import axios, { AxiosResponse } from "axios";
import { NextFunction, Request, Response } from "express";
import { SocialMediaHandleType, UserAboutDescriptionType } from "../types";
import inspector from "schema-inspector";
import DataURIParser from "datauri/parser";
import path from "path";
import cloudinary from "../models/cloudinary-config";
import { UploadApiOptions } from "cloudinary";

export const apiKey = "09773711f3cd4a50803d85bca6a11ccc";

export class UserDetailsClass {
  constructor(
    public user_id?: string,
    public fullname?: string,
    public phone_number?: string,
    public website?: string,
    public about?: { text: string; raw: string },
    public tagline?: string
  ) {}
}

export class UserLocationClass {
  constructor(public lat: number, public lng: number) {}
}

export class UserSocialMediaHandlesClass {
  constructor(public type: string, public link: string) {}
}
/**
 * Converts a utf-8 string to a base64 string
 * @param value utf-8 string
 * @returns base64 string
 */
export const convertTobase64 = (value: string) =>
  Buffer.from(value).toString("base64");

/**
 * Converts a base64 string to a utf-8 string
 * @param value base64 string
 * @returns utf-8 string
 */
export const convertFrombase64 = (value: string) =>
  Buffer.from(value, "base64").toString("utf-8");

/**
 * Validate if a request comes with a valid api key
 * @param req The express request object
 * @param res The express response object
 * @param next The express next function
 * @returns void
 */
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!Object.keys(req.headers).includes("api-key"))
    return res.status(401).send("Invalid api key");
  if (convertFrombase64(req.headers["api-key"] as any) !== apiKey)
    return res.status(401).send("Invalid api key");

  next();
};

// /**
//  * Validates the properties of an object by removing invalid keys or throwing an error if an invalid key is detected
//  * @param obj The object to validate
//  * @param validKeys The list of keys which are valid
//  * @param options Other options like strict, mutate
//  * @returns A modifed object
//  */
// export const removeInvalidObjectKeys = <T extends Record<any, any>>(
//   obj: T,
//   validKeys: (string | [string, any])[],
//   options?: { strict?: boolean; mutate?: boolean }
// ) => {
//   // Validate the 'obj' parameter type
//   if (typeof obj !== "object")
//     throw new TypeError(
//       `Expected the value passed into the 'obj' parameter to be an object, instead got a '${typeof obj}'`
//     );
//   if (Array.isArray(obj))
//     throw new TypeError(
//       `Expected the value passed into the 'obj' parameter to be an object, instead got an 'array'`
//     );
//   // Validate the 'valid' parameter type
//   if (!Array.isArray(validKeys))
//     throw new TypeError(
//       `Expected the value passed into the 'keys' parameter to be an array, instead got an '${typeof validKeys}'`
//     );

//   const invalidKeys: string[] = [];
//   const newObj = { ...obj };

//   // Loop through all keys in 'obj'
//   for (const key in newObj) {
//     // If the current key is an array
//     if (Array.isArray(key)) {
//       const objToAdd = options?.mutate ? obj[key[0]] : newObj[key[0]];
//       removeInvalidObjectKeys(objToAdd, key[1], { ...options, mutate: true });
//     }
//     // if the current key is a string
//     else if (typeof key === "string") {
//       // If the current key is not in the list of valid keys
//       if (!validKeys.includes(key)) {
//         // If the strict option is truthy, append to the invalid keys list
//         if (options?.strict) {
//           invalidKeys.push(key);
//           continue;
//         }

//         // If the mutate option was set to true, modify the object passed into the 'obj' parameter
//         if (options?.mutate) delete obj[key];
//         // If the mutate option is falsy, do not modify the opject passed into the 'obj' parameter, instead modify the copied object
//         else delete newObj[key];
//       }
//     }
//     // if the current key is neither an array nor an object
//     else
//       throw new Error(
//         `Expected the '${key}' key to be a 'string', but got a '${typeof key}' instead`
//       );
//   }

//   // If the strict option is truthy and the list of invalid keys contains one or more elements, throw an error
//   if (options?.strict && invalidKeys.length > 0)
//     throw new Error(
//       `Expected only the following properties in the object: ${validKeys
//         .map((key) => `'${key}'`)
//         .join(
//           ", "
//         )}; But, received the following additional properties: ${invalidKeys
//         .map((key) => `'${key}'`)
//         .join(", ")}`
//     );

//   return options?.mutate ? obj : newObj;
// };

/**
 * A function for validating the data passed to the update and edit social media handles endpoint
 * @param socialMediaHandles A list of object matching the following schema - {type: "", link: ""}
 * @returns an object containing result of the parameter passed has the valid schema, and the error/success message
 */
export const validateSocialMediaHandlesList = (
  socialMediaHandles: SocialMediaHandleType[]
): { valid: boolean; format: Function } => {
  // If the value passed into the socialMediaHandles paremeter is not a valid array
  if (!Array.isArray(socialMediaHandles))
    return {
      valid: false,
      format: () =>
        `Expected the parameter passed to the 'socialMediaHandles' parameter to ba an array, but got a '${typeof socialMediaHandles}' instead`,
    };

  const typesSet = new Set();
  const duplicateKeys: string[] = [];
  // Search for duplicate type properties in the social media handles list
  for (const handle of socialMediaHandles) {
    if (typesSet.has(handle.type)) {
      // TODO: append to duplicateKeys
      duplicateKeys.push(handle.type);
    } else {
      typesSet.add(handle.type);
    }
  }
  // If the social media handles list has duplicate type properties
  if (duplicateKeys.length > 0) {
    // return invalid schema
    return {
      valid: false,
      format: () =>
        `The 'type' property is not unique, duplicates are ${duplicateKeys
          .map((type) => `'${type}'`)
          .join(", ")}`,
    };
  }

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: { type: "string" },
        link: { type: "string" },
      },
    },
  };

  const result = inspector.validate(schema, socialMediaHandles);

  return result;
};

/**
 * A function for validating the data passed to the update location endpoint
 * @param socialMediaHandles An object matching the following schema - {lat: number, lng: number}
 * @returns an object containing result of the parameter passed has the valid schema, and the error/success message
 */
export const validateLocationObject = (
  location: UserLocationClass
): { valid: boolean; format: Function } => {
  // If the value passed into the socialMediaHandles paremeter is not a valid object
  if (typeof location !== "object")
    return {
      valid: false,
      format: () =>
        `Expected the parameter passed to the 'location' parameter to ba a object, but got a '${typeof location}' instead`,
    };
  if (Array.isArray(location))
    return {
      valid: false,
      format: () =>
        `Expected the parameter passed to the 'location' parameter to ba a object, but got an 'array' instead`,
    };

  const schema = {
    type: "object",
    properties: {
      lat: {
        type: "number",
      },
      lng: {
        type: "number",
      },
    },
  };

  const result = inspector.validate(schema, location);

  return result;
};

/**
 * A function for validating the data passed to the update about description endpoint
 * @param data An object matching the following schema - {text: string, raw: string}
 * @returns an object containing result of the parameter passed has the valid schema, and the error/success message
 */
export const validateAboutDescriptionObject = (
  data: UserAboutDescriptionType
): { valid: boolean; format: Function } => {
  // If the value passed into the data paremeter is not a valid object
  if (typeof data !== "object")
    return {
      valid: false,
      format: () =>
        `Expected the parameter passed to the 'data' parameter to ba an object, but got a '${typeof data}' instead`,
    };
  if (Array.isArray(data))
    return {
      valid: false,
      format: () =>
        `Expected the parameter passed to the 'data' parameter to ba a object, but got an 'array' instead`,
    };

  const schema = {
    type: "object",
    properties: {
      text: {
        type: "string",
      },
      raw: {
        type: "string",
      },
    },
  };

  const result = inspector.validate(schema, data);

  return result;
};

/**
 * Converts a string to an object
 * @example parseStringToObj("name=Prince, age=17, stack=Js") --> {name: "Prince", age: "17", stack: "Js"}
 * @example parseStringToObj("name+Prince, age+17, stack+Js", "+") --> {name: "Prince", age: "17", stack: "Js"}
 * @example parseStringToObj("name+Prince;age+17;stack+Js", "+", ";") --> {name: "Prince", age: "17", stack: "Js"}
 * @example parseStringToObj("name=Prince;age=17;stack=Js", undefined, ";") --> {name: "Prince", age: "17", stack: "Js"}
 * @param str The string to be converted to an object
 * @param keyValueSeperator The seperator between a key and value pair
 * @param delimiter The seperator between multiple key-value pairs
 * @returns A string
 */
export const parseStringToObj = (
  str: string,
  keyValueSeperator?: string,
  delimiter?: string
) => {
  // Validate the 'str' parameter type
  if (typeof str !== "string")
    throw new TypeError(
      `Expected the value passed into the 'str' parameter to be a string, instead got a '${typeof str}'`
    );

  let returnValue: Record<string, string> = {};

  const strToArr = str.split(delimiter || ", ");
  for (const keyValue of strToArr) {
    const key = keyValue.split(keyValueSeperator || "=")[0];
    const value = keyValue.split(keyValueSeperator || "=")[1];

    returnValue[key] = value;
  }

  return returnValue;
};

/**
 * Converts an object to a string of it's keys and values
 * @example parseObjToString({name: "Prince", age: "17", stack: "Js"}) --> "name=Prince, age=17, stack=Js"
 * @example parseObjToString({name: "Prince", age: "17", stack: "Js"}, "+") --> "name+Prince, age+17, stack+Js"
 * @example parseObjToString({name: "Prince", age: "17", stack: "Js"}, "+", ";") --> "name+Prince;age+17;stack+Js"
 * @example parseObjToString({name: "Prince", age: "17", stack: "Js"}, undefined, ";") --> "name=Prince;age=17;stack=Js"
 * @param obj The object to be converted to a string
 * @param keyValueSeperator The seperator between a key and value pair
 * @param delimiter The seperator between multiple key-value pairs
 * @returns A string
 */
export const parseObjToString = (
  obj: Record<any, any>,
  keyValueSeperator?: string,
  delimiter?: string
) => {
  // Validate the 'obj' parameter type
  if (typeof obj !== "object")
    throw new TypeError(
      `Expected the value passed into the 'obj' parameter to be an object, instead got a '${typeof obj}'`
    );
  if (Array.isArray(obj))
    throw new TypeError(
      `Expected the value passed into the 'obj' parameter to be an object, instead got an 'array'`
    );

  let returnValue = "";

  for (const key in obj) {
    returnValue += `${key}${keyValueSeperator || "="}${obj[key]}${
      delimiter || ", "
    }`;
  }
  return returnValue;
};

/**
 * Validate if a request comes with a valid access token
 * @example validateToken(request, response, next)
 * @param req The express request object
 * @param res The express response object
 * @param next The express next function
 * @returns an object containing response code and message
 */
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<{ code: number; message: string }> => {
  let response: AxiosResponse<any, any>;
  try {
    response = await axios.post(
      `${process.env.AUTH_SERVER_HOST}/v1/token/validate`,
      undefined,
      {
        headers: {
          ...(req.headers.authorization
            ? { Authorization: req.headers.authorization }
            : {}),
          ...(req.headers["refresh-token"]
            ? { ["Refresh-token"]: req.headers["refresh-token"] }
            : {}),
          Cookie:
            req.headers.cookie ||
            parseObjToString(req.cookies || {}, "=", "; "),
          "Api-key": convertTobase64(process.env.AUTH_SERVER_API_KEY || ""),
        },
      }
    );

    // Return unauthorized if the response status code is neither 200 nor 201
    if (response.status !== 200 && response.status !== 201) {
      res.status(401).json("Unauthorized");
      return { code: 401, message: `unauthorized from endpoint` };
    }

    // Set the user ID and user role in th request header
    req.headers.user_ID = response.data.user_ID;
    req.headers.user_role = response.data.user_role;

    // Set the access and refresh tokens as cookies
    response.data.tokens?.access_token &&
      res.cookie("access_token", response.data.tokens.access_token, {
        path: "/",
        domain: process.env.API_DOMAIN,
        httpOnly: false,
        secure: true,
      });
    response.data.tokens?.refresh_token &&
      res.cookie("refresh_token", response.data.tokens.refresh_token, {
        path: "/",
        domain: process.env.API_DOMAIN,
        httpOnly: false,
        secure: true,
      });

    // Set the access and refresh tokens as response headers
    response.data.tokens?.access_token &&
      res.setHeader("Access-token", response.data.tokens.access_token);
    response.data.tokens?.refresh_token &&
      res.setHeader("Refresh-token", response.data.tokens.refresh_token);

    next();
    return { code: 200, message: "authorized" };
  } catch (e: any) {
    console.log("ERROR ", e?.response?.data || e?.message || e);
    // TODO:
    res.status(401).json("Unauthorized");
    return { code: 401, message: `unauthorized from error, ${e.message}` };
  }
  // TODO:
  res.status(401).json("Unauthorized");
  return { code: 401, message: `unauthorized from error` };
};

/**
 * Validate if a request comes with a valid access token
 * @example validateTokenWithoutError(request, response, next)
 * @param req The express request object
 * @param res The express response object
 * @param next The express next function
 * @returns an object containing response code and message
 */
export const validateTokenWithoutError = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<{ code: number; message: string }> => {
  let response: AxiosResponse<any, any>;
  req.headers.user_ID && delete req.headers.user_ID;
  try {
    response = await axios.post(
      `${process.env.AUTH_SERVER_HOST}/v1/token/validate`,
      undefined,
      {
        headers: {
          ...(req.headers.authorization
            ? { Authorization: req.headers.authorization }
            : {}),
          ...(req.headers["refresh-token"]
            ? { ["Refresh-token"]: req.headers["refresh-token"] }
            : {}),
          Cookie:
            req.headers.cookie ||
            parseObjToString(req.cookies || {}, "=", "; "),
          "Api-key": convertTobase64(process.env.AUTH_SERVER_API_KEY || ""),
        },
      }
    );

    // Return unauthorized if the response status code is neither 200 nor 201
    if (response.status !== 200 && response.status !== 201) {
      req.headers.user_ID && delete req.headers.user_ID;
      next();
      return { code: 401, message: `unauthorized from endpoint` };
    }

    // Set the user ID and user role in th request header
    req.headers.user_ID = response.data.user_ID;
    req.headers.user_role = response.data.user_role;

    // Set the access and refresh tokens as cookies
    response.data.tokens?.access_token &&
      res.cookie("access_token", response.data.tokens.access_token, {
        path: "/",
        domain: process.env.API_DOMAIN,
        httpOnly: false,
        secure: true,
      });
    response.data.tokens?.refresh_token &&
      res.cookie("refresh_token", response.data.tokens.refresh_token, {
        path: "/",
        domain: process.env.API_DOMAIN,
        httpOnly: false,
        secure: true,
      });

    // Set the access and refresh tokens as response headers
    response.data.tokens?.access_token &&
      res.setHeader("Access-token", response.data.tokens.access_token);
    response.data.tokens?.refresh_token &&
      res.setHeader("Refresh-token", response.data.tokens.refresh_token);

    next();
    return { code: 200, message: "authorized" };
  } catch (e: any) {
    console.log("ERROR ", e?.response?.data || e?.message || e);
    req.headers.user_ID && delete req.headers.user_ID;
    next();
    return { code: 401, message: `unauthorized from error, ${e.message}` };
  }
};

/**
 * A function to wait for an event
 * @param seconds Number of seconds the function should wait
 * @returns void
 */
export const waitFor = (seconds: number): Promise<void> => {
  const promise = new Promise<void>((resolve) =>
    setTimeout(resolve, 1000 * seconds)
  );
  return promise;
};

/**
 * Uploads a file to cloudinary object storage
 * @param file The file to be uploaded, typically a multer object
 * @param options The options configuration containing the folder, resource_type, etc...
 * @returns object
 */
export const uploadFileToCloudinary = async (
  file: Express.Multer.File,
  options?: UploadApiOptions
) => {
  const parser = new DataURIParser();
  const base64File = parser.format(
    path.extname(file.originalname).toString(),
    file.buffer
  );

  if (base64File && base64File.content) {
    return await cloudinary.uploader.upload(base64File.content, {
      resource_type: "image",
      ...options,
    });
  } else {
    throw new Error("Couldn't upload file to object storage");
  }
};
