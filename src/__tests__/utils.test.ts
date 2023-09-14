// import { removeInvalidObjectKeys } from "../utils/utils";

import {
  parseObjToString,
  validateSocialMediaHandlesList,
} from "../utils/utils";

// describe("Test cases for the utils functions/module", () => {
//   describe("Test cases for the removeInvalidObjectKeys method", () => {
//     test("Should return modified object by removing excess keys", () => {
//       const obj = removeInvalidObjectKeys(
//         {
//           first_name: "Prince",
//           last_name: "Onukwili",
//           age: 17,
//           email: "test@test.com",
//         },
//         ["first_name", "age"]
//       );

//       expect(obj.first_name).toEqual("Prince");
//       expect(obj.age).toEqual(17);
//       expect(obj.last_name).toBe(undefined);
//       expect(obj.email).toBe(undefined);
//     });
//     test("Should throw error if excess keys exist", () => {
//       const obj = {
//         first_name: "Prince",
//         last_name: "Onukwili",
//         age: 17,
//         email: "test@test.com",
//       };
//       expect(() =>
//         removeInvalidObjectKeys(obj, ["first_name", "email"], { strict: true })
//       ).toThrowError(
//         Error(
//           "Expected only the following properties in the object: 'first_name', 'email'; But, received the following additional properties: 'last_name', 'age'"
//         )
//       );
//     });
//     test("Should modify object passed into the 'obj' parameter by removing excess keys if the 'mutate' option is truthy", () => {
//       const obj = {
//         first_name: "Prince",
//         last_name: "Onukwili",
//         age: 17,
//         email: "test@test.com",
//       };
//       removeInvalidObjectKeys(obj, ["last_name", "age"], { mutate: true });

//       expect(obj.first_name).toEqual(undefined);
//       expect(obj.age).toEqual(17);
//       expect(obj.last_name).toBe("Onukwili");
//       expect(obj.email).toBe(undefined);
//     });
//     test("Should return modified object with nested objects by removing excess keys", () => {
//       const obj = removeInvalidObjectKeys(
//         {
//           first_name: "Prince",
//           last_name: "Onukwili",
//           age: 19,
//           email: "test@test.com",
//           location: {
//             address: "123 some street",
//             lat: 89,
//             lng: 76,
//             circle: {
//               radius: 1,
//               color: "white",
//             },
//           },
//         },
//         [
//           "first_name",
//           "age",
//           ["location", ["lat", "lng", ["circle", ["radius"]]]],
//         ]
//       );

//       expect(obj.first_name).toEqual("Prince");
//       expect(obj.age).toEqual(19);
//       expect(obj.last_name).toBe(undefined);
//       expect(obj.email).toBe(undefined);
//       expect(obj.location.address).toBe(undefined);
//       expect(obj.location.lat).toBe(89);
//       expect(obj.location.lng).toBe(76);
//       expect(obj.location.circle.radius).toBe(1);
//       expect(obj.location.circle.color).toBe(undefined);
//     });
//   });
// });

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
  describe("Test cases for the 'validateToken' method", () => {});
});
