// import { Contract } from "lib/SmartWeaver/mod.ts";
// import { describe, expect, test } from "vitest";

// class User {
//   readonly name: string;

//   constructor(name: string) {
//     this.name = name;
//   }
// }

// class ObjWithPrivateField {
//   #dom = [
//     { nested: "fields" },
//   ];
// }

// class ObjWithProtectedNestedFields {
//   protected dom = [
//     new ObjWithPrivateField(),
//     "this should show up",
//   ];
// }

// const state = {
//   users: [
//     new User("crookse"),
//   ],
//   protected_obj: new ObjWithProtectedNestedFields(),
//   private_obj: new ObjWithPrivateField(),
// };

// describe("methods", () => {
//   describe("json()", () => {
//     // test("returns a JSON representation of the state", async () => {
//     //   const expected = {
//     //     users: [
//     //       { name: "crookse" },
//     //     ],
//     //     protected_obj: {
//     //       dom: [
//     //         {}, // Private object
//     //         "this should show up",
//     //       ],
//     //     },
//     //     private_obj: {},
//     //   };

//     //   const actual = contract().store(state).json();

//     //   expect(actual).toStrictEqual(expected);
//     // });

//     // test("returns a JSON representation of multiple states", () => {
//     //   const expected = {
//     //     l1a: {
//     //       l2a: {},
//     //       l2b: {
//     //         l3a: { hello: "test" },
//     //       },
//     //     },
//     //   };

//     //   const state = contract().store({
//     //     l1a: {
//     //       l2a: contract().store({}),
//     //       l2b: contract().store({
//     //         l3a: { hello: "test" },
//     //       }),
//     //     },
//     //   });

//     //   const actual = state.json();

//     //   expect(actual).toStrictEqual(expected);
//     // });
//   });

//   describe("text()", () => {
//     test("returns a string representation of the state", async () => {
//       const expected = JSON.stringify({
//         users: [
//           { name: "crookse" },
//         ],
//         protected_obj: {
//           dom: [
//             {}, // Private object
//             "this should show up",
//           ],
//         },
//         private_obj: {},
//       });

//       // const actual = contract().store(state).text();

//       // expect(actual).toStrictEqual(expected);
//     });
//   });
// });
