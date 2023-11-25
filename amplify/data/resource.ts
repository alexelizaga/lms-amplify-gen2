import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      done: a.boolean(),
      priority: a.enum(["low", "medium", "high"]),
    })
    .authorization([a.allow.owner()]),
  Course: a
    .model({
      userId: a.id().required(),
      title: a.string().required(),
      description: a.string(),
      image: a.string(),
      price: a.float(),
      isPublished: a.boolean().default(false),
      category: a.belongsTo("Category"),
    })
    .authorization([a.allow.owner()]),
  Category: a
    .model({
      icon: a.string(),
      name: a.string().required(),
      courses: a.hasMany("Course"),
    })
    .authorization([a.allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
