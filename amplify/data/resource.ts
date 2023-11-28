import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      done: a.boolean(),
      priority: a.string(),
    })
    .authorization([a.allow.owner()]),
  Course: a
    .model({
      courseId: a.id().required(),
      userId: a.id().required(),
      title: a.string().required(),
      description: a.string(),
      image: a.string(),
      imageUrl: a.string(),
      video: a.string(),
      videoUrl: a.string(),
      videoProvider: a.string(),
      price: a.float(),
      isPublished: a.boolean().default(false),
      category: a.belongsTo("Category"),
    })
    .identifier(["courseId", "userId"])
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
  Category: a
    .model({
      icon: a.string(),
      name: a.string().required(),
      courses: a.hasMany("Course"),
    })
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
