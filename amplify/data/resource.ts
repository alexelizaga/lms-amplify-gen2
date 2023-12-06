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
      price: a.float(),
      isPublished: a.boolean().default(false),
      category: a.belongsTo("Category"),
      chapters: a.hasMany("Chapter"),
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
  Chapter: a
    .model({
      title: a.string().required(),
      description: a.string(),
      video: a.string(),
      streamUrl: a.string(),
      streamStartTime: a.string(),
      streamEndTime: a.string(),
      position: a.integer().required(),
      isPublished: a.boolean().default(false),
      isFree: a.boolean().default(false),
      course: a.belongsTo("Course"),
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
