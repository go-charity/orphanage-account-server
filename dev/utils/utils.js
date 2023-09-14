"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitFor = exports.validateToken = exports.parseObjToString = exports.validateSocialMediaHandlesList = exports.validateApiKey = exports.convertFrombase64 = exports.convertTobase64 = exports.UserDetailsClass = exports.apiKey = void 0;
const axios_1 = __importDefault(require("axios"));
const schema_inspector_1 = __importDefault(require("schema-inspector"));
exports.apiKey = "09773711f3cd4a50803d85bca6a11ccc";
class UserDetailsClass {
    constructor(user_id, fullname, phone_number, location, social_media_handles, website, image) {
        this.user_id = user_id;
        this.fullname = fullname;
        this.phone_number = phone_number;
        this.location = location;
        this.social_media_handles = social_media_handles;
        this.website = website;
        this.image = image;
    }
}
exports.UserDetailsClass = UserDetailsClass;
/**
 * Converts a utf-8 string to a base64 string
 * @param value utf-8 string
 * @returns base64 string
 */
const convertTobase64 = (value) => Buffer.from(value).toString("base64");
exports.convertTobase64 = convertTobase64;
/**
 * Converts a base64 string to a utf-8 string
 * @param value base64 string
 * @returns utf-8 string
 */
const convertFrombase64 = (value) => Buffer.from(value, "base64").toString("utf-8");
exports.convertFrombase64 = convertFrombase64;
/**
 * Validate if a request comes with a valid api key
 * @param req The express request object
 * @param res The express response object
 * @param next The express next function
 * @returns void
 */
const validateApiKey = (req, res, next) => {
    if (!Object.keys(req.headers).includes("api-key"))
        return res.status(401).json("Invalid api key");
    if ((0, exports.convertFrombase64)(req.headers["api-key"]) !== exports.apiKey)
        return res.status(401).json("Invalid api key");
    next();
};
exports.validateApiKey = validateApiKey;
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
const validateSocialMediaHandlesList = (socialMediaHandles) => {
    // If the value passed into the socialMediaHandles paremeter is not a valid array
    if (!Array.isArray(socialMediaHandles))
        return {
            valid: false,
            format: () => `Expected the parameter passed to the 'socialMediaHandles' parameter to ba an array, but got a '${typeof socialMediaHandles}' instead`,
        };
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
    const result = schema_inspector_1.default.validate(schema, socialMediaHandles);
    return result;
};
exports.validateSocialMediaHandlesList = validateSocialMediaHandlesList;
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
const parseObjToString = (obj, keyValueSeperator, delimiter) => {
    // Validate the 'obj' parameter type
    if (typeof obj !== "object")
        throw new TypeError(`Expected the value passed into the 'obj' parameter to be an object, instead got a '${typeof obj}'`);
    if (Array.isArray(obj))
        throw new TypeError(`Expected the value passed into the 'obj' parameter to be an object, instead got an 'array'`);
    let returnValue = "";
    for (const key in obj) {
        returnValue += `${key}${keyValueSeperator || "="}${obj[key]}${delimiter || ", "}`;
    }
    return returnValue;
};
exports.parseObjToString = parseObjToString;
/**
 * Validate if a request comes with a valid access token
 * @param req The express request object
 * @param res The express response object
 * @param next The express next function
 * @returns void
 */
const validateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let response;
    try {
        response = yield axios_1.default.post(`${process.env.AUTH_SERVER_HOST}/v1/token/validate`, undefined, {
            headers: Object.assign(Object.assign(Object.assign({}, (req.headers.authorization
                ? { Authorization: req.headers.authorization }
                : {})), (req.headers["refresh-token"]
                ? { ["Refresh-token"]: req.headers["refresh-token"] }
                : {})), { Cookie: req.headers.cookie ||
                    (0, exports.parseObjToString)(req.cookies || {}, "=", "; "), "Api-key": (0, exports.convertTobase64)(process.env.AUTH_SERVER_API_KEY || "") }),
        });
        // Return unauthorized if the response status code is neither 200 nor 201
        if (response.status !== 200 && response.status !== 201)
            return res.status(401).json("Unauthorized");
        // Set the user ID and user role in th request header
        req.headers.user_ID = response.data.user_ID;
        req.headers.user_role = response.data.user_role;
        // Set the access and refresh tokens as cookies
        ((_a = response.data.tokens) === null || _a === void 0 ? void 0 : _a.access_token) &&
            res.cookie("access_token", response.data.tokens.access_token, {
                path: "/",
                domain: process.env.API_DOMAIN,
                httpOnly: true,
                secure: true,
            });
        ((_b = response.data.tokens) === null || _b === void 0 ? void 0 : _b.refresh_token) &&
            res.cookie("refresh_token", response.data.tokens.refresh_token, {
                path: "/",
                domain: process.env.API_DOMAIN,
                httpOnly: true,
                secure: true,
            });
        // Set the access and refresh tokens as response headers
        ((_c = response.data.tokens) === null || _c === void 0 ? void 0 : _c.access_token) &&
            res.setHeader("Access-token", response.data.tokens.access_token);
        ((_d = response.data.tokens) === null || _d === void 0 ? void 0 : _d.refresh_token) &&
            res.setHeader("Refresh-token", response.data.tokens.refresh_token);
        return next();
    }
    catch (e) {
        console.log("ERROR ", e);
        // TODO:
        return res.status(401).json("Unauthorized");
    }
    // TODO:
    return res.status(401).json("Unauthorized");
});
exports.validateToken = validateToken;
/**
 * A function to wait for an event
 * @param seconds Number of seconds the function should wait
 * @returns void
 */
const waitFor = (seconds) => {
    const promise = new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    return promise;
};
exports.waitFor = waitFor;
